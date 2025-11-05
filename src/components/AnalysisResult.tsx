import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AnalysisResultProps {
  result: {
    fileName: string;
    fileType: string;
    analysis: string;
    timestamp: Date;
  } | null;
  isLoading: boolean;
}

export const AnalysisResult = ({ result, isLoading }: AnalysisResultProps) => {
  if (isLoading) {
    return (
      <Card className="p-10 glass-effect border-primary/20">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-foreground font-semibold text-lg">Analisi in corso</p>
            <p className="text-muted-foreground text-sm animate-pulse">
              L'AI sta elaborando il tuo contenuto...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="p-10 glass-effect border-border/50">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="p-6 bg-muted/20 rounded-2xl backdrop-blur-sm border border-border/50">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-foreground font-semibold text-lg">
              In attesa di analisi
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Carica un file e avvia l'analisi per vedere i risultati in tempo reale
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 glass-effect border-primary/20 space-y-6 bg-card/60">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-primary/20 to-accent-purple/20 rounded-xl border border-primary/20 animate-pulse-glow">
          <CheckCircle2 className="h-7 w-7 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">
            Analisi completata
          </h3>
          <p className="text-sm text-muted-foreground">
            {result.fileName} • {new Date(result.timestamp).toLocaleString('it-IT')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-5 glass-effect rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 w-1 bg-gradient-to-b from-primary to-accent-cyan rounded-full" />
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              Tipo di file
            </p>
          </div>
          <p className="text-sm text-foreground font-medium ml-3">
            {result.fileType}
          </p>
        </div>

        <div className="p-5 glass-effect rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-1 bg-gradient-to-b from-accent-purple to-accent-pink rounded-full" />
            <p className="text-xs font-semibold text-accent-purple uppercase tracking-wide">
              Risultato analisi
            </p>
          </div>
          <div className="prose prose-sm max-w-none ml-3">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap min-h-[100px]">
              {result.analysis || (
                <span className="text-muted-foreground italic flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Generazione in corso...
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
