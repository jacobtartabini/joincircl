
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
    const { contact } = await req.json();

    const prompt = `Generate 2-3 personalized recommendations for staying connected with this contact:

Contact Details:
- Name: ${contact.name}
- Company: ${contact.company || 'Not specified'}
- Industry: ${contact.industry || 'Not specified'}
- Job Title: ${contact.jobTitle || 'Not specified'}
- Location: ${contact.location || 'Not specified'}
- Notes: ${contact.notes || 'None'}
- Tags: ${contact.tags?.join(', ') || 'None'}

Please provide strategic, actionable recommendations that would be valuable for maintaining and strengthening this professional relationship. Each recommendation should include:

1. A type (conversation, collaboration, reminder, or connection)
2. A clear title (max 5 words)
3. A specific description (1-2 sentences)
4. An action text for the button (max 3 words)

Format as JSON array with objects containing: type, title, description, actionText

Focus on:
- Industry-specific conversation starters
- Collaboration opportunities based on their role
- Timely follow-up suggestions
- Mutual connection possibilities
- Professional development opportunities

Make recommendations specific to this person, not generic networking advice.`;

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
            content: 'You are a professional networking strategist who provides personalized, actionable recommendations for maintaining business relationships. Always respond with valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    const data = await response.json();
    let recommendations = [];

    try {
      const content = data.choices[0].message.content;
      recommendations = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback recommendations
      recommendations = [
        {
          type: 'conversation',
          title: 'Industry Check-in',
          description: `Reach out to ${contact.name} about recent developments in their field.`,
          actionText: 'Send message'
        },
        {
          type: 'collaboration',
          title: 'Explore Partnership',
          description: 'Consider potential collaboration opportunities based on mutual interests.',
          actionText: 'Schedule call'
        }
      ];
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
