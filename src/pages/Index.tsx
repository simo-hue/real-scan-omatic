import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisResult } from '@/components/AnalysisResult';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, Zap, Upload, Activity, Loader2 } from 'lucide-react';
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
    <div className="h-screen flex flex-col bg-background">
      {/* Compact Header */}
      <div className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">RealityRadar</h1>
              <p className="text-xs text-muted-foreground">AI Detection</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            v1.0
          </Badge>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="upload" className="h-full flex flex-col">
          <div className="flex-shrink-0 px-4 pt-3">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="upload" className="text-xs">
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="results" className="text-xs">
                <Activity className="h-3.5 w-3.5 mr-1.5" />
                Risultati
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Upload Tab */}
          <TabsContent value="upload" className="flex-1 overflow-y-auto px-4 pb-4 mt-0 pt-3">
            <div className="space-y-3">
              <FileUpload 
                onFilesSelected={setSelectedFiles}
                onUrlSubmit={setSelectedUrl}
              />

              <Button
                onClick={analyzeFiles}
                disabled={(selectedFiles.length === 0 && !selectedUrl) || isAnalyzing}
                className="w-full h-10 bg-gradient-to-r from-primary to-accent-purple hover:opacity-90 text-white font-medium text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analisi...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analizza
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="flex-1 overflow-y-auto px-4 pb-4 mt-0 pt-3">
            <AnalysisResult 
              result={result}
              isLoading={isAnalyzing}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
