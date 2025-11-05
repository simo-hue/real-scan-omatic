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
    const { fileName, fileType, content, isUrl, fftAnalysis } = requestBody;
    
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
      
      // Add FFT analysis info to prompt if available
      let fftInfo = '';
      if (fftAnalysis) {
        fftInfo = `

═══ ANALISI FFT/DCT PRE-ESEGUITA (INTEGRA NELLA VALUTAZIONE) ═══
- High-Frequency Ratio: ${fftAnalysis.highFrequencyRatio.toFixed(4)} ${fftAnalysis.highFrequencyRatio < 0.15 ? '⚠️ SOSPETTO (sotto threshold AI-generation)' : '✓ NORMALE'}
- Spectral Anomaly: ${fftAnalysis.spectralAnomaly.toFixed(4)} ${fftAnalysis.spectralAnomaly > 0.3 ? '⚠️ ANOMALIA RILEVATA' : '✓ NELLA NORMA'}
- AI-Generated Detection: ${fftAnalysis.isAiGenerated ? '⚠️ POSITIVO (pattern compatibile con GAN/Diffusion)' : '✓ NEGATIVO'}
- Confidence: ${(fftAnalysis.confidence * 100).toFixed(1)}%
- Note Tecniche: ${fftAnalysis.details}

**IMPORTANTE**: Questa analisi FFT client-side DEVE essere integrata nel "frequencyAnalysis" breakdown. Se il ratio < 0.15, è forte indicatore di AI-generation (GANs producono meno rumore ad alta frequenza). Assegna score di conseguenza.

`;
      }
      
      messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Sei un esperto FORENSE DIGITALE CERTIFICATO con 15+ anni in deepfake detection, computer vision forensics e analisi AI-generated content. Analizza questa immagine con metodologia scientifica rigorosa.
${fftInfo}

═══ PROTOCOLLO ANALISI TECNICA FORENSE ═══

▸ LAYER 1 - ARTEFATTI DIGITALI & COMPRESSIONE:
• Pattern di compressione JPEG anomali (blocchi 8x8 inconsistenti)
• Metadati EXIF: verifica software editing (Photoshop, GIMP, AI tools)
• Error Level Analysis (ELA): zone con differente livello di compressione
• Quantization tables: discrepanze indicano editing multipli
• Chroma subsampling anomalies (4:4:4 vs 4:2:0 in zone diverse)
• Double JPEG compression artifacts
• Rumore digitale: pattern gaussiano naturale vs artificiale
• Histogram anomalies: picchi sospetti, gap innaturali

▸ LAYER 2 - ILLUMINAZIONE & FISICA OTTICA (CRITICO):
• Direzione luce: coerenza tra soggetto e sfondo (angolo, intensità)
• Ombre: hard vs soft, coerenza con fonte luminosa, densità corretta
• Specularity: riflessi su superfici lucide (occhi, metallo, vetro)
• Color temperature: coerenza K° tra elementi (6500K daylight vs 3200K tungsten)
• Ambient occlusion: oscuramento naturale in cavità e pieghe
• Subsurface scattering su pelle (translucenza orecchie, dita)
• Chromatic aberration ai bordi dell'immagine (presente in foto reali)
• Lens distortion: barrel/pincushion naturale vs assente in AI

▸ LAYER 3 - ANATOMIA & BIOMETRIA (PER VOLTI/PERSONE):
• Proportions: golden ratio, regola dei terzi, distanze intercantali
• Simmetria facciale: asimmetria naturale vs eccessiva simmetria AI
• Microespressioni: coerenza muscolare (AU - Action Units)
• Texture pelle: pori, imperfezioni, rughe micro (AI tende a smooth)
• Capelli: strand singoli, physics naturale, no pattern ripetitivi
• Occhi: pupilla reflection catchlights, sclera bloodshot realistico
• Denti: irregolarità naturali vs perfezione artificiale
• Orecchie: asimmetria, dettagli cartilaginei complessi
• Mani: anatomia dita (AI spesso sbaglia numero/posizione)
• Postura e gesti: plausibilità biomeccanica

▸ LAYER 4 - DEEPFAKE DETECTION SPECIFICO:
• GAN fingerprints: pattern spectral high-frequency (spesso assenti)
• Face boundary artifacts: bordi innaturali, hair-face transition
• Temporal inconsistencies: frame blending se video->still
• Teeth/tongue artifacts: zone comuni di failure in face swap
• Ear reconstruction: GANs spesso generano orecchie malformate
• Background coherence: focus depth consistency
• Cloning stamps: pattern identici ripetuti (Content-Aware Fill detection)
• Frequency domain analysis: anomalie FFT vs foto reali
• Checkerboard artifacts tipici upsampling neural networks
• Color fringing ai bordi: indicatore compositing layers

