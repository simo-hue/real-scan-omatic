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
      
      const imageContent = isUrl ? content : content;
      
      messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analizza questa immagine e fornisci una risposta ESCLUSIVAMENTE in formato JSON valido, senza alcun testo aggiuntivo prima o dopo.

Struttura richiesta:
{
  "description": "Descrizione dettagliata dell'immagine: soggetti principali, oggetti, scene, contesto visivo, composizione, colori e illuminazione",
  "evaluation": {
    "score": <numero intero da 0 a 100, dove 0 = sicuramente AI-generato/deepfake, 100 = sicuramente reale/autentico>,
    "verdict": "Probabilmente reale" oppure "Probabilmente AI-generato" oppure "Incerto",
    "reasoning": "Analisi tecnica dettagliata considerando: qualità generale, presenza di artefatti digitali, incongruenze di illuminazione e ombre, proporzioni e geometria, texture della pelle (se applicabile), naturalezza dello sfondo, coerenza generale dell'immagine. Specifica eventuali segnali di manipolazione trovati."
  }
}

IMPORTANTE: Rispondi SOLO con JSON valido, nient'altro.`,
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
      
      try {
        const webResponse = await fetch(content);
        if (!webResponse.ok) {
          throw new Error(`Failed to fetch URL: ${webResponse.status}`);
        }
        const htmlContent = await webResponse.text();
        
        messages = [
          {
            role: 'user',
            content: `Analizza questa pagina web e fornisci una risposta ESCLUSIVAMENTE in formato JSON valido.

Struttura richiesta:
{
  "description": "Riassunto dettagliato del contenuto principale della pagina, scopo e argomenti trattati",
  "evaluation": {
    "score": <numero intero da 0 a 100, dove 0 = disinformazione certa, 100 = fonte completamente affidabile>,
    "verdict": "Affidabile" oppure "Sospetto" oppure "Disinformazione",
    "reasoning": "Analisi critica dettagliata considerando: credibilità e reputazione della fonte, presenza di bias evidenti, verifica dei fatti presentati, qualità del linguaggio utilizzato, presenza di clickbait o sensazionalismo, riferimenti e citazioni, coerenza delle informazioni"
  }
}

URL: ${fileName}
Contenuto: ${htmlContent.substring(0, 8000)}

IMPORTANTE: Rispondi SOLO con JSON valido.`,
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
          role: 'user',
          content: `Analizza questo testo e fornisci una risposta ESCLUSIVAMENTE in formato JSON valido.

Struttura richiesta:
{
  "description": "Riassunto dei punti chiave e argomenti principali del testo, tema centrale, struttura e organizzazione",
  "evaluation": {
    "score": <numero intero da 0 a 100, dove 0 = sicuramente falso/disinformazione, 100 = completamente accurato e verificabile>,
    "verdict": "Accurato" oppure "Sospetto" oppure "Disinformazione",
    "reasoning": "Analisi dettagliata considerando: verifica dei fatti presentati, logica e coerenza dell'argomentazione, presenza e qualità delle fonti citate, bias evidenti, possibili segnali di contenuto AI-generato, tono e stile di scrittura, pubblico target e intento"
  }
}

Testo: ${content.substring(0, 4000)}

IMPORTANTE: Rispondi SOLO con JSON valido.`,
        },
      ];
    } else if (fileType.startsWith('video/') || fileType === 'video/url') {
      console.log('Processing video', isUrl ? 'URL' : 'file');
      const videoRef = isUrl ? content : fileName;
      messages = [
        {
          role: 'user',
          content: `Fornisci un'analisi per questo video in formato JSON valido.

Struttura richiesta:
{
  "description": "Descrizione del contenuto del video basata su URL, nome file e contesto disponibile",
  "evaluation": {
    "score": <numero intero da 0 a 100, dove 0 = molto sospetto/deepfake probabile, 100 = probabilmente autentico>,
    "verdict": "Da verificare manualmente",
    "reasoning": "Guida dettagliata all'analisi manuale del video. Elenca i segnali specifici da cercare: sincronizzazione labiale, movimenti oculari e battiti di ciglia, coerenza dell'illuminazione frame-by-frame, artefatti digitali ai bordi del viso, texture e naturalezza della pelle, microespressioni facciali, transizioni anomale, qualità video inconsistente, elementi specifici da controllare frame-by-frame"
  }
}

Video: ${videoRef}

Nota: L'analisi video completa richiede visione diretta. Fornisci una guida per l'analisi manuale dell'utente.
IMPORTANTE: Rispondi SOLO con JSON valido.`,
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
