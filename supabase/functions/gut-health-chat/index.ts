
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { message, conversationHistory } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build conversation context
    const systemPrompt = `You are a knowledgeable and empathetic gut health coach. Your role is to:

1. Help users understand their digestive health patterns
2. Provide evidence-based advice about nutrition and gut health
3. Suggest lifestyle changes that support digestive wellness
4. Help interpret symptoms and patterns (but always recommend consulting healthcare professionals for medical concerns)
5. Encourage consistent tracking of food intake and bowel movements
6. Provide personalized recommendations based on user data

Guidelines:
- Be supportive and encouraging
- Use simple, accessible language
- Focus on practical, actionable advice
- Always emphasize that you're not a substitute for medical care
- Ask clarifying questions when needed
- Reference scientific evidence when appropriate
- Keep responses concise but informative

When users ask about:
- Food: Focus on gut-friendly options, fiber content, fermented foods, and meal timing
- Symptoms: Help identify potential triggers but recommend medical consultation for persistent issues
- Patterns: Help analyze trends in their tracking data
- Lifestyle: Suggest stress management, sleep, and exercise as they relate to gut health`;

    // Convert conversation history to OpenAI format
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI with message:', message);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get response from AI');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response:', aiResponse);

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gut-health-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