▸ LAYER 5 - CONTESTO & SEMANTICA:
• Plausibilità scena: elementi anacronistici, impossibili
• Gravity & physics: oggetti, liquidi, tessuti comportamento realistico
• Text & logos: coerenza, leggibilità, perspective correctness
• Reflections & mirrors: coerenza geometrica perfetta
• Depth of field: bokeh naturale vs artificiale, focus stacking
• Weather & lighting conditions: coerenza meteorologica
• Cultural/temporal markers: abbigliamento, tecnologia, architettura epoca corretta
• Geolocation plausibility: flora, fauna, architettura coerente con location

▸ LAYER 6 - INDICATORI AI GENERATION (MIDJOURNEY/DALL-E/STABLE DIFFUSION):
• "AI smoothness": pelle troppo perfetta, dettagli innaturalmente nitidi
• Impossible geometry: architettura euclidea violata
• Uncanny valley: quasi-reale ma "off"
• Repetitive patterns: texture che si ripetono (AI pattern memorization)
• Nonsensical details: testo gibberish, simboli inventati
• "Dreamy" aesthetics: stile tipico diffusion models
• Missing shadows o ombre impossibili
• Perfect symmetry innaturale (AI bias verso simmetria)

═══ FORMATO RISPOSTA JSON RICHIESTO ═══

{
  "description": "Descrizione ULTRA-CONCISA cosa mostra immagine (MAX 180 caratteri)",
  "evaluation": {
    "score": <INTEGER 0-100, dove 100=CERTAMENTE AUTENTICO foto reale da camera, 0=CERTAMENTE FAKE AI-generated/manipolato>,
    "verdict": "<Autentico|Probabilmente Autentico|Sospetto|Probabilmente Manipolato|Manipolato>",
    "reasoning": "Sintesi DETTAGLIATA del verdetto: quali layer hanno mostrato anomalie, specificando ESATTAMENTE cosa hai trovato (es: 'ombre incoerenti 45° a sinistra mentre illuminazione suggerisce 90° destra', 'pattern compressione JPEG doppio in zona volto ma non sfondo', 'texture pelle troppo smooth senza pori visibili a 100% zoom'). MINIMO 3 frasi, MASSIMO 5 frasi. DEVI essere SPECIFICO.",
    "breakdown": {
      "technicalAuthenticity": {
        "score": <0-100>,
        "details": "DETTAGLIO COMPLETO: artefatti compressione rilevati? pattern rumore digitale naturale o artificiale? metadati editing software? ELA inconsistencies? histogram anomalie? chroma subsampling issues? SPECIFICA coordinate/zone se possibile. MINIMO 50 parole."
      },
      "contentCredibility": {
        "score": <0-100>,
        "details": "ANALISI APPROFONDITA: illuminazione coerente? ombre corrette? fisica rispettata? anatomia plausibile? elementi contestuali credibili? proporzioni corrette? reflections accurate? depth of field naturale? FORNISCI esempi specifici. MINIMO 50 parole."
      },
      "manipulationRisk": {
        "score": <0-100, dove 100=ALTISSIMO rischio fake>,
        "details": "INDICATORI PRECISI: quali specifici segnali deepfake/AI trovati? GAN fingerprints? face swap artifacts? cloning detection? impossibile geometry? AI smoothness? texture ripetitive? Se NESSUN indicatore, SPIEGA cosa conferma autenticità. MINIMO 50 parole."
      },
      "sourceReliability": {
        "score": <0-100>,
        "details": "VALUTAZIONE PROFESSIONALITÀ: qualità immagine (risoluzione, nitidezza)? setup fotografico professionale o amatoriale? post-processing evidente? watermark/signature? camera quality indicators? coerenza metadati con apparente qualità? MINIMO 40 parole."
      }
    },
    "contextAnalysis": "ANALISI CONTESTUALE ESTESA: elementi temporali (epoca, tecnologia visibile, moda)? markers geografici/culturali (architettura, flora, segnaletica)? coerenza meteorologica? plausibilità evento/scenario? confronto con pattern noti di disinformazione? Se immagine mostra persone note, coerenza con altre foto pubbliche? MINIMO 60 parole. MASSIMO 120 parole.",
    "frequencyAnalysis": {
      "score": <0-100, dove 100=CERTAMENTE NATURALE, 0=CERTAMENTE AI-GENERATED>,
      "details": "ANALISI FREQUENCY DOMAIN: integra risultati FFT/DCT pre-calcolati (se disponibili). High-frequency ratio interpretation (< 0.15 = sospetto AI, > 0.20 = naturale). Spectral anomalies rilevate. Pattern compatibile con GANs/Diffusion models? Rumore sensore fotocamera presente? SPECIFICA cosa indicano i dati FFT. MINIMO 80 parole."
    }
  }
}

