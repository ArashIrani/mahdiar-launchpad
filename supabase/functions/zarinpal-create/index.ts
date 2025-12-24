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
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product_id, customer_email, customer_phone }: CreatePaymentRequest = await req.json();

    console.log("Creating payment for product:", product_id, "email:", customer_email, "phone:", customer_phone);

    // Validate input
    if (!product_id || !customer_email || !customer_phone) {
      return new Response(
        JSON.stringify({ error: "اطلاعات ناقص است" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", product_id)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      console.error("Product not found:", productError);
      return new Response(
        JSON.stringify({ error: "محصول یافت نشد" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Product found:", product.name, "Price:", product.price);

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        product_id: product.id,
        customer_email,
        customer_phone,
        amount: product.price,
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
