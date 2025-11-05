import { CheckCircle2, AlertCircle, Sparkles, Camera, Calendar, Settings, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AnalysisResultProps {
  result: {
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
    evaluation: {
      score: number;
      verdict: string;
      reasoning: string;
      breakdown: {
        technicalAuthenticity: { score: number; details: string };
        contentCredibility: { score: number; details: string };
        manipulationRisk: { score: number; details: string };
        sourceReliability: { score: number; details: string };
      };
      contextAnalysis?: string;
    };
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

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'from-green-500 to-emerald-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

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

        {result.exifData && (
          <div className="p-5 glass-effect rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-1 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
              <p className="text-xs font-semibold text-cyan-500 uppercase tracking-wide">
                Metadati EXIF
              </p>
            </div>
            <div className="ml-3 space-y-3">
              {result.exifData.camera && (
                <div className="flex items-center gap-2 text-sm">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Camera:</span>
                  <span className="text-foreground font-medium">{result.exifData.camera}</span>
                </div>
              )}
              {result.exifData.software && (
                <div className="flex items-center gap-2 text-sm">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Software:</span>
                  <span className="text-foreground font-medium">{result.exifData.software}</span>
                </div>
              )}
              {result.exifData.dateTime && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Data scatto:</span>
                  <span className="text-foreground font-medium">{result.exifData.dateTime}</span>
                </div>
              )}
              {result.exifData.modified && (
                <div className="flex items-start gap-2 text-sm p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div>
                    <span className="text-yellow-500 font-semibold">Modifiche rilevate</span>
                    {result.exifData.suspiciousEdits && result.exifData.suspiciousEdits.length > 0 && (
                      <ul className="mt-1 space-y-1">
                        {result.exifData.suspiciousEdits.map((edit, idx) => (
                          <li key={idx} className="text-foreground text-xs">• {edit}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-5 glass-effect rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-1 bg-gradient-to-b from-accent-cyan to-primary rounded-full" />
            <p className="text-xs font-semibold text-accent-cyan uppercase tracking-wide">
              Descrizione Contenuto
            </p>
          </div>
          <div className="prose prose-sm max-w-none ml-3">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {result.description || (
                <span className="text-muted-foreground italic flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Generazione in corso...
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="p-5 glass-effect rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-1 bg-gradient-to-b from-accent-purple to-accent-pink rounded-full" />
            <p className="text-xs font-semibold text-accent-purple uppercase tracking-wide">
              Valutazione AI Complessiva
            </p>
          </div>
          <div className="ml-3 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">
                    {result.evaluation.score}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getScoreColor(result.evaluation.score)} rounded-full transition-all duration-500`}
                    style={{ width: `${result.evaluation.score}%` }}
                  />
                </div>
              </div>
              <div className="px-4 py-2 bg-accent-purple/10 rounded-lg border border-accent-purple/20">
                <p className="text-sm font-semibold text-accent-purple whitespace-nowrap">
                  {result.evaluation.verdict}
                </p>
              </div>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {result.evaluation.reasoning}
            </p>
          </div>
        </div>

        {/* Multi-dimensional Breakdown */}
        <div className="p-5 glass-effect rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
              Analisi Multi-Dimensionale
            </p>
          </div>
          <div className="ml-3 space-y-4">
            {/* Technical Authenticity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Autenticità Tecnica</span>
                <span className="text-sm font-bold text-primary">{result.evaluation.breakdown.technicalAuthenticity.score}/100</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getScoreColor(result.evaluation.breakdown.technicalAuthenticity.score)} transition-all duration-500`}
                  style={{ width: `${result.evaluation.breakdown.technicalAuthenticity.score}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{result.evaluation.breakdown.technicalAuthenticity.details}</p>
            </div>

            {/* Content Credibility */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Credibilità Contenuto</span>
                <span className="text-sm font-bold text-primary">{result.evaluation.breakdown.contentCredibility.score}/100</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getScoreColor(result.evaluation.breakdown.contentCredibility.score)} transition-all duration-500`}
                  style={{ width: `${result.evaluation.breakdown.contentCredibility.score}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{result.evaluation.breakdown.contentCredibility.details}</p>
            </div>

            {/* Manipulation Risk */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Rischio Manipolazione</span>
                <span className="text-sm font-bold text-red-500">{result.evaluation.breakdown.manipulationRisk.score}/100</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-500"
                  style={{ width: `${result.evaluation.breakdown.manipulationRisk.score}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{result.evaluation.breakdown.manipulationRisk.details}</p>
            </div>

            {/* Source Reliability */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Affidabilità Fonte</span>
                <span className="text-sm font-bold text-primary">{result.evaluation.breakdown.sourceReliability.score}/100</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getScoreColor(result.evaluation.breakdown.sourceReliability.score)} transition-all duration-500`}
                  style={{ width: `${result.evaluation.breakdown.sourceReliability.score}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{result.evaluation.breakdown.sourceReliability.details}</p>
            </div>
          </div>
        </div>

        {/* Context Analysis */}
        {result.evaluation.contextAnalysis && (
          <div className="p-5 glass-effect rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-1 bg-gradient-to-b from-green-500 to-teal-500 rounded-full" />
              <p className="text-xs font-semibold text-green-500 uppercase tracking-wide">
                Analisi Contestuale
              </p>
            </div>
            <div className="ml-3">
              <p className="text-sm text-foreground leading-relaxed">
                {result.evaluation.contextAnalysis}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};