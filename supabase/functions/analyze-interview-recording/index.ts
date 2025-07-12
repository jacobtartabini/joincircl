import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoBase64, audioBase64, question, jobTitle, company } = await req.json();

    if (!videoBase64 || !audioBase64) {
      throw new Error('Video and audio data are required');
    }

    // Analyze audio transcription first
    const audioAnalysis = await analyzeAudio(audioBase64, question, jobTitle, company);
    
    // Analyze video for body language and visual cues
    const visualAnalysis = await analyzeVideo(videoBase64, question);

    // Combine analyses for comprehensive feedback
    const combinedAnalysis = {
      ...audioAnalysis,
      ...visualAnalysis,
      overallScore: Math.round((audioAnalysis.contentScore + visualAnalysis.bodyLanguageScore) / 2),
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(combinedAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-interview-recording function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeAudio(audioBase64: string, question: string, jobTitle: string, company: string) {
  // Convert audio to transcription
  const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
  const formData = new FormData();
  const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');

  const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
    },
    body: formData,
  });

  if (!transcriptionResponse.ok) {
    throw new Error(`Transcription failed: ${await transcriptionResponse.text()}`);
  }

  const transcription = await transcriptionResponse.json();
  const responseText = transcription.text;

  // Analyze content quality
  const analysisPrompt = `
    Analyze this interview response for a ${jobTitle} position at ${company}.
    
    Question: "${question}"
    Response: "${responseText}"
    
    Provide analysis in this exact JSON format:
    {
      "contentScore": <number 0-100>,
      "structureClarity": <number 0-100>,
      "relevance": <number 0-100>,
      "specificityScore": <number 0-100>,
      "confidenceLevel": <number 0-100>,
      "wordCount": <number>,
      "keyStrengths": ["strength1", "strength2", "strength3"],
      "improvementAreas": ["area1", "area2", "area3"],
      "fillerWordCount": <number>,
      "speechRate": <number words per minute>,
      "transcription": "${responseText}"
    }
    
    Focus on:
    - Content relevance to the question and role
    - Use of specific examples and achievements
    - Structure and clarity of response
    - Professional language and confidence
    - Areas for improvement
  `;

  const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert interview coach analyzing interview responses. Return only valid JSON.' },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3,
    }),
  });

  if (!analysisResponse.ok) {
    throw new Error(`Content analysis failed: ${await analysisResponse.text()}`);
  }

  const analysisResult = await analysisResponse.json();
  const contentAnalysis = JSON.parse(analysisResult.choices[0].message.content);

  return contentAnalysis;
}

async function analyzeVideo(videoBase64: string, question: string) {
  // For video analysis, we'll use OpenAI's vision capabilities
  const analysisPrompt = `
    Analyze this interview video frame for professional presence and body language.
    
    Question context: "${question}"
    
    Provide analysis in this exact JSON format:
    {
      "bodyLanguageScore": <number 0-100>,
      "eyeContactScore": <number 0-100>,
      "facialExpressionScore": <number 0-100>,
      "postureScore": <number 0-100>,
      "gestureScore": <number 0-100>,
      "professionalPresence": <number 0-100>,
      "visualStrengths": ["strength1", "strength2", "strength3"],
      "visualImprovements": ["improvement1", "improvement2", "improvement3"],
      "eyeContactPercentage": <number 0-100>,
      "smilingPercentage": <number 0-100>,
      "postureQuality": "excellent|good|fair|poor"
    }
    
    Focus on:
    - Eye contact with camera (not screen)
    - Facial expressions and engagement
    - Body posture and positioning
    - Hand gestures and movement
    - Overall professional appearance
    - Confidence and presence
  `;

  const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
          content: 'You are an expert body language and presentation coach analyzing interview videos. Return only valid JSON.' 
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: analysisPrompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${videoBase64.substring(0, 100000)}` // Limit size for API
              }
            }
          ]
        }
      ],
      temperature: 0.3,
    }),
  });

  if (!visionResponse.ok) {
    throw new Error(`Video analysis failed: ${await visionResponse.text()}`);
  }

  const visionResult = await visionResponse.json();
  const visualAnalysis = JSON.parse(visionResult.choices[0].message.content);

  return visualAnalysis;
}