🔴 REGOLE CRITICHE:
1. USA TERMINOLOGIA TECNICA PRECISA
2. QUANTIFICA quando possibile (angoli, percentuali, coordinate)
3. Se INCERTO, AMMETTILO e spiega perché
4. REASONING + DETAILS devono contenere FATTI SPECIFICI, non generalizzazioni
5. Ogni "details" deve avere MINIMO le parole indicate
6. Rispondi ESCLUSIVAMENTE con JSON valido, nessun testo prima/dopo
7. Usa <INTEGER> per score (no decimali)

INIZIA ANALISI FORENSE:`,
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
          content: `Sei un FACT-CHECKER CERTIFICATO con expertise in giornalismo investigativo, media literacy, OSINT (Open Source Intelligence) e analisi disinformazione. Analizza questa pagina web con metodologia IFCN (International Fact-Checking Network).

═══ PROTOCOLLO FACT-CHECKING PROFESSIONALE ═══

▸ LAYER 1 - ANALISI FONTE & DOMINIO:
• Domain reputation: WHOIS data, età dominio, registrar
• SSL certificate: validità, tipo (EV, OV, DV), emissione
• DNS records: MX, SPF, DMARC (indicatori professionalità)
• Top-Level Domain: .com/.org/.edu/.gov vs .xyz/.click sospetti
• Alexa/SimilarWeb ranking: traffico, bounce rate, demographics
• Presenza Wikipedia, Wikidata, schema.org markup
• Archive.org Wayback Machine: storia modifiche, longevità
• Blacklist check: presence in misinformation databases
• Social media presence: followers authenticity, engagement rate
• Contact info: indirizzo fisico, telefono verificabili, team identifiable

▸ LAYER 2 - TRASPARENZA EDITORIALE & GOVERNANCE:
• About page: mission statement, ownership disclosure
• Editorial policy pubblicata e dettagliata
• Correction policy: come gestiscono errori
• Funding disclosure: advertising, sponsorizzazioni, conflitti interesse
• Byline: autore identificabile con credenziali verificabili
• Editorial board: nomi, credentials, expertise
• Fact-checking methodology dichiarata
• Privacy policy & Terms of Service compliance GDPR/CCPA
• Disclosure of AI-generated content (se applicabile)
• Third-party verification: NewsGuard, IFCN signatory, Trust Project

▸ LAYER 3 - QUALITÀ CONTENUTO & ACCURATEZZA:
• Factual claims: verificabili tramite fonti primarie
• Citations & references: link a studi peer-reviewed, dati ufficiali
• Date freshness: articolo aggiornato, dati recenti
• Statistical accuracy: numeri verificabili, grafici non misleading
• Quotes accuracy: virgolettati verificabili tramite trascrizioni originali
• Image/video sourcing: credits, Getty/Reuters vs stock/AI
• Scientific claims: consensus vs outlier opinions
• Expert sources: credenziali verificabili, no conflitti interesse
• Geographical accuracy: mappe, location data corretti
• Timeline coherence: sequenza eventi logica

▸ LAYER 4 - BIAS & MANIPOLAZIONE DETECTION:
• Political bias: left/right/center leaning (AllSides/MediaBias rating)
• Loaded language: emotionally charged words, exaggeration
• Cherry-picking: dati selezionati, omissione contesto critico
• False equivalence: "both sides" quando evidenze sbilanciate
• Clickbait indicators: titolo sensazionalistico vs contenuto
• Ad hominem attacks vs argomenti sostanziali
• Strawman arguments: misrepresenting opposing views
• Bandwagon effect: "tutti dicono", appeal to popularity
• Fear-mongering: allarmismo ingiustificato
• Conflict of interest: autore/editore beneficia da claim specifici

▸ LAYER 5 - DISINFORMAZIONE PATTERNS:
• Bot/troll amplification: condivisioni social anomale
• Coordinated inauthentic behavior: network analysis
• Deepfake/manipulated media: reverse image search, metadata
• Impersonation: fake account celeb/istituzioni
• Satire misidentified: The Onion, Lercio misunderstood
• Outdated news presented as recent
• Misleading headlines (titolo vs contenuto discrepancy)
• Conspiracy theory markers: vague "they", unfalsifiable claims
• Propaganda techniques: Overton window shifting
• Foreign interference indicators: RT, Sputnik, state-backed media

