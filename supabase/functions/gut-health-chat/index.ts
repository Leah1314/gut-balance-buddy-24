
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== GUT HEALTH CHAT FUNCTION CALLED ===');
  console.log('Request method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== PARSING REQUEST BODY ===');
    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const { message, conversationHistory, includeUserData } = requestBody;
    
    console.log('Message received:', message);
    console.log('Include user data:', includeUserData);

    console.log('=== CHECKING OPENAI API KEY ===');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        response: 'I apologize, but my AI service is not properly configured. Please contact support.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('OpenAI API key found');

    let systemPrompt = `You are a helpful gut health coach. Provide friendly, supportive advice about digestive health and nutrition. Keep your responses concise and practical.`;
    
    // If user data analysis is requested, fetch and include user data
    if (includeUserData) {
      console.log('=== FETCHING USER DATA ===');
      
      try {
        // Get auth header from request
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
          console.log('No authorization header found');
        } else {
          console.log('Authorization header found, fetching user data...');
          
          // Initialize Supabase client
          const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
          const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          
          // Get user from JWT
          const jwt = authHeader.replace('Bearer ', '');
          const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
          
          if (user && !userError) {
            console.log('User found:', user.id);
            
            // Fetch user health profile
            const { data: healthProfile, error: healthError } = await supabase
              .from('user_health_profiles')
              .select('*')
              .eq('user_id', user.id)
              .single();
              
            // Fetch recent food logs
            const { data: foodLogs, error: foodError } = await supabase
              .from('food_logs')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(10);
              
            // Fetch recent stool logs
            const { data: stoolLogs, error: stoolError } = await supabase
              .from('stool_logs')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(10);
            
            console.log('Health profile:', healthProfile ? 'Found' : 'Not found');
            console.log('Food logs:', foodLogs?.length || 0, 'entries');
            console.log('Stool logs:', stoolLogs?.length || 0, 'entries');
            
            // Build enhanced system prompt with user data
            let userDataContext = "\n\nUser Data Context:\n";
            
            if (healthProfile) {
              userDataContext += `Health Profile: Age ${healthProfile.age}, conditions: ${healthProfile.health_conditions || 'None'}, medications: ${healthProfile.medications || 'None'}, allergies: ${healthProfile.allergies || 'None'}.\n`;
            }
            
            if (foodLogs && foodLogs.length > 0) {
              userDataContext += `Recent meals: ${foodLogs.map(log => `${log.food_name} (${log.created_at.split('T')[0]})`).join(', ')}.\n`;
            }
            
            if (stoolLogs && stoolLogs.length > 0) {
              userDataContext += `Recent stool logs: ${stoolLogs.length} entries, latest from ${stoolLogs[0]?.created_at?.split('T')[0]}.\n`;
            }
            
            if (userDataContext.length > 30) {
              systemPrompt += userDataContext + "\nUse this information to provide personalized advice when relevant.";
              console.log('Enhanced system prompt with user data');
            } else {
              console.log('No significant user data found');
            }
          } else {
            console.log('User not found or error:', userError);
          }
        }
      } catch (dataError) {
        console.error('Error fetching user data:', dataError);
        // Continue without user data
      }
    }

    console.log('=== CALLING OPENAI API ===');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(conversationHistory || []).slice(-5).map((msg: any) => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI response status:', openAIResponse.status);

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const data = await openAIResponse.json();
    console.log('OpenAI response received');

    const aiResponse = data.choices[0].message.content;
    console.log('AI response:', aiResponse);

    const functionResponse = { response: aiResponse };
    console.log('=== RETURNING RESPONSE ===');

    return new Response(JSON.stringify(functionResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== EDGE FUNCTION ERROR ===');
    console.error('Error:', error.message);

    return new Response(JSON.stringify({ 
      error: 'Failed to process request',
      response: 'I apologize, but I encountered an error. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
