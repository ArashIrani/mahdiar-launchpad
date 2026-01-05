import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { license_key, device_id } = await req.json();

    console.log("License validation request received");

    // Validate input
    if (!license_key || typeof license_key !== "string") {
      console.error("Missing or invalid license_key");
      return new Response(
        JSON.stringify({ valid: false, error: "license_key is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!device_id || typeof device_id !== "string") {
      console.error("Missing or invalid device_id");
      return new Response(
        JSON.stringify({ valid: false, error: "device_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the license
    const { data: license, error: licenseError } = await supabase
      .from("licenses")
      .select("*, products(name, description, deep_link_scheme)")
      .eq("license_key", license_key)
      .maybeSingle();

    if (licenseError) {
      console.error("Error fetching license:", licenseError);
      return new Response(
        JSON.stringify({ valid: false, error: "Database error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // License not found
    if (!license) {
      console.log("License not found");
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid license key" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("License found with status:", license.status);

    // Check if license is revoked
    if (license.status === "revoked") {
      console.log("License is revoked");
      return new Response(
        JSON.stringify({ valid: false, error: "License has been revoked" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if license has expired
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      console.log("License has expired");
      return new Response(
        JSON.stringify({ valid: false, error: "License has expired" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check device binding
    if (license.device_id && license.device_id !== device_id) {
      console.log("License already activated on another device");
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "License is already activated on another device",
          hint: "Contact support if you need to transfer your license"
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // First time activation - bind device
    if (!license.device_id) {
      console.log("First activation, binding device");
      const { error: updateError } = await supabase
        .from("licenses")
        .update({ 
          device_id: device_id, 
          activated_at: new Date().toISOString(),
          status: "active"
        })
        .eq("id", license.id);

      if (updateError) {
        console.error("Error updating license:", updateError);
        return new Response(
          JSON.stringify({ valid: false, error: "Failed to activate license" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("License activated successfully");
    }

    // Return success response
    const response = {
      valid: true,
      license: {
        id: license.id,
        status: license.status,
        activated_at: license.activated_at || new Date().toISOString(),
        expires_at: license.expires_at,
      },
      product: license.products ? {
        name: license.products.name,
        description: license.products.description,
        deep_link_scheme: license.products.deep_link_scheme,
    } : null,
    };

    console.log("Validation successful for license:", license.id);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ valid: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
