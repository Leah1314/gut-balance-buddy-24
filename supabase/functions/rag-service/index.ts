
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// RAG service URL - this would be the deployed Python FastAPI service
const RAG_SERVICE_URL = Deno.env.get('RAG_SERVICE_URL') || 'http://localhost:8000';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, data } = await req.json();

    let ragResponse;
    let endpoint = '';
    let payload = {};

    switch (action) {
      case 'ingest_health_profile':
        endpoint = '/ingest';
        payload = {
          text: data.profile_text,
          user_id: user.id,
          data_type: 'health_info',
          source: 'manual',
          content_type: 'profile'
        };
        break;

      case 'ingest_track_data':
        endpoint = '/ingest';
        payload = {
          text: data.track_text,
          user_id: user.id,
          data_type: 'track_history',
          source: data.has_image ? 'image' : 'manual',
          content_type: data.content_type || 'general'
        };
        break;

      case 'ingest_image':
        endpoint = '/ingest_image';
        payload = {
          image_data: data.image_data,
          user_id: user.id,
          data_type: 'track_history',
          source: 'image',
          content_type: data.content_type || 'food'
        };
        break;

      case 'retrieve_user_data':
        endpoint = '/retrieve';
        payload = {
          user_id: user.id,
          query: data.query,
          n_results: data.n_results || 5
        };
        break;

      case 'check_user_data':
        endpoint = '/check_data';
        payload = {
          user_id: user.id
        };
        break;

      case 'caption_image':
        endpoint = '/caption';
        payload = {
          image_data: data.image_data,
          content_type: data.content_type || 'food'
        };
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    ragResponse = await fetch(`${RAG_SERVICE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!ragResponse.ok) {
      const errorText = await ragResponse.text();
      throw new Error(`RAG service error: ${ragResponse.statusText} - ${errorText}`);
    }

    const result = await ragResponse.json();

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('RAG service error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