▸ LAYER 6 - CROSS-REFERENCE & VERIFICATION:
• Lateral reading: check altri 3+ fonti affidabili
• Primary source access: andare alla fonte originale
• Expert consultation: cosa dicono specialisti settore
• Fact-checking organizations: Snopes, PolitiFact, FactCheck.org verdict
• Scientific consensus: cosa dice peer-reviewed literature
• Official statements: governi, organizzazioni internazionali
• OSINT tools: Google Reverse Image, TinEye, InVID
• Claim review schema: structured data fact-check

URL ANALIZZATO: ${fileName}
CONTENUTO HTML: ${htmlContent.substring(0, 12000)}

═══ FORMATO RISPOSTA JSON RICHIESTO ═══

{
  "description": "Sintesi ULTRA-CONCISA argomento principale pagina e tipo fonte (MAX 180 caratteri)",
  "evaluation": {
    "score": <INTEGER 0-100, dove 100=FONTE MASSIMAMENTE AFFIDABILE giornalismo qualità, 0=DISINFORMAZIONE CERTA propaganda/fake news>,
    "verdict": "<Affidabile|Probabilmente Affidabile|Dubbio|Probabilmente Non Affidabile|Non Affidabile>",
    "reasoning": "Sintesi DETTAGLIATA: quali layer hanno rivelato problemi critici? Specifica ESATTAMENTE: bias trovati (con esempi testuali), claims non verificati (quali specificamente), red flags (citali precisamente), fonti mancanti (cosa non è citato). Se affidabile, spiega PERCHÉ (expertise autore, fonti verificate, ecc). MINIMO 4 frasi, MASSIMO 6 frasi.",
    "breakdown": {
      "technicalAuthenticity": {
        "score": <0-100>,
        "details": "ANALISI TECNICA COMPLETA: dominio età e registrar? SSL valido? presenza about/contact verificabile? social media footprint? ranking traffico? blacklist presence? schema markup? archive.org history? Indicatori professionalità tecnica infrastruttura. SPECIFICA cosa hai verificato. MINIMO 60 parole."
      },
      "contentCredibility": {
        "score": <0-100>,
        "details": "VERIFICA FATTUALE APPROFONDITA: claims principali verificabili? fonti primarie citate e linkate? dati statistici accurati? quotes verificati? immagini/video con source? expertise autore documentata? lateral reading supporta claims? consensus scientifico rispettato? FORNISCI esempi specifici claim + verifica. MINIMO 70 parole."
      },
      "manipulationRisk": {
        "score": <0-100, dove 100=ALTISSIMO rischio manipolazione>,
        "details": "DETECTION BIAS & DISINFORMAZIONE: loaded language rilevato? (cita esempi testuali) cherry-picking evidente? clickbait titolo vs contenuto? fear-mongering? conflitti interesse? propaganda patterns? conspiracy markers? bot amplification? SPECIFICA tecniche manipolazione trovate O spiega perché assenti. MINIMO 60 parole."
      },
      "sourceReliability": {
        "score": <0-100>,
        "details": "VALUTAZIONE REPUTAZIONE: trasparenza editoriale (funding disclosure, about page)? correction policy? fact-checking methodology? team identificabile? track record storico? third-party verification (NewsGuard rating, IFCN)? presenza media watchdogs? Se fonte nota (es: NYT, BBC), contestualizza reputazione. MINIMO 50 parole."
      }
    },
    "contextAnalysis": "ANALISI CROSS-REFERENCE & CONTESTO: lateral reading ad altre 3+ fonti cosa rivela? consensus su questo topic? ci sono fact-checks pubblicati da Snopes/PolitiFact/etc? Questa fonte ha storia disinformazione passata? Allineamento politico/ideologico evidente? Network analysis: chi condivide (bot/genuine)? Timing pubblicazione sospetto (pre-elezioni, durante crisis)? MINIMO 80 parole, MASSIMO 150 parole."
  }
}

🔴 REGOLE CRITICHE:
1. USA TERMINOLOGIA FACT-CHECKING PROFESSIONALE
2. CITA esempi TESTUALI quando rilevi bias/manipolazione
3. VERIFICA almeno 2-3 claim principali tramite lateral reading
4. Se dominio sconosciuto, AMMETTI limitazioni analisi
5. Ogni "details" deve avere MINIMO parole indicate
6. Reasoning deve contenere CLAIM SPECIFICI verificati/smentiti
7. Rispondi ESCLUSIVAMENTE con JSON valido
8. Usa INTEGER per score (no decimali)

