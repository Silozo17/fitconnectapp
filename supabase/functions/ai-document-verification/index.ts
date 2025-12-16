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

// Detailed validation rules for each document type
const documentRules = {
  identity: {
    name: "Government-issued Identity Document",
    required: ['Full legal name', 'Photo of holder', 'Document number', 'Expiry date (if applicable)'],
    accepted: [
      'Passport (any country)',
      'Driver\'s License',
      'National ID Card',
      'Residence Permit',
      'Government-issued photo ID'
    ],
    rejectIf: [
      'Document is expired',
      'Photo is not clearly visible or face is obscured',
      'Name is not readable or partially cut off',
      'Document appears digitally altered, edited, or manipulated',
      'Image is a screenshot of another screen',
      'Document is clearly a photocopy with poor quality',
      'Document type cannot be determined',
      'Multiple documents merged or overlapping'
    ],
    flagIf: [
      'Expiry date is within 3 months',
      'Photo quality is poor but person is still identifiable',
      'Some text is partially obscured but key info is readable',
      'Document is from an unusual or less common country/format',
      'Image has some glare but content is still readable'
    ],
    tips: 'Look for security features like holograms, watermarks, and official seals. Check that the photo matches standard ID photo requirements.'
  },
  certification: {
    name: "Professional Fitness Certification",
    required: ['Holder\'s full name', 'Certification type/title', 'Issuing organization', 'Date of issue or validity'],
    accepted: [
      'REPs (Register of Exercise Professionals) - UK',
      'CIMSPA (Chartered Institute for Sport & Physical Activity) - UK',
      'NASM (National Academy of Sports Medicine)',
      'ACE (American Council on Exercise)',
      'ACSM (American College of Sports Medicine)',
      'ISSA (International Sports Sciences Association)',
      'NSCA (National Strength and Conditioning Association)',
      'Level 2/3/4 Personal Training Certificate (UK)',
      'Nutrition certification from accredited body',
      'Boxing/MMA coaching certification from recognized federation',
      'First Aid certification (supplementary)',
      'Any nationally recognized fitness qualification'
    ],
    rejectIf: [
      'No issuing organization name visible',
      'Certificate appears to be a template or sample document',
      'No date visible anywhere on document',
      'Document is clearly fake or from unrecognizable "diploma mill"',
      'Name on certificate appears manually added after printing',
      'Certificate number format is invalid or suspicious'
    ],
    flagIf: [
      'Certification expired or will expire within 6 months',
      'Issuing body is not in the common recognized list but appears legitimate',
      'CPD (Continuing Professional Development) requirements may not be current',
      'Certificate is in a foreign language requiring verification',
      'Quality makes it hard to verify all details'
    ],
    tips: 'Legitimate certifications typically have certificate numbers, official logos, and sometimes QR codes for verification. REPs and CIMSPA certifications are gold standard in UK.'
  },
  insurance: {
    name: "Professional Liability Insurance",
    required: ['Policy holder name', 'Policy number', 'Coverage type', 'Valid from/to dates', 'Insurance provider name'],
    coverageRequirements: [
      'Professional Indemnity Insurance (recommended minimum £1 million)',
      'Public Liability Insurance (recommended minimum £5 million)',
      'Personal Accident cover (optional but recommended)',
      'Product Liability if selling supplements (optional)'
    ],
    accepted: [
      'Certificate of Insurance from recognized insurer',
      'Insurance Schedule showing coverage details',
      'Policy Summary document with key coverage info',
      'Letter from insurance broker confirming coverage'
    ],
    rejectIf: [
      'Policy is clearly expired (end date in the past)',
      'Document is a quote or proposal, not an active policy',
      'Coverage type is not related to professional liability',
      'Policy holder name doesn\'t match expected name',
      'Insurance provider appears fictitious',
      'Document is just an invoice for premium payment'
    ],
    flagIf: [
      'Policy expiry within 30 days',
      'Coverage amount not clearly stated or below recommended minimum',
      'Unclear if policy specifically covers personal training/coaching activities',
      'Policy is from overseas provider (may need verification)',
      'Document shows "subject to payment" or conditional status'
    ],
    tips: 'UK coaches typically need both Professional Indemnity (covers advice/instruction errors) and Public Liability (covers accidents/injuries). Look for policy schedules that clearly state coverage amounts.'
  },
  qualification: {
    name: "Educational Qualification",
    required: ['Holder\'s full name', 'Institution name', 'Qualification title/type', 'Date of award/completion'],
    accepted: [
      'Degree (BSc, BA, MSc, MA, PhD) in Sports Science, Exercise Science, Kinesiology, Nutrition, Physiotherapy',
      'Diploma in Personal Training, Fitness Instruction, Sports Coaching',
      'NVQ/BTEC Level 2/3/4 in Sport & Fitness',
      'HND/HNC in Sports Science or related field',
      'A-Level or equivalent in PE/Sports Science',
      'University transcript showing relevant modules',
      'Professional diploma from accredited institution',
      'Overseas qualification with equivalency statement'
    ],
    rejectIf: [
      'Document appears to be a work-in-progress or incomplete course',
      'Institution is not recognizable or appears fictitious',
      'Qualification is completely unrelated to fitness/health/coaching',
      'Document is a course brochure or syllabus, not a certificate',
      'No institution seal, signature, or official markings'
    ],
    flagIf: [
      'Qualification from international institution (may need accreditation verification)',
      'Older qualification (10+ years) where field has evolved significantly',
      'Institution name has changed or merged since qualification was issued',
      'Document shows "provisional" or "pending" status',
      'Transcript instead of certificate (acceptable but less formal)'
    ],
    tips: 'Look for official institution seals, registrar signatures, and graduation dates. University qualifications typically include student/alumni numbers for verification.'
  }
};

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

    // Get the specific rules for this document type
    const rules = documentRules[documentType as keyof typeof documentRules];
    if (!rules) {
      throw new Error(`Unknown document type: ${documentType}`);
    }

    const systemPrompt = `You are an expert document verification analyst for a fitness coaching platform in the UK. Your task is to thoroughly analyze uploaded verification documents from coaches applying to be listed on the platform.

## Document Type Being Analyzed: ${rules.name}

## Required Information
The document MUST clearly show:
${rules.required.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## Accepted Document Types
${rules.accepted.map(a => `- ${a}`).join('\n')}

## REJECT the document if ANY of these apply:
${rules.rejectIf.map(r => `- ${r}`).join('\n')}

## FLAG for manual review if ANY of these apply:
${rules.flagIf.map(f => `- ${f}`).join('\n')}

${'coverageRequirements' in rules && rules.coverageRequirements ? `## Coverage Requirements (for insurance):\n${(rules.coverageRequirements as string[]).map((c: string) => `- ${c}`).join('\n')}` : ''}

