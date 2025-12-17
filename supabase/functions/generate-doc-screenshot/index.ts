import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Documentation screenshot definitions
const DOC_SCREENSHOTS: Record<string, { prompt: string; filename: string }> = {
  'client-profile-form': {
    prompt: 'A modern dark-themed fitness app profile form with lime green accents. Shows input fields for name, age, weight, height on a dark background (#0D0D14). Clean UI with neon lime (#BEFF00) buttons and purple accents. Professional fitness coaching platform interface. Ultra high resolution.',
    filename: 'client-profile-form.png'
  },
  'client-settings-page': {
    prompt: 'A dark-themed fitness app settings page with lime green accents. Shows tabs for Profile, Privacy, Notifications. Dark background (#0D0D14) with neon lime (#BEFF00) active states. Toggle switches and form fields. Modern athletic app design. Ultra high resolution.',
    filename: 'client-settings-page.png'
  },
  'coach-marketplace': {
    prompt: 'A fitness coach marketplace grid showing coach cards on dark background (#0D0D14). Cards show coach photos, names, specialties with lime green (#BEFF00) badges. Filter sidebar on left. Modern neon aesthetic fitness platform. Ultra high resolution.',
    filename: 'coach-marketplace.png'
  },
  'coach-card': {
    prompt: 'A single fitness coach profile card on dark background. Shows coach photo, name, rating stars, specialties (Personal Training, Nutrition), hourly rate, location. Lime green (#BEFF00) accents on dark (#0D0D14). Verified badge. Ultra high resolution.',
    filename: 'coach-card.png'
  },
  'booking-calendar': {
    prompt: 'A booking calendar interface for fitness sessions. Dark theme (#0D0D14) with lime green (#BEFF00) selected dates. Time slots grid showing available hours. Month navigation. Modern fitness app calendar picker. Ultra high resolution.',
    filename: 'booking-calendar.png'
  },
  'sessions-dashboard': {
    prompt: 'A fitness coaching sessions dashboard showing upcoming sessions list. Dark background (#0D0D14) with lime green (#BEFF00) accents. Session cards with coach name, date, time, video call button. Status badges (Confirmed, Pending). Ultra high resolution.',
    filename: 'sessions-dashboard.png'
  },
  'coach-info-form': {
    prompt: 'A coach profile setup form on dark background (#0D0D14). Fields for bio, specialties checkboxes, hourly rate, experience years. Lime green (#BEFF00) buttons and accents. Modern fitness platform onboarding. Ultra high resolution.',
    filename: 'coach-info-form.png'
  },
  'availability-settings': {
    prompt: 'A weekly availability settings grid for fitness coaches. Dark theme (#0D0D14). Days of week as columns, time slots as rows. Lime green (#BEFF00) for available slots. Toggle switches. Clean scheduling interface. Ultra high resolution.',
    filename: 'availability-settings.png'
  },
  'card-image-upload': {
    prompt: 'An image cropper modal for uploading profile pictures. Dark overlay with centered white modal. Image preview with crop handles. Zoom slider. Lime green (#BEFF00) Save button. Modern fitness app image editor. Ultra high resolution.',
    filename: 'card-image-upload.png'
  },
  'stripe-connect-status': {
    prompt: 'A Stripe payment connection status card on dark background (#0D0D14). Shows connected status with green checkmark, account ID, payout settings. Lime green (#BEFF00) manage button. Financial dashboard card. Ultra high resolution.',
    filename: 'stripe-connect-status.png'
  },
  'earnings-dashboard': {
    prompt: 'A fitness coach earnings dashboard with revenue charts. Dark background (#0D0D14). Line chart showing monthly earnings in lime green (#BEFF00). Stats cards for total revenue, sessions, clients. Purple (#8B5CF6) secondary accents. Ultra high resolution.',
    filename: 'earnings-dashboard.png'
  },
  'leaderboard-privacy': {
    prompt: 'A privacy settings panel for leaderboard visibility. Dark theme (#0D0D14). Toggle switch for "Show me on leaderboards" with lime green (#BEFF00) when enabled. Display name input field. Location privacy options. Ultra high resolution.',
    filename: 'leaderboard-privacy.png'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { docId, generateAll } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const screenshotsToGenerate = generateAll 
      ? Object.entries(DOC_SCREENSHOTS)
      : docId && DOC_SCREENSHOTS[docId] 
        ? [[docId, DOC_SCREENSHOTS[docId]]]
        : [];

    if (screenshotsToGenerate.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid docId or no screenshots to generate' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: { docId: string; success: boolean; url?: string; error?: string }[] = [];

    for (const [id, config] of screenshotsToGenerate) {
      try {
        console.log(`Generating screenshot for: ${id}`);
        
        // Generate image using Lovable AI Gateway
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [
              {
                role: 'user',
                content: config.prompt
              }
            ],
            modalities: ['image', 'text']
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`AI Gateway error for ${id}:`, response.status, errorText);
          results.push({ docId: id, success: false, error: `AI Gateway error: ${response.status}` });
          continue;
        }

        const data = await response.json();
        const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageData) {
          console.error(`No image data returned for ${id}`);
          results.push({ docId: id, success: false, error: 'No image data returned' });
          continue;
        }

        // Extract base64 data and convert to binary
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('doc-screenshots')
          .upload(config.filename, binaryData, {
            contentType: 'image/png',
            upsert: true
          });

        if (uploadError) {
          console.error(`Upload error for ${id}:`, uploadError);
          results.push({ docId: id, success: false, error: uploadError.message });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('doc-screenshots')
          .getPublicUrl(config.filename);

        results.push({ docId: id, success: true, url: urlData.publicUrl });
        console.log(`Successfully generated and uploaded: ${id}`);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Error processing ${id}:`, err);
        results.push({ docId: id, success: false, error: errorMessage });
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in generate-doc-screenshot:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
