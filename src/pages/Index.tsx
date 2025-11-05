import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisResult } from '@/components/AnalysisResult';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AnalysisResultData {
  fileName: string;
  fileType: string;
  analysis: string;
  timestamp: Date;
}

const Index = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResultData | null>(null);
  const { toast } = useToast();

  const analyzeFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Nessun file selezionato",
        description: "Seleziona almeno un file per iniziare l'analisi",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const file = selectedFiles[0];
      let content = '';

      if (file.type.startsWith('text/')) {
        content = await file.text();
      } else if (file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        content = base64;
      } else if (file.type === 'application/pdf') {
        content = 'PDF file uploaded for analysis';
      }

      // Stream the response
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-content`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            content: content,
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to start analysis stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      // Initialize result with empty analysis
      setResult({
        fileName: file.name,
        fileType: file.type,
        analysis: '',
        timestamp: new Date(),
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                accumulatedText += content;
                // Update result in real-time
                setResult({
                  fileName: file.name,
                  fileType: file.type,
                  analysis: accumulatedText,
                  timestamp: new Date(),
                });
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }

      toast({
        title: "Analisi completata",
        description: "I risultati sono pronti",
      });
    } catch (error) {
      console.error('Error analyzing file:', error);
      toast({
        title: "Errore nell'analisi",
        description: "Si è verificato un errore durante l'analisi del file",
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Powered by AI</span>
          </div>
          
          <h1 className="text-5xl font-bold text-foreground tracking-tight">
            Analisi Intelligente
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Carica immagini, video o testo e ottieni un'analisi dettagliata
            in tempo reale
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                Carica i tuoi file
              </h2>
              <p className="text-sm text-muted-foreground">
                Supporta immagini, video, documenti di testo e PDF
              </p>
            </div>

            <FileUpload onFilesSelected={setSelectedFiles} />

            <Button
              onClick={analyzeFiles}
              disabled={selectedFiles.length === 0 || isAnalyzing}
              className="w-full h-12 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white font-medium rounded-xl shadow-lg shadow-accent/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                  Analisi in corso...
                </>
              ) : (
                <>
                  Avvia Analisi
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                Risultati
              </h2>
              <p className="text-sm text-muted-foreground">
                L'analisi AI verrà visualizzata qui
              </p>
            </div>

            <AnalysisResult result={result} isLoading={isAnalyzing} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
