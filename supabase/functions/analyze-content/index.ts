import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== EDGE FUNCTION CALLED ===');
  console.log('Method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Reading request body...');
    const requestBody = await req.json();
    const { fileName, fileType, content, isUrl } = requestBody;
    
    console.log('Request data:', {
      fileName,
      fileType,
      contentLength: content?.length || 0,
      isUrl
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!fileName || !fileType) {
      throw new Error('fileName and fileType are required');
    }

    let messages: any[] = [];

    if (fileType.startsWith('image/') || fileType === 'image/url') {
      console.log('Processing image analysis with enhanced prompts');
      
      const imageContent = isUrl ? content : content;
      
      messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Sei un esperto forense digitale. Analizza questa immagine per identificare deepfakes e manipolazioni.

ANALISI TECNICA RICHIESTA:
- Artefatti di compressione e pattern anomali
- Coerenza illuminazione e ombre
- Proporzioni anatomiche/geometriche
- Texture pelle/capelli (lisciatura artificiale?)
- Bordi e transizioni (clonazione/sfocature)
- Pattern rumore digitale
- Qualità inconsistente

ANALISI CONTENUTO:
- Coerenza contestuale
- Credibilità scena
- Plausibilità fisica

INDICATORI MANIPOLAZIONE:
- AI generation (GAN, diffusion)
- Face swap artifacts
- Clonazione oggetti
- Alterazioni background

Rispondi in formato JSON:
{
  "description": "Descrizione concisa (max 200 caratteri)",
  "evaluation": {
    "score": <0-100, dove 100=autentico, 0=falso>,
    "verdict": "<Autentico|Probabilmente Autentico|Sospetto|Probabilmente Manipolato|Manipolato>",
    "reasoning": "Spiegazione della valutazione (2-3 frasi)",
    "breakdown": {
      "technicalAuthenticity": {
        "score": <0-100>,
        "details": "Valutazione tecnica: artefatti, illuminazione, texture"
      },
      "contentCredibility": {
        "score": <0-100>,
        "details": "Credibilità: plausibilità scena, coerenza fisica"
      },
      "manipulationRisk": {
        "score": <0-100, dove 100=alto rischio>,
        "details": "Indicatori manipolazione specifici"
      },
      "sourceReliability": {
        "score": <0-100>,
        "details": "Qualità e professionalità immagine"
      }
    },
    "contextAnalysis": "Analisi contestuale: elementi temporali/geografici/culturali"
  }
}

IMPORTANTE: Rispondi SOLO con JSON valido.`,
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
      console.log('Processing webpage with enhanced prompts');
      
      const webResponse = await fetch(content);
      if (!webResponse.ok) {
        throw new Error(`Failed to fetch URL: ${webResponse.status}`);
      }
      const htmlContent = await webResponse.text();
      
      messages = [
        {
          role: 'user',
          content: `Sei un esperto fact-checking. Analizza questa pagina web per credibilità e affidabilità.

ANALISI FONTE:
- Reputazione dominio
- Certificazioni e trasparenza
- Fact-checking e fonti
- Qualità tecnica

ANALISI CONTENUTO:
- Accuratezza fattuale
- Presenza bias/sensazionalismo
- Linguaggio emotivo vs oggettivo
- Prove e documentazione

INDICATORI MANIPOLAZIONE:
- Click-bait/titoli fuorvianti
- Manipolazione emotiva
- Omissione contesto
- Fonti dubbie

URL: ${fileName}
Contenuto: ${htmlContent.substring(0, 8000)}

Rispondi in JSON:
{
  "description": "Descrizione (max 200 caratteri)",
  "evaluation": {
    "score": <0-100, dove 100=massima affidabilità>,
    "verdict": "<Affidabile|Probabilmente Affidabile|Dubbio|Probabilmente Non Affidabile|Non Affidabile>",
    "reasoning": "Spiegazione (2-3 frasi)",
    "breakdown": {
      "technicalAuthenticity": {
        "score": <0-100>,
        "details": "Valutazione tecnica sito"
      },
      "contentCredibility": {
        "score": <0-100>,
        "details": "Accuratezza fattuale, fonti"
      },
      "manipulationRisk": {
        "score": <0-100>,
        "details": "Bias, sensazionalismo"
      },
      "sourceReliability": {
        "score": <0-100>,
        "details": "Reputazione autore/editore"
      }
    },
    "contextAnalysis": "Confronto con altre fonti, pattern disinformazione"
  }
}

IMPORTANTE: Rispondi SOLO con JSON valido.`,
        },
      ];
    } else if (fileType.startsWith('text/') || fileType === 'application/pdf') {
      console.log('Processing text/pdf with enhanced prompts');
      
      messages = [
        {
          role: 'user',
          content: `Sei un esperto fact-checking. Analizza questo testo per credibilità.

ANALISI TECNICA:
- Accuratezza fattuale
- Coerenza logica
- Fonti verificabili
- Qualità scrittura

ANALISI CONTENUTO:
- Claims verificabili vs opinioni
- Completezza
- Omissioni critiche

INDICATORI MANIPOLAZIONE:
- Bias evidente
- Linguaggio emotivo
- Generalizzazioni
- Fallacie logiche

Testo: ${content.substring(0, 4000)}

Rispondi in JSON:
{
  "description": "Descrizione (max 200 caratteri)",
  "evaluation": {
    "score": <0-100, dove 100=massima credibilità>,
    "verdict": "<Credibile|Probabilmente Credibile|Dubbio|Probabilmente Non Credibile|Non Credibile>",
    "reasoning": "Spiegazione (2-3 frasi)",
    "breakdown": {
      "technicalAuthenticity": {
        "score": <0-100>,
        "details": "Accuratezza fattuale, coerenza"
      },
      "contentCredibility": {
        "score": <0-100>,
        "details": "Verificabilità claims, fonti"
      },
      "manipulationRisk": {
        "score": <0-100>,
        "details": "Bias, linguaggio emotivo"
      },
      "sourceReliability": {
        "score": <0-100>,
        "details": "Trasparenza, consenso esperto"
      }
    },
    "contextAnalysis": "Confronto con altre fonti"
  }
}

IMPORTANTE: Rispondi SOLO con JSON valido.`,
        },
      ];
    } else if (fileType.startsWith('video/') || fileType === 'video/url') {
      console.log('Processing video with enhanced guidance');
      const videoRef = isUrl ? content : fileName;
      
      messages = [
        {
          role: 'user',
          content: `Sei un esperto deepfake video detection. Fornisci guida per analisi manuale.

INDICATORI CRITICI:
- Inconsistenze facciali
- Sincronizzazione audio-video
- Anomalie illuminazione
- Artefatti boundary viso
- Pattern blinking
- Discontinuità background

Video: ${videoRef}

Rispondi in JSON:
{
  "description": "File video - richiede analisi manuale (max 200 caratteri)",
  "evaluation": {
    "score": 50,
    "verdict": "Da Verificare Manualmente",
    "reasoning": "I video richiedono analisi frame-by-frame specializzata. Verifica sincronizzazione audio-video, coerenza facciale, metadata.",
    "breakdown": {
      "technicalAuthenticity": {
        "score": 50,
        "details": "Impossibile verificare senza analisi frame-by-frame"
      },
      "contentCredibility": {
        "score": 50,
        "details": "Richiede review manuale"
      },
      "manipulationRisk": {
        "score": 50,
        "details": "Video soggetti a deepfake. Verifica manuale necessaria"
      },
      "sourceReliability": {
        "score": 50,
        "details": "Verifica metadata e origine"
      }
    },
    "contextAnalysis": "Verifica cross-reference, confronta con originali"
  }
}

IMPORTANTE: Rispondi SOLO con JSON valido.`,
        },
      ];
    } else {
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
    console.error('Error:', error);
    
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
