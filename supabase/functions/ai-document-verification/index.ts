import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentAnalysis {
  documentTypeMatch: boolean;
  extractedInfo: {
    holderName?: string;
    issuingAuthority?: string;
    issueDate?: string;
    expiryDate?: string;
    documentNumber?: string;
  };
  qualityAssessment: {
    isReadable: boolean;
    isComplete: boolean;
    hasWatermarks: boolean;
  };
  issues: string[];
  confidenceScore: number;
  shouldFlag: boolean;
  flagReasons: string[];
  recommendation: 'approve' | 'review' | 'reject';
  summary: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentUrl, documentType, fileName } = await req.json();

    if (!documentUrl || !documentType) {
      throw new Error('Document URL and type are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Analyzing document: ${documentType} - ${fileName}`);

    const systemPrompt = `You are an expert document verification analyst for a fitness coaching platform. Your task is to analyze uploaded verification documents from coaches.

You will receive an image/document and must analyze it thoroughly to verify:
1. Document authenticity and type matching
2. Readability and quality
3. Information extraction
4. Potential issues or red flags

Document type expected: ${documentType}

Document types and what to look for:
- identity: Government-issued ID (passport, driver's license, national ID). Check for name, photo, expiry date, document number.
- certification: Fitness/coaching certifications (PT certification, nutrition certification, etc). Check for name, issuing body, date, certification type.
- insurance: Professional liability/indemnity insurance. Check for policy holder, coverage type, validity dates, insurer name.
- qualification: Educational qualifications (degrees, diplomas). Check for name, institution, date, qualification type.

You must respond with a JSON object (and ONLY the JSON object, no markdown formatting) containing:
{
  "documentTypeMatch": boolean (does the document match the expected type?),
  "extractedInfo": {
    "holderName": string or null,
    "issuingAuthority": string or null,
    "issueDate": string or null,
    "expiryDate": string or null,
    "documentNumber": string or null
  },
  "qualityAssessment": {
    "isReadable": boolean (is text clearly legible?),
    "isComplete": boolean (is the full document visible?),
    "hasWatermarks": boolean (are there suspicious edits/watermarks?)
  },
  "issues": string[] (list any problems found),
  "confidenceScore": number (0-100, how confident are you in authenticity?),
  "shouldFlag": boolean (should this be flagged for manual review?),
  "flagReasons": string[] (why is it flagged?),
  "recommendation": "approve" | "review" | "reject",
  "summary": string (brief human-readable summary)
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this ${documentType} document and provide your verification assessment.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: documentUrl
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI response:', content);

    // Parse the JSON response - handle potential markdown code blocks
    let analysis: DocumentAnalysis;
    try {
      // Remove markdown code blocks if present
      let jsonContent = content.trim();
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.slice(7);
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.slice(3);
      }
      if (jsonContent.endsWith('```')) {
        jsonContent = jsonContent.slice(0, -3);
      }
      jsonContent = jsonContent.trim();
      
      analysis = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return a fallback analysis indicating manual review needed
      analysis = {
        documentTypeMatch: false,
        extractedInfo: {},
        qualityAssessment: {
          isReadable: false,
          isComplete: false,
          hasWatermarks: false,
        },
        issues: ['AI could not analyze document properly'],
        confidenceScore: 0,
        shouldFlag: true,
        flagReasons: ['AI analysis failed - manual review required'],
        recommendation: 'review',
        summary: 'Document could not be analyzed automatically. Manual review required.'
      };
    }

    // Ensure confidence score is within bounds
    analysis.confidenceScore = Math.max(0, Math.min(100, analysis.confidenceScore || 0));

    console.log('Document analysis complete:', analysis.recommendation, 'confidence:', analysis.confidenceScore);

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-document-verification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
