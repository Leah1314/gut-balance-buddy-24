
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== EDGE FUNCTION CALLED ===');
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== PARSING REQUEST BODY ===');
    const requestBody = await req.json();
    console.log('Raw request body:', JSON.stringify(requestBody, null, 2));

    const { message, conversationHistory, hasUserData, userData } = requestBody;
    
    console.log('=== REQUEST DATA ANALYSIS ===');
    console.log('Message:', message?.substring(0, 100) + (message?.length > 100 ? '...' : ''));
    console.log('Conversation history length:', conversationHistory?.length || 0);
    console.log('Has user data:', hasUserData);
    console.log('User data type:', typeof userData);
    console.log('User data is null:', userData === null);
    console.log('User data keys:', userData ? Object.keys(userData) : 'no keys');

    if (userData) {
      console.log('User data breakdown:', {
        hasHealthProfile: userData.healthProfile !== null,
        foodLogsCount: userData.foodLogs?.length || 0,
        stoolLogsCount: userData.stoolLogs?.length || 0
      });
    }

    console.log('=== CHECKING OPENAI API KEY ===');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        response: 'I apologize, but my AI service is not properly configured. Please contact support.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('OpenAI API key found:', openAIApiKey.substring(0, 10) + '...');

    // Build system prompt for gut health coaching
    console.log('=== BUILDING SYSTEM PROMPT ===');
    let systemPrompt = `You are a knowledgeable gut health coach and nutritionist. You provide personalized advice about digestive health, nutrition, and wellness based on the user's data and questions.

Key responsibilities:
- Analyze food patterns and their impact on digestive health
- Interpret stool logs and Bristol stool scale results
- Provide personalized dietary recommendations
- Explain digestive symptoms and potential causes
- Suggest lifestyle modifications for better gut health
- Recommend when to consult healthcare professionals

Guidelines:
- Be supportive and encouraging
- Provide evidence-based advice
- Explain complex concepts in simple terms
- Always recommend consulting a doctor for serious concerns
- Focus on practical, actionable advice`;

    // Add user context if available
    if (hasUserData === true && userData) {
      console.log('Adding user context to system prompt');
      systemPrompt += `\n\nUser Context:`;
      
      if (userData.healthProfile) {
        console.log('Adding health profile context');
        systemPrompt += `\nHealth Profile: Age ${userData.healthProfile.age || 'not specified'}, Activity level: ${userData.healthProfile.activity_level || 'not specified'}`;
        if (userData.healthProfile.medical_conditions?.length > 0) {
          systemPrompt += `, Medical conditions: ${userData.healthProfile.medical_conditions.join(', ')}`;
        }
        if (userData.healthProfile.dietary_restrictions) {
          systemPrompt += `, Dietary restrictions: ${JSON.stringify(userData.healthProfile.dietary_restrictions)}`;
        }
        if (userData.healthProfile.medications?.length > 0) {
          systemPrompt += `, Medications: ${userData.healthProfile.medications.join(', ')}`;
        }
      }
      
      if (userData.foodLogs?.length > 0) {
        console.log('Adding food logs context');
        systemPrompt += `\nRecent food entries: ${userData.foodLogs.length} items logged`;
        const recentFoods = userData.foodLogs.slice(0, 5).map((log: any) => log.food_name).join(', ');
        systemPrompt += ` (Recent foods: ${recentFoods})`;
      }
      
      if (userData.stoolLogs?.length > 0) {
        console.log('Adding stool logs context');
        systemPrompt += `\nRecent stool logs: ${userData.stoolLogs.length} entries recorded`;
      }
    } else {
      console.log('No user data available, adding general note');
      systemPrompt += `\n\nNote: No user tracking data available. Provide general gut health advice and encourage the user to start tracking their symptoms and food intake.`;
    }

    console.log('Final system prompt length:', systemPrompt.length);

    // Prepare messages for OpenAI
    console.log('=== PREPARING OPENAI MESSAGES ===');
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).slice(-5), // Last 5 messages for context
      { role: 'user', content: message }
    ];

    console.log('Total messages for OpenAI:', messages.length);
    console.log('Messages structure:', messages.map(m => ({ role: m.role, contentLength: m.content.length })));

    console.log('=== CALLING OPENAI API ===');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI response status:', openAIResponse.status);
    console.log('OpenAI response headers:', Object.fromEntries(openAIResponse.headers.entries()));

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error details:', {
        status: openAIResponse.status,
        statusText: openAIResponse.statusText,
        errorText: errorText
      });
      throw new Error(`OpenAI API error: ${openAIResponse.status} ${errorText}`);
    }

    console.log('=== PARSING OPENAI RESPONSE ===');
    const data = await openAIResponse.json();
    console.log('OpenAI response data keys:', Object.keys(data));
    console.log('Choices count:', data.choices?.length || 0);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response from OpenAI');
    }

    const aiResponse = data.choices[0].message.content;
    console.log('AI response received');
    console.log('AI response length:', aiResponse?.length || 0);
    console.log('AI response preview:', aiResponse?.substring(0, 200) + (aiResponse?.length > 200 ? '...' : ''));

    console.log('=== PREPARING FUNCTION RESPONSE ===');
    const functionResponse = { response: aiResponse };
    console.log('Function response keys:', Object.keys(functionResponse));

    console.log('=== RETURNING RESPONSE ===');
    return new Response(JSON.stringify(functionResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== EDGE FUNCTION ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    const errorResponse = { 
      error: 'Failed to process request',
      details: error.message,
      response: 'I apologize, but I encountered an error while processing your request. Please try again.'
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
