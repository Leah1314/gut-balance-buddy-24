
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
    const { image } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Analyzing stool image with OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a medical AI assistant specialized in analyzing stool samples using the Bristol Stool Chart. 

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY a valid JSON object, no other text, no markdown formatting
2. Analyze the image to determine if it shows stool/feces
3. If it's NOT stool, describe what you see in the image in a friendly way and return: {"error": "I can see [describe what's in the image briefly], but this doesn't appear to be stool. Please upload a stool sample for analysis.", "imageDescription": "brief description of what's actually in the image"}
4. If it IS stool, classify it using the Bristol Stool Chart (1-7) and provide analysis

Bristol Stool Chart Reference:
- Type 1: Separate hard lumps (severe constipation)
- Type 2: Sausage-shaped but lumpy (mild constipation)  
- Type 3: Like a sausage with cracks on surface (normal)
- Type 4: Smooth, soft sausage or snake (ideal/normal)
- Type 5: Soft blobs with clear-cut edges (lacking fiber)
- Type 6: Fluffy pieces with ragged edges (mild diarrhea)
- Type 7: Watery, no solid pieces (severe diarrhea)

For valid stool images, respond with this exact JSON structure:
{
  "bristolType": number (1-7),
  "consistency": string (e.g., "Hard", "Normal", "Soft", "Loose", "Watery"),
  "color": string (e.g., "Brown", "Dark brown", "Light brown", "Yellow", "Green", "Black", "Red"),
  "healthScore": number (1-10, where 10 is healthiest),
  "insights": [
    "Brief analysis of the stool characteristics",
    "What this indicates about digestive health",
    "Any notable observations"
  ],
  "recommendations": [
    "Dietary suggestions if needed",
    "Lifestyle recommendations",
    "When to consult a doctor if concerning"
  ]
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this image. If it shows stool, classify it using the Bristol Stool Chart. If it doesn\'t show stool, describe what you see and ask for a stool sample. Respond with only the JSON format specified.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    let analysisText = data.choices[0].message.content.trim();
    console.log('Analysis text:', analysisText);

    // Remove markdown code block formatting if present
    if (analysisText.startsWith('```json')) {
      analysisText = analysisText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (analysisText.startsWith('```')) {
      analysisText = analysisText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse the JSON response from OpenAI
    let analysisResult;
    try {
      analysisResult = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', analysisText);
      throw new Error('Invalid response format from AI analysis');
    }

    // Check if it's an error response (not stool) - return 200 status with error flag
    if (analysisResult.error) {
      console.log('Image rejected by AI:', analysisResult.error);
      return new Response(JSON.stringify({ 
        error: analysisResult.error,
        imageDescription: analysisResult.imageDescription || '',
        isNotStool: true 
      }), {
        status: 200, // Changed from 400 to 200 so frontend handles it properly
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate the analysis result has required fields
    if (!analysisResult.bristolType || !analysisResult.consistency || !analysisResult.color) {
      throw new Error('Incomplete analysis result from AI');
    }

    console.log('Stool analysis completed:', analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-stool-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Analysis failed', 
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
