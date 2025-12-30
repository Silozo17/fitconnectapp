import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a 6-digit OTP code
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  // Extract device info from headers for debugging
  const userAgent = req.headers.get("user-agent") || "unknown";
  const clientInfo = req.headers.get("x-client-info") || "unknown";
  const isIPad = userAgent.toLowerCase().includes("ipad");
  const isIOS = userAgent.toLowerCase().includes("iphone") || isIPad;
  
  console.log(`[send-otp-email] Request received - Device: ${isIPad ? 'iPad' : isIOS ? 'iPhone' : 'Other'}, User-Agent: ${userAgent}, Client-Info: ${clientInfo}`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let requestBody;
    try {
      requestBody = await req.json();
      console.log(`[send-otp-email] Request body parsed successfully:`, JSON.stringify(requestBody));
    } catch (parseError) {
      console.error(`[send-otp-email] Failed to parse request body:`, parseError);
      return new Response(
        JSON.stringify({ error: "Invalid request body", details: "Could not parse JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email } = requestBody;

    if (!email) {
      console.error(`[send-otp-email] Email missing from request body`);
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error(`[send-otp-email] Invalid email format: ${email}`);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-otp-email] Generating OTP for email: ${email} (Device: ${isIPad ? 'iPad' : isIOS ? 'iPhone' : 'Other'})`);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user already exists in auth.users
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (!listError && existingUsers?.users) {
      const existingUser = existingUsers.users.find(
        u => u.email?.toLowerCase() === email.toLowerCase()
      );
      if (existingUser) {
        console.log(`[send-otp-email] Email already registered: ${email}`);
        return new Response(
          JSON.stringify({ 
            error: "email_already_registered",
            message: "This email is already registered" 
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate OTP code
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Delete any existing codes for this email
    console.log(`[send-otp-email] Deleting existing codes for: ${email.toLowerCase()}`);
    const { error: deleteError } = await supabaseAdmin
      .from("email_verifications")
      .delete()
      .eq("email", email.toLowerCase());
    
    if (deleteError) {
      console.error(`[send-otp-email] Failed to delete existing codes:`, deleteError);
      // Continue anyway, this is not critical
    }

    // Insert new code
    console.log(`[send-otp-email] Inserting new OTP code for: ${email.toLowerCase()}`);
    const { error: insertError } = await supabaseAdmin
      .from("email_verifications")
      .insert({
        email: email.toLowerCase(),
        code,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error(`[send-otp-email] Failed to insert OTP:`, insertError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate verification code", 
          details: insertError.message,
          code: insertError.code 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`[send-otp-email] OTP stored successfully, sending email...`);

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FitConnect <support@getfitconnect.co.uk>",
        to: [email],
        subject: "Your FitConnect verification code",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">FitConnect</h1>
            </div>
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
              <h2 style="color: #111827; margin-top: 0;">Verify your email</h2>
              <p style="color: #6b7280; margin-bottom: 30px;">Enter this code to complete your registration:</p>
              <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 30px;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</span>
              </div>
              <p style="color: #9ca3af; font-size: 14px; margin-bottom: 0;">This code expires in 5 minutes. If you didn't request this, you can safely ignore this email.</p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error(`[send-otp-email] Resend API error:`, errorData);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send verification email", 
          details: errorData 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailResult = await emailResponse.json();
    console.log(`[send-otp-email] Email sent successfully to ${email}, Resend ID: ${emailResult.id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Verification code sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error(`[send-otp-email] Unhandled error:`, error);
    const errorMessage = error instanceof Error ? error.message : "Failed to send verification code";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error(`[send-otp-email] Error stack:`, errorStack);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: "An unexpected error occurred during signup" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
