
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Gut health chat function called');
    
    const { message, conversationHistory, hasUserData, userData } = await req.json();
    console.log('Request data:', { 
      message: message?.substring(0, 100), 
      hasUserData: hasUserData, 
      userData: userData ? 'present' : 'missing',
      userDataType: typeof userData,
      hasUserDataType: typeof hasUserData
    });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build system prompt for gut health coaching
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

    // Add user context if available - check for actual boolean value
    if (hasUserData === true && userData) {
      systemPrompt += `\n\nUser Context:`;
      
      if (userData.healthProfile) {
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
        systemPrompt += `\nRecent food entries: ${userData.foodLogs.length} items logged`;
        // Add recent food items for context
        const recentFoods = userData.foodLogs.slice(0, 5).map((log: any) => log.food_name).join(', ');
        systemPrompt += ` (Recent foods: ${recentFoods})`;
      }
      
      if (userData.stoolLogs?.length > 0) {
        systemPrompt += `\nRecent stool logs: ${userData.stoolLogs.length} entries recorded`;
      }
    } else {
      systemPrompt += `\n\nNote: No user tracking data available. Provide general gut health advice and encourage the user to start tracking their symptoms and food intake.`;
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).slice(-5), // Last 5 messages for context
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI API with system prompt length:', systemPrompt.length);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received, choices:', data.choices?.length || 0);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI');
    }

    const aiResponse = data.choices[0].message.content;
    console.log('AI response length:', aiResponse?.length || 0);

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gut-health-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process request',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