INIZIA FACT-CHECK:`,
        },
      ];
    } else if (fileType.startsWith('text/') || fileType === 'application/pdf') {
      console.log('Processing text/pdf with enhanced prompts');
      
      messages = [
        {
          role: 'user',
          content: `Sei un ANALISTA TESTUALE FORENSE & FACT-CHECKER con expertise in linguistica computazionale, analisi retorica, detection AI-generated text, e verifica claims. Analizza questo testo con rigore accademico.

═══ PROTOCOLLO ANALISI TESTO FORENSE ═══

▸ LAYER 1 - ANALISI LINGUISTICA & STILOMETRIA:
• Complessità lessicale: Type-Token Ratio, vocabolario ricchezza
• Sentence structure: lunghezza media, complessità sintattica
• Readability scores: Flesch-Kincaid, SMOG index, Coleman-Liau
• Register linguistico: formale/informale, tecnico/divulgativo
• Coherence & cohesion: connettori logici, referential chains
• Voice consistency: active/passive ratio, person (1st/3rd)
• Tone analysis: neutral/biased, objective/subjective
• Temporal consistency: verb tenses coerenti
• Punctuation patterns: professionale vs casual
• Spelling/grammar: errori sistematici, autocorrect artifacts

▸ LAYER 2 - AI-GENERATED TEXT DETECTION:
• GPT fingerprints: pattern ripetitivi, transizioni troppo smooth
• Perplexity anomalies: testo troppo "perfetto", bassa entropia
• Repetitive structures: frasi formulaic, template-like
• Generic language: vago, non-specific, manca dettagli concreti
• "AI smoothness": transizioni innaturalmente fluide
• Hallucination markers: fatti plausibili ma inventati
• Lack of personal anecdotes: assenza esperienza vissuta
• Over-explanation: verbose unnecessarily
• Hedging language: "it seems", "might be", "potentially" overuse
• Prompt leakage: references to "as an AI", instructions visible

▸ LAYER 3 - VERIFICA FATTUALE & CLAIMS:
• Factual claims identification: separare fatti da opinioni
• Verifiability: claims verificabili tramite fonti pubbliche?
• Statistical accuracy: numeri, percentuali, dati verificabili
• Historical accuracy: date, eventi, cronologia corretta
• Scientific claims: allineamento con peer-reviewed consensus
• Geographic accuracy: luoghi, distanze, dati geo corretti
• Expert quotes: verificabili tramite interviews/pubblicazioni
• Primary vs secondary sources: originale o hearsay?
• Temporal relevance: dati aggiornati o obsoleti
• Contradictions: inconsistenze interne testo

▸ LAYER 4 - ANALISI LOGICA & ARGOMENTATIVA:
• Logical fallacies detection:
  - Ad hominem: attacchi personali
  - Straw man: misrepresenting argomenti opposti
  - False dilemma: o/o quando esistono alternative
  - Slippery slope: conseguenze esagerate
  - Appeal to authority: esperti non qualificati
  - Hasty generalization: conclusioni da sample insufficiente
  - Post hoc ergo propter hoc: correlazione ≠ causazione
  - Cherry-picking: dati selezionati ignorando contrari
  - False equivalence: comparazioni inappropriate
  - Circular reasoning: petitio principii
• Argument structure: premesse → reasoning → conclusioni valide?
• Evidence quality: aneddoti vs studi sistematici
• Counter-arguments addressed: one-sided vs balanced?

▸ LAYER 5 - BIAS & MANIPULATION DETECTION:
• Emotional manipulation: fear, anger, disgust appeals
• Loaded language: words con connotazioni forti
• Euphemisms & dysphemisms: language framing
• Propaganda techniques: bandwagon, glittering generalities
• Us vs them: in-group/out-group divisiveness
• Scapegoating: blame attribution
• Moral panic: exaggerated threats
• Confirmation bias: cherry-picking supportive info
• Sensationalism: hyperbole, exaggeration
• Clickbait elements: curiosity gap, shock value
• Dog whistles: coded language per specific audience
• Gaslighting markers: negazione realtà, manipulation

▸ LAYER 6 - SOURCE & AUTHORSHIP ANALYSIS:
• Author credentials: expertise nel topic?
• Conflict of interest: autore beneficia da certe conclusioni?
• Attribution: fonti citate adeguatamente?
• Plagiarism check: originale o copiato?
• Citations quality: fonti autorevoli o blog random?
• Primary sources cited: accesso materiale originale?
• Transparency: metodologia ricerca esplicitata?
• Peer review: pubblicato in venue con peer review?
• Retraction history: autore ha retractions?
• Funding disclosure: chi ha finanziato ricerca/articolo?

TESTO DA ANALIZZARE:
${content.substring(0, 6000)}

═══ FORMATO RISPOSTA JSON RICHIESTO ═══

