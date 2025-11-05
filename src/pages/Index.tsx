import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisResult } from '@/components/AnalysisResult';
import { GridBackground } from '@/components/GridBackground';
import { DeepfakeEducation } from '@/components/DeepfakeEducation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { extractExifData } from '@/utils/exifExtractor';
import { analyzeImageFFT, FFTAnalysisResult } from '@/utils/fftAnalyzer';
import { analyzeImageELA, ELAAnalysisResult } from '@/utils/elaAnalyzer';

interface ReverseSearchResult {
  webEntities: Array<{
    description: string;
    score: number;
  }>;
  fullMatchingImages: Array<{
    url: string;
    score: number;
  }>;
  partialMatchingImages: Array<{
    url: string;
    score: number;
  }>;
  pagesWithMatchingImages: Array<{
    url: string;
    score: number;
    pageTitle?: string;
  }>;
  oldestUrl: string | null;
  oldestDate: string | null;
  knownWebsites: string[];
  bestGuessLabel: string | null;
}

interface AnalysisResultData {
  fileName: string;
  fileType: string;
  description: string;
  exifData?: {
    camera?: string;
    software?: string;
    dateTime?: string;
    gps?: string;
    modified?: boolean;
    suspiciousEdits?: string[];
  };
  fftAnalysis?: FFTAnalysisResult;
  elaAnalysis?: ELAAnalysisResult;
  reverseSearchResult?: ReverseSearchResult;
  evaluation: {
    score: number;
    verdict: string;
    reasoning: string;
    breakdown: {
      technicalAuthenticity: { score: number; details: string };
      contentCredibility: { score: number; details: string };
      manipulationRisk: { score: number; details: string };
      sourceReliability: { score: number; details: string };
      contextAnalysis?: { score: number; details: string };
      frequencyAnalysis?: { score: number; details: string };
    };
  };
  timestamp: Date;
}

