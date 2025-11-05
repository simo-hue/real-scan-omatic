import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== EDGE FUNCTION CALLED ===');
  console.log('Method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Reading request body...');
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON:', jsonError);
      throw new Error('Invalid JSON in request body');
    }
    
    const { fileName, fileType, content, isUrl } = requestBody;
    console.log('Request data:', {
      fileName,
      fileType,
      contentLength: content?.length || 0,
      isUrl,
      contentPreview: typeof content === 'string' ? content.substring(0, 100) : 'non-string'
    });

    console.log('Checking LOVABLE_API_KEY...');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured in environment');
      throw new Error('LOVABLE_API_KEY is not configured');
    }
    console.log('LOVABLE_API_KEY found:', LOVABLE_API_KEY.substring(0, 10) + '...');

    if (!fileName || !fileType) {
      console.error('Missing required fields:', { fileName, fileType });
      throw new Error('fileName and fileType are required');
    }

    console.log('Building AI messages...');

    let messages: any[] = [];

    if (fileType.startsWith('image/') || fileType === 'image/url') {
      console.log('Processing image', isUrl ? 'from URL' : 'file');
      
      // For URLs, use the URL directly; for uploads, use base64
      const imageContent = isUrl ? content : content;
      
      messages = [
        {
          role: 'system',
          content: 'Sei un esperto analista di immagini specializzato nel riconoscimento di deepfake e contenuti manipolati. Fornisci un\'analisi dettagliata e strutturata dell\'immagine in italiano, descrivendo: 1) Soggetti e oggetti principali 2) Possibili segni di manipolazione digitale (artefatti, incongruenze di illuminazione, texture anomale, bordi sfocati) 3) Composizione e layout 4) Colori e illuminazione 5) Autenticità percepita (0-100%). Usa paragrafi chiari e separati. Sii specifico sui segnali di deepfake se presenti.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analizza questa immagine in modo dettagliato, prestando particolare attenzione a possibili segni di manipolazione, deepfake o generazione AI. Fornisci una percentuale di autenticità alla fine.',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageContent,
              },
            },
          ],
        },
      ];
    } else if (fileType === 'text/html') {
      console.log('Processing webpage from URL');
      
      // Fetch webpage content
      try {
        const webResponse = await fetch(content);
        if (!webResponse.ok) {
          throw new Error(`Failed to fetch URL: ${webResponse.status}`);
        }
        const htmlContent = await webResponse.text();
        
        messages = [
          {
            role: 'system',
            content: 'Sei un esperto analista web. Fornisci un\'analisi dettagliata del contenuto della pagina web in italiano, includendo: 1) Scopo e contenuto principale 2) Credibilità e affidabilità della fonte 3) Segnali di potenziale disinformazione 4) Stile e qualità del contenuto 5) Raccomandazioni. Usa paragrafi chiari e separati.',
          },
          {
            role: 'user',
            content: `Analizza il contenuto di questa pagina web in modo dettagliato:\n\nURL: ${fileName}\n\nContenuto:\n${htmlContent.substring(0, 8000)}`,
          },
        ];
      } catch (fetchError) {
        console.error('Error fetching URL:', fetchError);
        throw new Error(`Impossibile accedere all'URL: ${fetchError instanceof Error ? fetchError.message : 'Errore sconosciuto'}`);
      }
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
    } else if (fileType.startsWith('video/') || fileType === 'video/url') {
      console.log('Processing video', isUrl ? 'URL' : 'file');
      const videoRef = isUrl ? content : fileName;
      messages = [
        {
          role: 'system',
          content: 'Sei un esperto analista video specializzato nel riconoscimento di deepfake. Fornisci suggerimenti dettagliati su cosa analizzare in un video in italiano, includendo: sincronizzazione labiale, movimenti oculari, battiti di ciglia, coerenza dell\'illuminazione frame-by-frame, artefatti digitali ai bordi del viso, texture della pelle, microespressioni, e altri segnali di manipolazione. Spiega anche come verificare l\'autenticità.',
        },
        {
          role: 'user',
          content: `Fornisci un'analisi dettagliata e consigli per verificare l'autenticità di questo video: ${videoRef}. Elenca tutti i segnali di deepfake da cercare e come identificarli.`,
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

    console.log('AI streaming started successfully');
    console.log('Returning stream to client...');

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
    console.error('=== EDGE FUNCTION ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Full error object:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorResponse = { 
      error: errorMessage,
      timestamp: new Date().toISOString(),
      details: error instanceof Error ? error.stack : undefined
    };
    
    console.log('Sending error response:', errorResponse);
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
