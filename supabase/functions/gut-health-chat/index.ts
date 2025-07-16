
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

    const { message, conversationHistory, includeUserData, imageData } = requestBody;
    
    console.log('Message received:', message);
    console.log('Include user data:', includeUserData);
    console.log('Image data provided:', imageData ? 'Yes' : 'No');

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

    let systemPrompt = `You are a helpful gut health coach. Provide friendly, supportive advice about digestive health and nutrition. Keep your responses concise and practical.
    
    When analyzing food images, identify ingredients, potential allergens, and assess suitability based on the user's health profile, dietary restrictions, and recent symptoms. For menu images, recommend safe options and highlight items to avoid.`;
    
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

            // Fetch test results
            const { data: testResults, error: testError } = await supabase
              .from('test_results')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(5);
            
            console.log('Health profile:', healthProfile ? 'Found' : 'Not found');
            console.log('Food logs:', foodLogs?.length || 0, 'entries');
            console.log('Stool logs:', stoolLogs?.length || 0, 'entries');
            console.log('Test results:', testResults?.length || 0, 'entries');
            
            // Build enhanced system prompt with user data
            let userDataContext = "\n\nUser Data Context:\n";
            
            if (healthProfile) {
              userDataContext += `Health Profile: `;
              if (healthProfile.age) userDataContext += `Age ${healthProfile.age}, `;
              if (healthProfile.medical_conditions && healthProfile.medical_conditions.length > 0) {
                userDataContext += `medical conditions: ${healthProfile.medical_conditions.join(', ')}, `;
              } else {
                userDataContext += `medical conditions: None, `;
              }
              if (healthProfile.medications && healthProfile.medications.length > 0) {
                userDataContext += `medications: ${healthProfile.medications.join(', ')}, `;
              } else {
                userDataContext += `medications: None, `;
              }
              if (healthProfile.dietary_restrictions && Object.keys(healthProfile.dietary_restrictions).length > 0) {
                const restrictions = Object.entries(healthProfile.dietary_restrictions)
                  .filter(([_, value]) => value === true)
                  .map(([key, _]) => key);
                if (restrictions.length > 0) {
                  userDataContext += `dietary restrictions: ${restrictions.join(', ')}, `;
                }
              }
              if (healthProfile.symptoms_notes) {
                userDataContext += `symptoms/notes: ${healthProfile.symptoms_notes}, `;
              }
              userDataContext += '.\n';
            }
            
            if (foodLogs && foodLogs.length > 0) {
              userDataContext += `Recent meals (last ${foodLogs.length}): `;
              const mealDescriptions = foodLogs.map(log => {
                const date = log.created_at.split('T')[0];
                let description = `${log.food_name} (${date})`;
                if (log.description) {
                  description += ` - ${log.description}`;
                }
                if (log.notes) {
                  description += ` Notes: ${log.notes}`;
                }
                return description;
              }).join('; ');
              userDataContext += mealDescriptions + '.\n';
            }
            
            if (stoolLogs && stoolLogs.length > 0) {
              userDataContext += `Recent stool logs (last ${stoolLogs.length}): `;
              const stoolDescriptions = stoolLogs.map(log => {
                const date = log.created_at.split('T')[0];
                let description = `Type ${log.bristol_type}, ${log.consistency}, ${log.color} (${date})`;
                if (log.notes) {
                  description += ` Notes: ${log.notes}`;
                }
                return description;
              }).join('; ');
              userDataContext += stoolDescriptions + '.\n';
            }

            if (testResults && testResults.length > 0) {
              userDataContext += `Test Results (last ${testResults.length}): `;
              const testDescriptions = testResults.map(result => {
                const date = result.created_at.split('T')[0];
                let description = `${result.test_type || 'Test'} (${date})`;
                if (result.summary) {
                  description += ` - ${result.summary}`;
                }
                if (result.concern_level) {
                  description += ` Concern Level: ${result.concern_level}`;
                }
                if (result.key_findings && result.key_findings.length > 0) {
                  description += ` Key Findings: ${result.key_findings.join(', ')}`;
                }
                if (result.recommendations && result.recommendations.length > 0) {
                  description += ` Recommendations: ${result.recommendations.join(', ')}`;
                }
                if (result.test_values && Array.isArray(result.test_values)) {
                  const abnormalValues = result.test_values.filter(v => v.status && v.status.toLowerCase() !== 'normal');
                  if (abnormalValues.length > 0) {
                    description += ` Abnormal Values: ${abnormalValues.map(v => `${v.parameter}: ${v.value} ${v.unit} (${v.status})`).join(', ')}`;
                  }
                }
                return description;
              }).join('; ');
              userDataContext += testDescriptions + '.\n';
            }
            
            if (userDataContext.length > 30) {
              systemPrompt += userDataContext + "\nUse this information to provide personalized advice when relevant. Analyze patterns, suggest improvements, and provide specific recommendations based on the user's data. IMPORTANT: Pay special attention to any medical conditions mentioned as they significantly affect dietary recommendations. When discussing test results, reference specific findings and provide context about what they might mean for gut health.";
              console.log('Enhanced system prompt with user data including test results');
              console.log('Medical conditions found:', healthProfile?.medical_conditions || 'None');
              console.log('Test results found:', testResults?.length || 0);
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
    
    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).slice(-5).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];
    
    // Create the user message
    const userMessage: any = { role: 'user', content: message };
    
    // Add image if provided
    if (imageData) {
      // Ensure the image data is in the correct format for OpenAI
      let processedImageData = imageData;
      
      // If it's a data URL, keep it as is (OpenAI accepts data URLs)
      // But ensure it has the correct MIME type
      if (imageData.startsWith('data:image/')) {
        // Extract the format and ensure it's supported
        const formatMatch = imageData.match(/data:image\/([^;]+)/);
        const format = formatMatch ? formatMatch[1].toLowerCase() : 'unknown';
        
        console.log('Image format detected:', format);
        
        // Convert unsupported formats to supported ones
        if (!['png', 'jpeg', 'jpg', 'gif', 'webp'].includes(format)) {
          console.log('Converting unsupported format to PNG');
          // For now, we'll assume it's a valid image and let OpenAI handle it
          // In a production app, you might want to convert the image format here
        }
      }
      
      userMessage.content = [
        { type: 'text', text: message },
        { 
          type: 'image_url', 
          image_url: { 
            url: processedImageData,
            detail: 'high'
          } 
        }
      ];
    }
    
    messages.push(userMessage);
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
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