{
  "description": "Sintesi CONCISA tema principale e tipo testo (es: 'articolo scientifico climate change', 'opinion piece politica', 'post blog salute') MAX 180 caratteri",
  "evaluation": {
    "score": <INTEGER 0-100, dove 100=MASSIMA CREDIBILITÀ evidenze solide + fonti verificate, 0=DISINFORMAZIONE CERTA falsa/propaganda>,
    "verdict": "<Credibile|Probabilmente Credibile|Dubbio|Probabilmente Non Credibile|Non Credibile>",
    "reasoning": "Sintesi DETTAGLIATA: quali claims principali (cita 2-3 specifici)? verificabili come? logical fallacies trovate (nomina specifiche con esempi)? bias detection (loaded language preciso)? segnali AI-generation? quality fonti (se citate)? Se credibile, spiega PERCHÉ (expertise, fonti, rigore). MINIMO 5 frasi, MASSIMO 7 frasi. USA ESEMPI TESTUALI.",
    "breakdown": {
      "technicalAuthenticity": {
        "score": <0-100>,
        "details": "ANALISI LINGUISTICA COMPLETA: readability level (Flesch score stima)? coerenza stilistica? errori grammaticali sistematici? segnali AI (repetitive structures, hallucinations, hedging)? perplexity assessment? tone professionale/amatoriale? register appropriato? SPECIFICA pattern trovati. MINIMO 70 parole."
      },
      "contentCredibility": {
        "score": <0-100>,
        "details": "VERIFICA CLAIMS APPROFONDITA: identifica 3-5 claims principali fattualmente verificabili. Per CIASCUNO: verificabile come? fonti primarie esistono? dati statistici accurati? consensus scientifico supporta? contraddizioni interne? temporal relevance? DEVI citare claims SPECIFICI e loro verifica. MINIMO 80 parole."
      },
      "manipulationRisk": {
        "score": <0-100, dove 100=ALTISSIMO rischio>,
        "details": "DETECTION MANIPOLAZIONE: logical fallacies trovate (nomina TYPE + esempio testuale preciso)? loaded language (cita parole specifiche)? emotional appeals (fear/anger, esempi)? propaganda techniques? bias evidente (quale tipo)? cherry-picking evidenze? Se NESSUNA manipolazione, spiega rigore argomentativo. MINIMO 70 parole."
      },
      "sourceReliability": {
        "score": <0-100>,
        "details": "AUTHORSHIP & SOURCING: autore identificabile? credentials verificabili? conflict of interest? fonti citate (quante, quality)? primary sources accessible? citations academic-grade? plagiarism indicators? peer-reviewed? funding disclosure? track record autore? SPECIFICA assessment. MINIMO 60 parole."
      }
    },
    "contextAnalysis": "CONTESTO & CROSS-REFERENCE: questo topic consensus scientifico/esperto qual è? lateral reading ad altre fonti autorevoli conferma o smentisce? esistono fact-checks da Snopes/PolitiFact? posizionamento ideologico/politico testo? timing pubblicazione rilevante (pre-eventi)? network amplification (viral social)? confronto stile con altri lavori stesso autore? MINIMO 90 parole, MASSIMO 160 parole."
  }
}

🔴 REGOLE CRITICHE:
1. CITA esempi TESTUALI per bias/fallacies (virgolettati specifici)
2. IDENTIFICA claims fattualmente verificabili e VERIFICA 
3. USA terminologia linguistica/retorica PRECISA
4. Se rilevi AI-generation, SPECIFICA markers trovati
5. Ogni "details" deve avere MINIMO parole indicate
6. Reasoning deve analizzare CLAIMS SPECIFICI (non generici)
7. Rispondi ESCLUSIVAMENTE con JSON valido
8. INTEGER per score (no decimali)

INIZIA ANALISI FORENSE TESTUALE:`,
        },
      ];
    } else if (fileType.startsWith('video/') || fileType === 'video/url') {
      console.log('Processing video with enhanced guidance');
      const videoRef = isUrl ? content : fileName;
      
      messages = [
        {
          role: 'user',
          content: `Sei un ESPERTO DEEPFAKE VIDEO FORENSICS con specializzazione in face-swap detection, voice cloning analysis, synthetic media forensics. Fornisci GUIDA ULTRA-DETTAGLIATA per analisi manuale professionale.

═══ PROTOCOLLO DEEPFAKE VIDEO DETECTION ═══

🎥 NOTA: L'analisi video completa richiede tools specializzati (Deepware Scanner, Microsoft Video Authenticator, Sensity). Questa guida è per ANALISI MANUALE FRAME-BY-FRAME.