const Index = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResultData | null>(null);
  const { toast } = useToast();

  const analyzeFiles = async () => {
    if (selectedFiles.length === 0 && !selectedUrl) {
      toast({
        title: "Nessuna sorgente selezionata",
        description: "Seleziona un file o inserisci un URL per iniziare l'analisi",
        variant: "destructive",
      });
      return;
    }

    console.log('=== STARTING ANALYSIS ===');
    console.log('Files:', selectedFiles.length, 'URL:', selectedUrl || 'none');
    
    setIsAnalyzing(true);
    setResult(null);

    try {
      let fileName = '';
      let fileType = '';
      let content = '';
      let exifData;

      if (selectedUrl) {
        console.log('Processing URL:', selectedUrl);
        fileName = selectedUrl;
        
        // Determine type from URL
        if (selectedUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
          fileType = 'image/url';
          content = selectedUrl;
          console.log('Detected as image URL');
        } else if (selectedUrl.match(/\.(mp4|webm|ogg|mov)$/i)) {
          fileType = 'video/url';
          content = selectedUrl;
          console.log('Detected as video URL');
        } else if (selectedUrl.match(/\.pdf$/i)) {
          fileType = 'application/pdf';
          content = selectedUrl;
          console.log('Detected as PDF URL');
        } else {
          fileType = 'text/html';
          content = selectedUrl;
          console.log('Detected as webpage URL');
        }
      } else {
        const file = selectedFiles[0];
        console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
        fileName = file.name;
        fileType = file.type;

        try {
          if (file.type.startsWith('text/')) {
            console.log('Reading text file...');
            content = await file.text();
            console.log('Text content length:', content.length);
          } else if (file.type.startsWith('image/') || file.type === 'application/pdf') {
            // Handle images and PDFs as base64
            console.log('Converting file to base64...');
            const base64 = await fileToBase64(file);
            content = base64;
            console.log('Base64 length:', content.length);

            // Extract EXIF data for images
            if (file.type.startsWith('image/')) {
              console.log('Extracting EXIF data...');
              exifData = await extractExifData(file);
              console.log('EXIF data:', exifData);
            }
          } else {
            throw new Error(`Tipo di file non supportato: ${file.type}`);
          }
        } catch (fileError) {
          console.error('Error processing file:', fileError);
          const errorMessage = fileError instanceof Error ? fileError.message : 'Errore durante la lettura del file';
          throw new Error(errorMessage);
        }
      }

      const requestPayload: any = {
        fileName: fileName,
        fileType: fileType,
        content: content,
        isUrl: !!selectedUrl,
      };

      // Perform FFT and ELA analysis for images
      let reverseSearchResult: ReverseSearchResult | undefined;
      
      if (fileType.startsWith('image/') && !selectedUrl && selectedFiles[0]) {
        console.log('Performing FFT analysis...');
        const fftResult = await analyzeImageFFT(selectedFiles[0]);
        console.log('FFT analysis:', fftResult);
        
        console.log('Performing ELA analysis...');
        const elaResult = await analyzeImageELA(selectedFiles[0]);
        console.log('ELA analysis:', elaResult);
        
        if (fftResult) requestPayload.fftAnalysis = fftResult;
        if (elaResult) requestPayload.elaAnalysis = elaResult;
        
        // Perform reverse image search
        console.log('Performing reverse image search...');
        try {
          const reverseSearchUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reverse-search`;
          const reverseSearchResponse = await fetch(reverseSearchUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              imageBase64: content.split(',')[1] || content, // Remove data URL prefix if present
            }),
          });
          
          if (reverseSearchResponse.ok) {
            reverseSearchResult = await reverseSearchResponse.json();
            console.log('Reverse search result:', reverseSearchResult);
          } else {
            console.warn('Reverse search failed:', reverseSearchResponse.status);
          }
        } catch (reverseSearchError) {
          console.error('Error during reverse search:', reverseSearchError);
          // Continue with analysis even if reverse search fails
        }
      }

      console.log('Preparing request:', {
        fileName,
        fileType,
        contentLength: content.length,
        isUrl: !!selectedUrl
      });

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-content`;
      console.log('Calling edge function:', apiUrl);

      // Stream the response
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(requestPayload),
      });

      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error('HTTP Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        let errorMessage = 'Errore durante l\'analisi del file';
        try {
          const contentType = response.headers.get('content-type');
          console.log('Error response content-type:', contentType);
          
          if (contentType?.includes('application/json')) {
            const errorData = await response.json();
            console.error('Error JSON:', errorData);
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } else {
            const errorText = await response.text();
            console.error('Error text:', errorText);
            errorMessage = errorText || `Errore HTTP: ${response.status} ${response.statusText}`;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `Errore HTTP: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      if (!response.body) {
        console.error('No response body from server');
        throw new Error('Nessuna risposta dal server');
      }

      console.log('Starting to read stream...');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream complete. Total chunks:', chunkCount);
          break;
        }

        chunkCount++;
        const chunk = decoder.decode(value, { stream: true });
        console.log(`Chunk ${chunkCount}:`, chunk.substring(0, 100) + '...');
        
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              console.log('Received [DONE] marker');
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                accumulatedText += content;
              }
            } catch (parseError) {
              console.warn('Error parsing SSE data:', data.substring(0, 100), parseError);
            }
          }
        }
      }

      console.log('Analysis complete. Total text length:', accumulatedText.length);
      console.log('Parsing JSON response...');

      // Clean up potential markdown code blocks
      let cleanedText = accumulatedText.trim();
      
      // Remove markdown code blocks if present
      if (cleanedText.startsWith('```')) {
        console.log('Detected markdown code block, extracting JSON...');
        const lines = cleanedText.split('\n');
        // Remove first line (```json or ```)
        lines.shift();
        // Remove last line if it's ```)
        if (lines[lines.length - 1].trim() === '```') {
          lines.pop();
        }
        cleanedText = lines.join('\n').trim();
      }
      
      console.log('Cleaned text (first 200 chars):', cleanedText.substring(0, 200));

      // Parse the JSON response
      try {
        const parsedResult = JSON.parse(cleanedText);
        console.log('✅ JSON parsed successfully:', parsedResult);
        
        setResult({
          fileName,
          fileType,
          description: parsedResult.description || '',
          exifData,
          fftAnalysis: (requestPayload as any).fftAnalysis,
          elaAnalysis: (requestPayload as any).elaAnalysis,
          reverseSearchResult,
          evaluation: {
            score: parsedResult.evaluation?.score || 0,
            verdict: parsedResult.evaluation?.verdict || '',
            reasoning: parsedResult.evaluation?.reasoning || '',
            breakdown: parsedResult.evaluation?.breakdown || {
              technicalAuthenticity: { score: 0, details: 'Non disponibile' },
              contentCredibility: { score: 0, details: 'Non disponibile' },
              manipulationRisk: { score: 0, details: 'Non disponibile' },
              sourceReliability: { score: 0, details: 'Non disponibile' }
            },
          },
          timestamp: new Date()
        });
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        // Fallback: use as plain text
        setResult({
          fileName,
          fileType,
          description: accumulatedText,
          exifData,
          fftAnalysis: (requestPayload as any).fftAnalysis,
          elaAnalysis: (requestPayload as any).elaAnalysis,
          reverseSearchResult,
          evaluation: {
            score: 0,
            verdict: 'Analisi non strutturata',
            reasoning: 'Impossibile parsare la risposta in formato strutturato',
            breakdown: {
              technicalAuthenticity: { score: 0, details: 'Non disponibile' },
              contentCredibility: { score: 0, details: 'Non disponibile' },
              manipulationRisk: { score: 0, details: 'Non disponibile' },
              sourceReliability: { score: 0, details: 'Non disponibile' }
            }
          },
          timestamp: new Date()
        });
      }
      
      toast({
        title: "Analisi completata",
        description: "I risultati sono pronti",
      });
    } catch (error) {
      console.error('=== ANALYSIS ERROR ===');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('Full error object:', error);
      
      toast({
        title: "Errore nell'analisi",
        description: error instanceof Error ? error.message : "Si è verificato un errore durante l'analisi del file",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error('Impossibile leggere il file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error(`Errore nella lettura del file: ${reader.error?.message || 'Errore sconosciuto'}`));
      };
      
      reader.onabort = () => {
        reject(new Error('Lettura del file annullata'));
      };
      
      try {
        reader.readAsDataURL(file);
      } catch (error) {
        reject(new Error(`Impossibile avviare la lettura: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`));
      }
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GridBackground />
      
      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-full border border-primary/20 animate-pulse-glow">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold bg-gradient-to-r from-primary via-accent-purple to-accent-pink bg-clip-text text-transparent">
              AI-Powered Analysis Engine
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-cyber bg-clip-text text-transparent animate-gradient glow-text-blue">
              Analisi Intelligente
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Scopri insights nascosti nei tuoi contenuti con l'analisi AI in tempo reale.
            <span className="block mt-2 text-primary font-medium">Veloce. Preciso. Futuristico.</span>
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Upload Section */}
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-1 bg-gradient-to-b from-primary to-accent-purple rounded-full" />
                <h2 className="text-3xl font-bold text-foreground">
                  Upload
                </h2>
              </div>
              <p className="text-muted-foreground ml-4">
                Trascina i tuoi file o clicca per selezionare
              </p>
            </div>

            <div className="glass-effect p-1 rounded-2xl">
              <FileUpload 
                onFilesSelected={setSelectedFiles}
                onUrlSubmit={setSelectedUrl}
              />
            </div>

            <Button
              onClick={analyzeFiles}
              disabled={(selectedFiles.length === 0 && !selectedUrl) || isAnalyzing}
              className="w-full h-14 bg-gradient-to-r from-primary via-accent-purple to-accent-pink hover:shadow-[0_0_40px_hsl(217_91%_60%_/_0.5)] text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isAnalyzing ? (
                  <>
                    <Sparkles className="h-5 w-5 animate-spin" />
                    Analisi in corso...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Avvia Analisi
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan via-primary to-accent-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient" />
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-1 bg-gradient-to-b from-accent-purple to-accent-pink rounded-full" />
                <h2 className="text-3xl font-bold text-foreground">
                  Risultati
                </h2>
              </div>
              <p className="text-muted-foreground ml-4">
                L'analisi AI apparirà in tempo reale
              </p>
            </div>

            <div className="glass-effect p-1 rounded-2xl">
              <AnalysisResult result={result} isLoading={isAnalyzing} />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          {[
            { 
              title: 'Streaming Real-time', 
              desc: "Vedi i risultati apparire mentre l'AI elabora",
              gradient: 'from-primary to-accent-cyan'
            },
            { 
              title: 'Multi-formato', 
              desc: 'Supporta immagini, video, testo e documenti',
              gradient: 'from-accent-purple to-accent-pink'
            },
            { 
              title: 'AI Avanzata', 
              desc: 'Powered by Gemini 2.5 Flash per analisi profonde',
              gradient: 'from-accent-cyan to-primary'
            },
          ].map((feature, i) => (
            <div key={i} className="glass-effect p-6 rounded-2xl group hover:scale-105 transition-all duration-300 hover:shadow-[0_0_30px_hsl(217_91%_60%_/_0.3)]">
              <div className={`h-1 w-12 bg-gradient-to-r ${feature.gradient} rounded-full mb-4`} />
              <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Educational Section */}
        <div className="mt-32">
          <DeepfakeEducation />
        </div>
      </div>
    </div>
  );
};

export default Index;

