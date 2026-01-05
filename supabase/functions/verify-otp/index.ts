import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encodeBase64 } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate cryptographically secure password
function generateSecurePassword(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return encodeBase64(bytes);
}

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
      // Delete expired OTP immediately
      await supabase.from("otp_codes").delete().eq("id", otpRecord.id);
      return new Response(
        JSON.stringify({ error: "کد تأیید منقضی شده است. لطفاً کد جدید دریافت کنید" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ایجاد یا ورود کاربر با ایمیل مجازی
    const email = `${phone}@sms.mahdyar.ir`;

    // بررسی آیا کاربر وجود دارد
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let session = null;
    let user = null;

    if (existingUser) {
      // For existing users, generate a new secure password and update
      console.log(`Updating password for existing user: ${email}`);
      const newPassword = generateSecurePassword();
      
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: newPassword }
      );
      
      if (updateError) {
        console.error("Password update error:", updateError);
        return new Response(
          JSON.stringify({ error: "خطا در ورود. لطفاً دوباره تلاش کنید" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // ورود کاربر با رمز جدید
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: newPassword,
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
      // ثبت‌نام کاربر جدید با رمز امن
      console.log(`Creating new user: ${email}`);
      const securePassword = generateSecurePassword();
      
      const { data: newUserData, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password: securePassword,
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
        password: securePassword,
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

    // SECURITY FIX: Delete OTP immediately after successful authentication
    await supabase.from("otp_codes").delete().eq("id", otpRecord.id);
    
    console.log(`User authenticated: ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        session,
        user,
        message: existingUser ? "ورود موفق" : "ثبت‌نام و ورود موفق"
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
