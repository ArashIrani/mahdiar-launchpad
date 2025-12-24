import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// تولید کد ۶ رقمی
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
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

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // ۲ دقیقه

    // ذخیره OTP در دیتابیس (upsert برای جلوگیری از تکرار)
    const { error: dbError } = await supabase
      .from("otp_codes")
      .upsert({
        phone,
        code: otp,
        expires_at: expiresAt.toISOString(),
        verified: false,
      }, { onConflict: 'phone' });

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
      console.error("SMS credentials not configured");
      // در حالت توسعه، کد رو لاگ می‌کنیم
      console.log("========================================");
      console.log(`📱 OTP Code for ${phone}: ${otp}`);
      console.log("========================================");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "کد تأیید ارسال شد",
          // فقط در حالت توسعه - بعداً حذف شود
          dev_code: otp 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      console.log("SMS API Response:", smsResult);

      // بررسی پاسخ API
      if (smsResult.includes("error") || smsResult.includes("Error")) {
        console.error("SMS sending failed:", smsResult);
        return new Response(
          JSON.stringify({ error: "خطا در ارسال پیامک. لطفاً دوباره تلاش کنید" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (smsError) {
      console.error("SMS Error:", smsError);
      return new Response(
        JSON.stringify({ error: "خطا در اتصال به سرویس پیامک" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`OTP sent to ${phone}`);

    return new Response(
      JSON.stringify({ success: true, message: "کد تأیید ارسال شد" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-otp:", error);
    return new Response(
      JSON.stringify({ error: "خطا در ارسال پیامک" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