▸ LAYER 1 - FACE ANALYSIS (FRAME-BY-FRAME):
• Facial boundary artifacts: ispeziona bordi viso frame-by-frame
  - Hair-face transition: confine netto vs graduale naturale
  - Chin/neck boundary: morphing artifacts
  - Ears reconstruction: GANs spesso generano orecchie malformate
  - Temporal coherence: bordi stabili o "breathing" artifacts
• Facial features consistency:
  - Eye tracking: saccades naturali vs smooth anomalo
  - Blink rate: normale 15-20/min vs troppo raro/frequente
  - Pupil dilation: reazione a lighting changes
  - Teeth/mouth: inner mouth darkness, tongue visibility
  - Skin texture: pori visibili vs AI smoothing
  - Facial hair: individual strands vs blurred mass
• Expression micro-analysis:
  - Action Units (AU): coerenza muscolare facciale
  - Asymmetry naturale: AI tende a simmetria eccessiva
  - Emotion congruence: micro-expressions match context
  - Wrinkles dynamics: corrugation naturale vs statico

▸ LAYER 2 - AUDIO-VIDEO SYNCHRONIZATION:
• Lip-sync accuracy:
  - Phoneme-viseme matching: P/B (lips close), A (mouth open)
  - Frame-accurate sync: audio ahead/behind video
  - Micro-movements: lips movement before/after sound
  - Tongue visibility: appropriate per consonants (L, T, D)
• Voice analysis:
  - Spectral anomalies: unnatural frequency patterns
  - Breathing sounds: natural vs missing/synthetic
  - Background ambiance: room tone match video environment
  - Voice cloning artifacts: robotic undertones, pitch consistency
  - Emotional prosody: voice emotion match facial expression

▸ LAYER 3 - LIGHTING & PHYSICS:
• Illumination consistency:
  - Face lighting match scene lighting direction
  - Specularity: eye catchlights, nose/forehead highlights
  - Ambient occlusion: shadow in eye sockets, under nose
  - Color temperature: face vs environment (6500K daylight match?)
  - Dynamic lighting: face reacts to scene light changes
• Shadow analysis:
  - Hard vs soft shadows: appropriati per fonte luce
  - Shadow direction: coerente con lighting
  - Self-shadowing: nose shadow su upper lip, chin su collo
  - Cast shadows: testa su wall/sfondo coerente

▸ LAYER 4 - TEMPORAL ARTIFACTS:
• Frame-to-frame analysis:
  - Jitter/warping: face "breathing", morphing between frames
  - Resolution inconsistency: face sharper/blurrier than body
  - Compression artifacts: differenti su face vs background
  - Motion blur: appropriato per movement speed
  - Flickering: color/brightness instability zona viso
• Background coherence:
  - Parallax: background movement match head movement
  - Focus depth: bokeh naturale, face-background separation
  - Occlusion handling: oggetti passing in front face cleanly

▸ LAYER 5 - METADATA & TECHNICAL:
• File metadata analysis:
  - Creation date/time: coerente con claimed date?
  - Camera model: EXIF data presente/stripped
  - Editing software: signs of video editing tools
  - Encoding parameters: re-encoding multiple times
  - Bitrate inconsistencies: variable bitrate anomalo
• Compression artifacts:
  - Blockiness: H.264/H.265 artifacts face vs background
  - Color banding: gradient smoothness
  - Chroma subsampling: 4:2:0 artifacts

▸ LAYER 6 - CONTEXT VERIFICATION:
• Source verification:
  - Reverse video search: TinEye, Google, InVID WeVerify
  - Original source: chi ha pubblicato per primo?
  - Chain of custody: tracking diffusione
  - Geolocation: location metadata vs claimed location
  - Timestamp verification: quando realmente registrato
• Cross-reference:
  - Confronto con video originali soggetto (se noto)
  - Abbigliamento: match altri video stesso evento?
  - Location details: architettura, segnaletica, flora
  - Audio ambient: sounds match location

═══ TOOLS CONSIGLIATI PER ANALISI ═══
• Deepware Scanner: online deepfake detector
• Microsoft Video Authenticator: confidence score per frame
• Sensity (ex Deeptrace): commercial deepfake detection
• InVID WeVerify: browser extension verificazione
• FFmpeg: frame extraction, metadata analysis
• Audacity: audio spectral analysis
• VLC: frame-by-frame playback (E key)

VIDEO ANALIZZATO: ${videoRef}

═══ FORMATO RISPOSTA JSON ═══

