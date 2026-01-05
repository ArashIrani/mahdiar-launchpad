import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS configuration - restrict to allowed origins
const ALLOWED_ORIGINS = [
  'https://dybyqtqfovvtknllpuzs.lovableproject.com',
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

// Generate a unique license key
function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = 4;
  const segmentLength = 5;
  const parts: string[] = [];
  
  for (let i = 0; i < segments; i++) {
    let segment = "";
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    parts.push(segment);
  }
  
  return parts.join("-");
}

interface VerifyPaymentRequest {
  order_id: string;
  authority: string;
  status: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, authority, status }: VerifyPaymentRequest = await req.json();

    console.log("Verifying payment for order:", order_id);

    // Check if payment was cancelled
    if (status !== "OK") {
      console.log("Payment was cancelled by user");
      return new Response(
        JSON.stringify({ success: false, error: "پرداخت توسط کاربر لغو شد" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, products(*)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);
      return new Response(
        JSON.stringify({ success: false, error: "سفارش یافت نشد" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already processed
    if (order.status === "completed") {
      console.log("Order already completed");
      
      // Get existing license
      const { data: existingLicense } = await supabase
        .from("licenses")
        .select("license_key")
        .eq("order_id", order.id)
        .single();

      return new Response(
        JSON.stringify({ 
          success: true, 
          license_key: existingLicense?.license_key,
          already_processed: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Order found:", order.id, "Amount:", order.amount);

    // Verify with ZarinPal
    const merchantId = Deno.env.get("ZARINPAL_MERCHANT_ID");
    
    const zarinpalResponse = await fetch("https://payment.zarinpal.com/pg/v4/payment/verify.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: order.amount * 10, // Convert Toman to Rial
        authority: authority,
      }),
    });

    const zarinpalData = await zarinpalResponse.json();
    // Sanitized logging - only log verification code
    console.log("ZarinPal verify response code:", zarinpalData.data?.code);

    // Check if verification was successful (100 = success, 101 = already verified)
    if (zarinpalData.data?.code !== 100 && zarinpalData.data?.code !== 101) {
      console.error("ZarinPal verification failed");
      
      // Update order status to failed
      await supabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", order.id);

      return new Response(
        JSON.stringify({ success: false, error: "تایید پرداخت ناموفق بود" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const refId = zarinpalData.data.ref_id.toString();
    console.log("Payment verified for order:", order.id);

    // Update order to completed
    await supabase
      .from("orders")
      .update({ 
        status: "completed",
        ref_id: refId,
      })
      .eq("id", order.id);

    // SECURITY FIX: Use atomic increment for sales_count
    await supabase.rpc('increment_sales_count', { product_uuid: order.product_id });

    // Update coupon usage if applicable using atomic increment
    if (order.coupon_id) {
      // SECURITY FIX: Use atomic increment for coupon used_count
      await supabase.rpc('increment_coupon_usage', { coupon_uuid: order.coupon_id });
      
      // Insert coupon usage record (unique constraint on order_id prevents duplicates)
      await supabase.from("coupon_usages").insert({
        coupon_id: order.coupon_id,
        order_id: order.id,
        customer_email: order.customer_email,
        discount_amount: order.discount_amount || 0,
      });
    }

    // Generate license key
    const licenseKey = generateLicenseKey();

    // Create license
    const { error: licenseError } = await supabase
      .from("licenses")
      .insert({
        license_key: licenseKey,
        order_id: order.id,
        product_id: order.product_id,
        status: "active",
      });

    if (licenseError) {
      console.error("Error creating license:", licenseError);
      return new Response(
        JSON.stringify({ success: false, error: "خطا در ایجاد لایسنس" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("License created for order:", order.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        license_key: licenseKey,
        ref_id: refId,
        product_name: order.products?.name,
        deep_link_scheme: order.products?.deep_link_scheme,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in zarinpal-verify:", error);
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ success: false, error: "خطای سرور" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
