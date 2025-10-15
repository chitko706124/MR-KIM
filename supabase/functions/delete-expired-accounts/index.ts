// supabase/functions/delete-expired-accounts/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // ✅ Calculate 24 hours ago
    const expiredDate = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();

    // ✅ Delete rows older than 24h
    const { error } = await supabaseClient
      .from("accounts")
      .delete()
      .lt("deleted_at", expiredDate);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        message: "✅ Expired accounts cleaned up successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting expired accounts:", error);
    return new Response(
      JSON.stringify({ error: error.message ?? "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
