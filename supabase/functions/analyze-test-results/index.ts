
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
    const { image, fileType } = await req.json();

    if (!image) {
      throw new Error('File data is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Analyzing test results file with OpenAI...');
    console.log('File type:', fileType);

    let response;

    if (fileType === 'application/pdf') {
      // For PDFs, we'll use a text-based approach since vision API doesn't support PDFs
      // We'll ask the user to describe what's in the PDF or convert it to image
      response = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `You are a medical test results analyzer. Since you cannot directly read PDF files, you'll need to provide a general response asking the user to convert their PDF to an image format or provide text content. Return ONLY a JSON object with this exact structure:
{
  "testType": "PDF Document (Unable to read)",
  "keyFindings": ["PDF files cannot be directly analyzed. Please convert to image format (JPG, PNG) or provide test results as text."],
  "values": [],
  "recommendations": ["Convert PDF to image format", "Take a clear photo of the test results", "Ensure all text is readable in the image"],
  "concernLevel": "low",
  "summary": "PDF file detected but cannot be analyzed directly. Please provide test results in image format for accurate analysis."
}`
            },
            {
              role: 'user',
              content: 'A user has uploaded a PDF file with test results. Please provide the standard response asking them to convert to image format.'
            }
          ],
          max_tokens: 800,
          temperature: 0.3
        }),
      });
    } else if (fileType?.startsWith('image/')) {
      // For images, use the vision API
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this medical test result image and provide a structured summary. Return ONLY a JSON object with this exact structure:
{
  "testType": "type of test (blood work, urine, etc.)",
  "keyFindings": ["list of key findings"],
  "values": [{"parameter": "name", "value": "result", "unit": "unit", "referenceRange": "normal range", "status": "normal/high/low"}],
  "recommendations": ["health recommendations based on results"],
  "concernLevel": "low/moderate/high",
  "summary": "brief overall summary"
}

Focus on extracting specific values, identifying any abnormal results, and providing health insights.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${fileType};base64,${image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1500,
          temperature: 0.3
        }),
      });
    } else {
      throw new Error('Unsupported file type. Please use image files (JPG, PNG) or PDF.');
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
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
    let testResults;
    try {
      testResults = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.error('Cleaned content:', cleanContent);
      throw new Error('Invalid response format from OpenAI');
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
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
