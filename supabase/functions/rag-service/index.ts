
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

    const requestBody = await req.json();
    console.log('RAG service request:', requestBody);

    // Handle direct hook calls (from useTrackingRAG)
    if (requestBody.type && requestBody.data) {
      // This is a tracking data ingestion request
      const endpoint = '/ingest';
      const payload = {
        text: Object.entries(requestBody.data)
          .filter(([_, value]) => value != null && value !== '')
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n'),
        user_id: user.id,
        data_type: 'track_history',
        source: requestBody.include_image ? 'image' : 'manual',
        content_type: requestBody.type || 'general'
      };

      try {
        const ragResponse = await fetch(`${RAG_SERVICE_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!ragResponse.ok) {
          // Log error but don't fail the request - RAG is optional
          console.error('RAG service unavailable:', ragResponse.statusText);
          return new Response(
            JSON.stringify({ success: false, message: 'RAG service unavailable' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const result = await ragResponse.json();
        console.log('RAG ingestion successful:', result);

        return new Response(
          JSON.stringify({ success: true, result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('RAG service connection error:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'RAG service connection failed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Handle legacy action-based calls
    const { action, data } = requestBody;
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'No action or type specified' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

      case 'health_check':
        endpoint = '/health';
        payload = {};
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    try {
      ragResponse = await fetch(`${RAG_SERVICE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!ragResponse.ok) {
        const errorText = await ragResponse.text();
        console.error('RAG service error:', ragResponse.statusText, errorText);
        
        // For health check, return service unavailable status
        if (action === 'health_check') {
          return new Response(
            JSON.stringify({ status: 'unavailable', error: ragResponse.statusText }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`RAG service error: ${ragResponse.statusText} - ${errorText}`);
      }

      const result = await ragResponse.json();

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('RAG service connection error:', error);
      
      // Return a graceful fallback for data queries
      if (action === 'retrieve_user_data') {
        return new Response(
          JSON.stringify({ health_info: [], track_history: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (action === 'check_user_data') {
        return new Response(
          JSON.stringify({ health_info: false, track_history: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'RAG service unavailable', details: error.message }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
