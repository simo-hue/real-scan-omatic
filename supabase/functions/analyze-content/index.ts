import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileType, content } = await req.json();
    console.log('Analyzing file:', fileName, 'Type:', fileType);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let messages: any[] = [];

    if (fileType.startsWith('image/')) {
      console.log('Processing image file');
      messages = [
        {
          role: 'system',
          content: 'Sei un esperto analista di immagini specializzato nel riconoscimento di deepfake e contenuti manipolati. Fornisci un\'analisi dettagliata e strutturata dell\'immagine in italiano, descrivendo: 1) Soggetti e oggetti principali 2) Possibili segni di manipolazione digitale (artefatti, incongruenze di illuminazione, texture anomale) 3) Composizione e layout 4) Colori e illuminazione 5) Autenticità percepita. Usa paragrafi chiari e separati. Sii specifico sui segnali di deepfake se presenti.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analizza questa immagine in modo dettagliato, prestando particolare attenzione a possibili segni di manipolazione o generazione AI.',
            },
            {
              type: 'image_url',
              image_url: {
                url: content,
              },
            },
          ],
        },
      ];
    } else if (fileType.startsWith('text/') || fileType === 'application/pdf') {
      console.log('Processing text/pdf file');
      messages = [
        {
          role: 'system',
          content: 'Sei un esperto analista di testo. Fornisci un\'analisi dettagliata e strutturata del contenuto in italiano, includendo: 1) Tema e argomento principale 2) Tono e stile di scrittura 3) Punti chiave e messaggi principali 4) Struttura e organizzazione 5) Pubblico target e scopo 6) Possibili incongruenze o segnali di contenuto generato da AI. Usa paragrafi chiari e separati.',
        },
        {
          role: 'user',
          content: `Analizza questo testo in modo dettagliato e strutturato:\n\n${content.substring(0, 4000)}`,
        },
      ];
    } else if (fileType.startsWith('video/')) {
      console.log('Processing video file');
      messages = [
        {
          role: 'system',
          content: 'Sei un esperto analista video specializzato nel riconoscimento di deepfake. Fornisci suggerimenti dettagliati su cosa analizzare in un video in italiano, includendo: sincronizzazione labiale, movimenti oculari, coerenza dell\'illuminazione, artefatti digitali, e altri segnali di manipolazione.',
        },
        {
          role: 'user',
          content: `Fornisci un'analisi dettagliata e consigli per un file video chiamato: ${fileName}. Spiega quali segnali di deepfake cercare.`,
        },
      ];
    } else {
      console.error('Unsupported file type:', fileType);
      throw new Error(`Tipo di file non supportato: ${fileType}`);
    }

    console.log('Calling AI API...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Limite di richieste superato. Riprova tra qualche minuto.');
      }
      if (response.status === 402) {
        throw new Error('Crediti esauriti. Aggiungi crediti al tuo workspace Lovable.');
      }
      
      throw new Error(`Errore AI API: ${response.status} - ${errorText}`);
    }

    console.log('Streaming AI response started successfully');

    // Return the streaming response directly to the client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in analyze-content function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