## Expert Tips
${rules.tips}

## Your Analysis Task
1. First, determine if the uploaded document matches the expected type (${documentType})
2. Extract all visible information (names, dates, numbers, organizations)
3. Assess image quality and readability
4. Check against rejection criteria - if ANY match, recommend REJECT
5. Check against flag criteria - if ANY match, recommend REVIEW
6. If document passes all checks and confidence is high (80%+), recommend APPROVE
7. Be thorough but fair - coaches need these documents to work

## Response Format
You MUST respond with a valid JSON object (no markdown, no code blocks, just raw JSON) containing:
{
  "documentTypeMatch": boolean,
  "extractedInfo": {
    "holderName": string or null,
    "issuingAuthority": string or null,
    "issueDate": string or null,
    "expiryDate": string or null,
    "documentNumber": string or null
  },
  "qualityAssessment": {
    "isReadable": boolean,
    "isComplete": boolean,
    "hasWatermarks": boolean
  },
  "issues": string[],
  "confidenceScore": number (0-100),
  "shouldFlag": boolean,
  "flagReasons": string[],
  "recommendation": "approve" | "review" | "reject",
  "summary": string (2-3 sentence human-readable summary)
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
                text: `Please analyze this ${documentType} document (filename: ${fileName}) and provide your verification assessment. Be thorough and check all the criteria listed in your instructions.`
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
