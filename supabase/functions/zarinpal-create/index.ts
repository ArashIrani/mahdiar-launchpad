import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreatePaymentRequest {
  product_id: string;
  customer_email: string;
  customer_phone: string;
  coupon_code?: string | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product_id, customer_email, customer_phone, coupon_code }: CreatePaymentRequest = await req.json();

    console.log("Creating payment for product:", product_id, "email:", customer_email);

    if (!product_id || !customer_email || !customer_phone) {
      return new Response(
        JSON.stringify({ error: "اطلاعات ناقص است" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", product_id)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      return new Response(
        JSON.stringify({ error: "محصول یافت نشد" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let finalAmount = product.price;
    let discountAmount = 0;
    let couponId = null;

    // Validate coupon if provided
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", coupon_code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (coupon) {
        const now = new Date();
        const validFrom = coupon.valid_from ? new Date(coupon.valid_from) : null;
        const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;
        
        if ((!validFrom || validFrom <= now) && (!validUntil || validUntil >= now)) {
          if (!coupon.max_uses || coupon.used_count < coupon.max_uses) {
            if (!coupon.min_purchase || product.price >= coupon.min_purchase) {
              if (!coupon.product_id || coupon.product_id === product_id) {
                if (coupon.discount_type === "percentage") {
                  discountAmount = Math.floor((product.price * coupon.discount_value) / 100);
                } else {
                  discountAmount = coupon.discount_value;
                }
                finalAmount = Math.max(0, product.price - discountAmount);
                couponId = coupon.id;
              }
            }
          }
        }
      }
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        product_id: product.id,
        customer_email,
        customer_phone,
        amount: finalAmount,
        original_amount: product.price,
        discount_amount: discountAmount,
        coupon_id: couponId,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return new Response(
        JSON.stringify({ error: "خطا در ایجاد سفارش" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Order created:", order.id);

    // Get callback URL from request headers or use default
    const origin = req.headers.get("origin") || "https://dybyqtqfovvtknllpuzs.lovableproject.com";
    const callbackUrl = `${origin}/payment/verify?order_id=${order.id}`;

    // Create ZarinPal payment request
    const merchantId = Deno.env.get("ZARINPAL_MERCHANT_ID");
    
    const zarinpalResponse = await fetch("https://payment.zarinpal.com/pg/v4/payment/request.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: product.price * 10, // Convert Toman to Rial
        callback_url: callbackUrl,
        description: `خرید ${product.name}`,
        metadata: {
          email: customer_email,
          mobile: customer_phone,
          order_id: order.id,
        },
      }),
    });

    const zarinpalData = await zarinpalResponse.json();
    console.log("ZarinPal response:", JSON.stringify(zarinpalData));

    if (zarinpalData.data?.code !== 100) {
      console.error("ZarinPal error:", zarinpalData.errors);
      return new Response(
        JSON.stringify({ error: "خطا در اتصال به درگاه پرداخت" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authority = zarinpalData.data.authority;

    // Update order with authority
    await supabase
      .from("orders")
      .update({ authority })
      .eq("id", order.id);

    console.log("Payment authority:", authority);

    // Return payment URL
    const paymentUrl = `https://payment.zarinpal.com/pg/StartPay/${authority}`;

    return new Response(
      JSON.stringify({ 
        payment_url: paymentUrl,
        order_id: order.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in zarinpal-create:", error);
    return new Response(
      JSON.stringify({ error: "خطای سرور" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
