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
      <Card className="p-8 border-border bg-gradient-to-br from-card to-card/50">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
            <Sparkles className="h-6 w-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground text-sm animate-pulse">
            Analisi in corso...
          </p>
        </div>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="p-8 border-border bg-gradient-to-br from-card to-card/50">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="p-4 bg-muted/50 rounded-2xl">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-foreground font-medium">
              Nessun risultato disponibile
            </p>
            <p className="text-sm text-muted-foreground">
              Carica un file per iniziare l'analisi
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 border-border bg-gradient-to-br from-card to-card/50 space-y-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-accent/10 rounded-xl">
          <CheckCircle2 className="h-6 w-6 text-accent" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            Analisi completata
          </h3>
          <p className="text-sm text-muted-foreground">
            {result.fileName} • {new Date(result.timestamp).toLocaleString('it-IT')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Tipo di file
          </p>
          <p className="text-sm text-foreground font-medium">
            {result.fileType}
          </p>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Risultato analisi
          </p>
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {result.analysis}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
