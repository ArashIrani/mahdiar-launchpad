import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS configuration - restrict to allowed origins
const ALLOWED_ORIGINS = [
  'https://dybyqtqfovvtknllpuzs.lovableproject.com',
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.lovableproject.com');
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// تولید کد ۶ رقمی
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// هش کردن OTP برای ذخیره امن
async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Rate limit settings
const MAX_ATTEMPTS_PER_PHONE = 3; // Max 3 attempts per phone per hour
const RATE_LIMIT_WINDOW_MINUTES = 60; // 1 hour window

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    // اعتبارسنجی شماره موبایل
    if (!phone || !/^09\d{9}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "شماره موبایل نامعتبر است. فرمت صحیح: 09123456789" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limiting check - count recent OTP requests for this phone
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
    
    const { count: recentAttempts, error: countError } = await supabase
      .from("otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("phone", phone)
      .gte("created_at", windowStart.toISOString());

    if (countError) {
      console.error("Rate limit check error");
    }

    // Check rate limit
    if (recentAttempts !== null && recentAttempts >= MAX_ATTEMPTS_PER_PHONE) {
      console.log("Rate limit exceeded for phone");
      return new Response(
        JSON.stringify({ 
          error: "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً یک ساعت دیگر تلاش کنید" 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // ۲ دقیقه

    // ذخیره OTP هش شده در دیتابیس
    const { error: dbError } = await supabase
      .from("otp_codes")
      .insert({
        phone,
        code: hashedOtp, // ذخیره هش شده
        expires_at: expiresAt.toISOString(),
        verified: false,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "خطا در ذخیره کد تأیید" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ارسال پیامک با سرویس raygansms.com
    const smsApiKey = Deno.env.get("SMS_API_KEY");
    const smsPassword = Deno.env.get("SMS_PASSWORD");
    const smsSender = Deno.env.get("SMS_SENDER_NUMBER");

    if (!smsApiKey || !smsPassword || !smsSender) {
      console.error("SMS credentials not configured - cannot send OTP");
      // SECURITY FIX: Return error instead of exposing OTP code
      return new Response(
        JSON.stringify({ 
          error: "سرویس پیامک موقتاً در دسترس نیست. لطفاً بعداً تلاش کنید" 
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ارسال پیامک با API رایگان اسمس
    try {
      const smsResponse = await fetch("https://raygansms.com/SendMessageWithCode.ashx", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          UserName: smsApiKey,
          Password: smsPassword,
          PhoneNumber: smsSender,
          Mobile: phone,
          Message: `کد تأیید شما: ${otp}\nمهدیار تراز`,
        }),
      });

      const smsResult = await smsResponse.text();
      // Sanitized logging - don't log full API response
      console.log("SMS API responded with status:", smsResponse.status);

      // بررسی پاسخ API
      if (smsResult.includes("error") || smsResult.includes("Error")) {
        console.error("SMS sending failed");
        return new Response(
          JSON.stringify({ error: "خطا در ارسال پیامک. لطفاً دوباره تلاش کنید" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (smsError) {
      console.error("SMS connection error");
      return new Response(
        JSON.stringify({ error: "خطا در اتصال به سرویس پیامک" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("OTP sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "کد تأیید ارسال شد" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-otp:", error);
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: "خطا در ارسال پیامک" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});