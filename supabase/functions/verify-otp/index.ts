import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, code } = await req.json();

    // اعتبارسنجی ورودی‌ها
    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: "شماره موبایل و کد تأیید الزامی است" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!/^09\d{9}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "شماره موبایل نامعتبر است" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ error: "کد تأیید باید ۶ رقم باشد" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // بررسی کد OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", phone)
      .eq("code", code)
      .eq("verified", false)
      .maybeSingle();

    if (otpError) {
      console.error("Database error:", otpError);
      return new Response(
        JSON.stringify({ error: "خطا در بررسی کد" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!otpRecord) {
      return new Response(
        JSON.stringify({ error: "کد تأیید نامعتبر است" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // بررسی انقضا
    if (new Date(otpRecord.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "کد تأیید منقضی شده است. لطفاً کد جدید دریافت کنید" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // علامت‌گذاری به عنوان تأیید شده
    await supabase
      .from("otp_codes")
      .update({ verified: true })
      .eq("id", otpRecord.id);

    // ایجاد یا ورود کاربر با ایمیل مجازی
    const email = `${phone}@sms.mahdyar.ir`;
    const password = `SMS_${phone}_${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.slice(0, 16)}`;

    // بررسی آیا کاربر وجود دارد
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users?.find(u => u.email === email);

    let session = null;
    let user = null;

    if (userExists) {
      // ورود کاربر موجود
      console.log(`Signing in existing user: ${email}`);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        console.error("Sign in error:", signInError);
        return new Response(
          JSON.stringify({ error: "خطا در ورود. لطفاً دوباره تلاش کنید" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      session = data.session;
      user = data.user;
    } else {
      // ثبت‌نام کاربر جدید
      console.log(`Creating new user: ${email}`);
      const { data: newUserData, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { 
          phone,
          signup_method: 'sms' 
        },
      });
      
      if (signUpError) {
        console.error("Sign up error:", signUpError);
        return new Response(
          JSON.stringify({ error: "خطا در ثبت‌نام. لطفاً دوباره تلاش کنید" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      user = newUserData.user;
      
      // ورود بعد از ثبت‌نام
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (loginError) {
        console.error("Login after signup error:", loginError);
        return new Response(
          JSON.stringify({ error: "ثبت‌نام انجام شد اما ورود ناموفق بود" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      session = loginData.session;
    }

    console.log(`User authenticated: ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        session,
        user,
        message: userExists ? "ورود موفق" : "ثبت‌نام و ورود موفق"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in verify-otp:", error);
    return new Response(
      JSON.stringify({ error: "خطا در تأیید کد" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
