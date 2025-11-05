import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisResult } from '@/components/AnalysisResult';
import { GridBackground } from '@/components/GridBackground';
import { DeepfakeEducation } from '@/components/DeepfakeEducation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

interface AnalysisResultData {
  fileName: string;
  fileType: string;
  analysis: string;
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
          } else if (file.type.startsWith('image/')) {
            console.log('Converting image to base64...');
            const base64 = await fileToBase64(file);
            content = base64;
            console.log('Base64 length:', content.length);
          } else if (file.type === 'application/pdf') {
            console.log('PDF file detected');
            content = 'PDF file uploaded for analysis';
          } else {
            throw new Error(`Tipo di file non supportato: ${file.type}`);
          }
        } catch (fileError) {
          console.error('Error processing file:', fileError);
          throw new Error(`Errore durante la lettura del file: ${fileError instanceof Error ? fileError.message : 'Errore sconosciuto'}`);
        }
      }

      const requestPayload = {
        fileName: fileName,
        fileType: fileType,
        content: content,
        isUrl: !!selectedUrl,
      };

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

      setResult({
        fileName: fileName,
        fileType: fileType,
        analysis: '',
        timestamp: new Date(),
      });

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
                setResult({
                  fileName: fileName,
                  fileType: fileType,
                  analysis: accumulatedText,
                  timestamp: new Date(),
                });
              }
            } catch (parseError) {
              console.warn('Error parsing SSE data:', data.substring(0, 100), parseError);
            }
          }
        }
      }

      console.log('Analysis complete. Total text length:', accumulatedText.length);
      
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
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
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