{
  "description": "File video rilevato: [TIPO VIDEO da filename/URL] - richiede analisi manuale specializzata (MAX 180 caratteri)",
  "evaluation": {
    "score": 50,
    "verdict": "Da Verificare Manualmente",
    "reasoning": "I video richiedono analisi frame-by-frame con tools specializzati che questa AI non può eseguire direttamente. Priorità: 1) Verificare lip-sync accuracy fotogramma per fotogramma. 2) Analizzare facial boundary artifacts (bordi viso, transizioni capelli). 3) Controllare blink rate e eye tracking patterns. 4) Verificare metadata video con ExifTool. 5) Reverse video search per trovare originale. Consiglio uso Deepware Scanner o Microsoft Video Authenticator per automated detection, seguito da manual review delle zone sospette.",
    "breakdown": {
      "technicalAuthenticity": {
        "score": 50,
        "details": "IMPOSSIBILE analisi automatica senza accesso diretto frames. ANALISI MANUALE RICHIESTA: Estrarre frames chiave (1 ogni 30 frames) con FFmpeg. Ispezionare metadata EXIF con ExifTool cercando software editing, re-encoding multipli. Verificare compression artifacts: face resolution vs background (deepfakes spesso hanno face higher quality). Controllare bitrate consistency. Analizzare audio waveform in Audacity per synthetic voice artifacts (flat spectral patterns, missing breathing sounds). MINIMO 60 parole totali."
      },
      "contentCredibility": {
        "score": 50,
        "details": "VERIFICA CONTESTUALE MANUALE: Reverse video search tramite InVID WeVerify o Google Video. Chi ha pubblicato per primo? Quando? Chain of custody tracciabile? Se video mostra persona nota, cross-reference con altri video stessa persona (confronta voice timbre, speech patterns, mannerisms). Geolocation check: location metadata match claimed location? Background details (architettura, segnaletica, meteo) coerenti? RICHIEDE lateral reading. MINIMO 55 parole."
      },
      "manipulationRisk": {
        "score": 50,
        "details": "INDICATORI DEEPFAKE DA VERIFICARE MANUALMENTE: 1) Lip-sync frame-accurate? Usa VLC (tasto E) per avanzare frame-by-frame durante speech, verifica P/B phonemes (lips close), A/O (mouth open). 2) Facial boundary: zoom 200% su hairline, ears, jawline cercando morphing/blurring. 3) Blink analysis: conta blinks in 60sec (normale 15-20, deepfake spesso <5 o >30). 4) Eye reflections: catchlights coerenti con scene lighting? 5) Skin texture: pori visibili o AI-smoothed? 6) Background occlusion: oggetti passing davanti face puliti o glitchy? SCORE 50 = INCERTEZZA, serve analisi professionale. MINIMO 70 parole."
      },
      "sourceReliability": {
        "score": 50,
        "details": "ASSESSMENT FONTE VIDEO: Source originale identificabile? Pubblicato da account verificato o anonimo? Social media metadata: quando uploadato, views/shares pattern (viral naturale vs bot-amplified)? Presenza watermark/logo broadcaster ufficiale? Se video news: quale outlet? Track record affidabilità? Se video privato: chi ha filmato, come ottenuto? Motivazione release (timing pre-evento importante = red flag)? RICHIEDE OSINT investigation. MINIMO 50 parole."
      }
    },
    "contextAnalysis": "PROCEDURA VERIFICA RACCOMANDATA: 1) Identificare soggetto video (se persona pubblica, ricerca immagini/video originali per comparison). 2) Reverse video search per trovare pubblicazione originale e tracking diffusione. 3) Analizzare metadata tecnici (creation date, camera model, GPS se presente) con ExifTool. 4) Frame extraction: ffmpeg -i video.mp4 -vf fps=1 frame_%04d.png (1 frame/sec), ispeziona visualmente cercando artifacts. 5) Audio extraction e spectral analysis in Audacity. 6) Lip-sync check manuale su frasi chiave. 7) Se sospetto deepfake: upload a Deepware Scanner (deepware.ai) per automated check. 8) Cross-reference: questo video claim match consensus altre fonti? 9) OSINT: chi condivide video (account age, followers authenticity)? 10) Consulta fact-checkers: Snopes/PolitiFact hanno già verificato? TIMING: se video critical (politico, crisi), URGENTE professional forensics. MINIMO 110 parole."
  }
}

🔴 REGOLE CRITICHE:
1. AMMETTI limitazioni analisi automatica video
2. FORNISCI guida STEP-BY-STEP actionable per utente
3. CITA tools specifici (nomi, URLs se noti)
4. REASONING deve dare PRIORITY LIST verifiche
5. Details MUST contenere PROCEDURE concrete
6. Score 50 = NEUTRAL (impossibile automated analysis)
7. JSON valido, INTEGER score

GENERA GUIDA ANALISI:`,
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
