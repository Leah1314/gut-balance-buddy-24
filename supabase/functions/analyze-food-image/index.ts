
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { image } = await req.json();

    if (!image) {
      throw new Error('Image data is required');
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Analyzing food image via Lovable AI Gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this food image and provide detailed nutrition information. Return ONLY a JSON object with this exact structure:
{
  "foodItems": ["list of food items identified"],
  "calories": estimated_total_calories_number,
  "protein": protein_grams_number,
  "carbs": carbs_grams_number,
  "fat": fat_grams_number,
  "fiber": fiber_grams_number,
  "sugar": sugar_grams_number,
  "insights": ["gut health insights", "nutritional benefits", "potential concerns"],
  "gutHealthRating": rating_from_1_to_10
}

Focus on gut health implications and be as accurate as possible with nutrition estimates.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AI Gateway error:', errorData);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again shortly.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to your Lovable workspace.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw OpenAI response:', content);
    
    // Clean the content by removing markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    // Parse the JSON response
    let nutritionInfo;
    try {
      nutritionInfo = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.error('Cleaned content:', cleanContent);
      throw new Error('Invalid response format from OpenAI');
    }

    console.log('Successfully analyzed food image');
    
    return new Response(JSON.stringify(nutritionInfo), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-food-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze image', 
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
