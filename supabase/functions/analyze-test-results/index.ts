
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
    const { image, fileType, fileName } = await req.json();

    if (!image) {
      throw new Error('File data is required');
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Analyzing test results file via Lovable AI Gateway...');
    console.log('File type:', fileType);

    const analysisPrompt = `Analyze this medical test result and provide a structured summary. Return ONLY a JSON object with this exact structure:
{
  "testType": "type of test (blood work, urine, stool, GI report, etc.)",
  "keyFindings": ["list of key findings"],
  "values": [{"parameter": "name", "value": "result", "unit": "unit", "referenceRange": "normal range", "status": "normal/high/low"}],
  "recommendations": ["health recommendations based on results"],
  "concernLevel": "low/moderate/high",
  "summary": "brief overall summary"
}

Focus on extracting specific values, identifying abnormal results, and providing wellness-oriented insights. Do not diagnose.`;

    if (fileType !== 'application/pdf' && !fileType?.startsWith('image/')) {
      throw new Error('Unsupported file type. Please use image files (JPG, PNG) or PDF.');
    }

    const attachment = fileType === 'application/pdf'
      ? {
          type: 'file',
          file: {
            filename: fileName || 'test-result.pdf',
            file_data: `data:application/pdf;base64,${image}`,
          },
        }
      : {
          type: 'image_url',
          image_url: {
            url: `data:${fileType};base64,${image}`,
          },
        };

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Lovable-API-Key': lovableApiKey,
        'X-Lovable-AIG-SDK': 'supabase-edge-function',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: analysisPrompt },
              attachment,
            ],
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Lovable AI Gateway error:', response.status, errorData);
      if (response.status === 429) {
        throw new Error('Lovable AI rate limit reached. Please try again shortly.');
      }
      if (response.status === 402) {
        throw new Error('Lovable AI credits are exhausted. Please add credits in your Lovable workspace.');
      }
      const gatewayMessage = errorData.message || errorData.error?.message || errorData.title || 'Unknown error';
      throw new Error(`Lovable AI Gateway request failed: ${response.status} - ${gatewayMessage}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    if (!content) {
      throw new Error('No analysis content received from Lovable AI');
    }
    
    console.log('Raw Lovable AI response:', content);
    
    // Clean the content by removing markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    // Parse the JSON response
    let testResults;
    try {
      testResults = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse Lovable AI response as JSON:', parseError);
      console.error('Cleaned content:', cleanContent);
      throw new Error('Invalid response format from Lovable AI');
    }

    console.log('Successfully analyzed test results file');
    
    return new Response(JSON.stringify(testResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-test-results function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze test results', 
        details: error instanceof Error ? error.message : String(error) 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
