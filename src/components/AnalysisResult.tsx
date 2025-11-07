import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FFTAnalysisResult } from '@/utils/fftAnalyzer';
import { ELAAnalysisResult } from '@/utils/elaAnalyzer';

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
  } | null;
  isLoading: boolean;
}

export const AnalysisResult = ({ result, isLoading }: AnalysisResultProps) => {
  if (isLoading) {
    return (
      <div className="p-6 bg-card/60 backdrop-blur-sm rounded-lg border border-primary/20">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-foreground font-semibold text-sm">Analisi in corso</p>
            <p className="text-muted-foreground text-xs">
              L'AI sta elaborando...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-6 bg-card/60 backdrop-blur-sm rounded-lg border border-border/50">
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <div className="p-3 bg-muted/20 rounded-lg">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-foreground font-semibold text-sm">
              In attesa
            </p>
            <p className="text-xs text-muted-foreground">
              Carica un file e avvia l'analisi
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'from-green-500 to-emerald-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <div className="space-y-3 bg-card/60 backdrop-blur-sm rounded-lg border border-primary/20 p-4">
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-primary">
            Completato
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {result.fileName}
          </p>
        </div>
      </div>

      {/* Main Score */}
      <div className="p-3 bg-muted/30 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">PUNTEGGIO</span>
          <span className={`text-2xl font-bold bg-gradient-to-r ${getScoreColor(result.evaluation.score)} bg-clip-text text-transparent`}>
            {result.evaluation.score}/100
          </span>
        </div>
        <Badge 
          variant={result.evaluation.score >= 70 ? "default" : result.evaluation.score >= 40 ? "secondary" : "destructive"}
          className="text-xs w-full justify-center"
        >
          {result.evaluation.verdict}
        </Badge>
      </div>

      {/* Reasoning */}
      <div className="p-3 bg-muted/20 rounded-lg">
        <p className="text-xs text-foreground leading-relaxed">
          {result.evaluation.reasoning}
        </p>
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">DETTAGLI ANALISI</p>
        <div className="space-y-1.5">
          {Object.entries(result.evaluation.breakdown).map(([key, value]) => (
            <div key={key} className="p-2 bg-muted/20 rounded">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-foreground">
                  {key === 'technicalAuthenticity' && 'Autenticità Tecnica'}
                  {key === 'contentCredibility' && 'Credibilità Contenuto'}
                  {key === 'manipulationRisk' && 'Rischio Manipolazione'}
                  {key === 'sourceReliability' && 'Affidabilità Fonte'}
                  {key === 'contextAnalysis' && 'Analisi Contesto'}
                  {key === 'frequencyAnalysis' && 'Analisi Frequenze'}
                </span>
                <span className="text-xs font-bold text-primary">
                  {value.score}/100
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {value.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* EXIF Data */}
      {result.exifData && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">METADATI EXIF</p>
          <div className="space-y-1">
            {result.exifData.camera && (
              <div className="flex justify-between text-xs p-2 bg-muted/20 rounded">
                <span className="text-muted-foreground">Camera:</span>
                <span className="text-foreground font-medium">{result.exifData.camera}</span>
              </div>
            )}
            {result.exifData.software && (
              <div className="flex justify-between text-xs p-2 bg-muted/20 rounded">
                <span className="text-muted-foreground">Software:</span>
                <span className="text-foreground font-medium">{result.exifData.software}</span>
              </div>
            )}
            {result.exifData.dateTime && (
              <div className="flex justify-between text-xs p-2 bg-muted/20 rounded">
                <span className="text-muted-foreground">Data:</span>
                <span className="text-foreground font-medium">{result.exifData.dateTime}</span>
              </div>
            )}
            {result.exifData.modified && (
              <div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                <p className="text-xs text-yellow-500 font-semibold">⚠️ Modifiche rilevate</p>
                {result.exifData.suspiciousEdits && result.exifData.suspiciousEdits.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {result.exifData.suspiciousEdits.map((edit, idx) => (
                      <li key={idx} className="text-xs text-foreground">• {edit}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FFT Analysis */}
      {result.fftAnalysis && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-purple-500">ANALISI FREQUENZE (FFT)</p>
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="p-2 bg-muted/30 rounded">
                <p className="text-xs text-muted-foreground">High-Freq</p>
                <p className="text-sm font-mono font-bold text-foreground">
                  {result.fftAnalysis.highFrequencyRatio.toFixed(4)}
                </p>
              </div>
              <div className="p-2 bg-muted/30 rounded">
                <p className="text-xs text-muted-foreground">Anomaly</p>
                <p className="text-sm font-mono font-bold text-foreground">
                  {result.fftAnalysis.spectralAnomaly.toFixed(4)}
                </p>
              </div>
            </div>
            <Badge 
              variant={result.fftAnalysis.isAiGenerated ? "destructive" : "default"}
              className="text-xs w-full justify-center"
            >
              {result.fftAnalysis.isAiGenerated ? "⚠️ Possibile AI" : "✓ Naturale"}
              {' • '}
              {(result.fftAnalysis.confidence * 100).toFixed(0)}%
            </Badge>
          </div>
        </div>
      )}

      {/* ELA Analysis */}
      {result.elaAnalysis && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-orange-500">ERROR LEVEL ANALYSIS</p>
          <div className="rounded overflow-hidden border border-border/50">
            <img 
              src={result.elaAnalysis.heatmapDataUrl} 
              alt="ELA Heatmap"
              className="w-full h-auto"
            />
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Score ELA</span>
              <span className="text-sm font-bold text-foreground">{result.elaAnalysis.overallScore}/100</span>
            </div>
            <p className="text-xs text-muted-foreground">{result.elaAnalysis.details}</p>
          </div>
          {result.elaAnalysis.suspiciousZones.length > 0 && (
            <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
              <p className="text-xs text-red-500 font-semibold mb-1">
                {result.elaAnalysis.suspiciousZones.length} zone sospette
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reverse Search */}
      {result.reverseSearchResult && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-blue-500">REVERSE IMAGE SEARCH</p>
          
          {result.reverseSearchResult.bestGuessLabel && (
            <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
              <p className="text-xs text-muted-foreground">Identificato:</p>
              <p className="text-xs font-semibold text-blue-500">{result.reverseSearchResult.bestGuessLabel}</p>
            </div>
          )}

          {result.reverseSearchResult.oldestUrl && (
            <div className="p-2 bg-muted/30 rounded">
              <p className="text-xs text-muted-foreground mb-1">
                URL più antico:
                {result.reverseSearchResult.oldestDate && (
                  <span className="ml-1 text-primary">({result.reverseSearchResult.oldestDate})</span>
                )}
              </p>
              <a 
                href={result.reverseSearchResult.oldestUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline break-all"
              >
                {result.reverseSearchResult.oldestUrl}
              </a>
            </div>
          )}

          {result.reverseSearchResult.webEntities.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Entità Web:</p>
              <div className="flex flex-wrap gap-1">
                {result.reverseSearchResult.webEntities.slice(0, 4).map((entity, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {entity.description}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {result.reverseSearchResult.fullMatchingImages.length > 0 && (
            <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
              <p className="text-xs text-green-500 font-semibold">
                {result.reverseSearchResult.fullMatchingImages.length} corrispondenze esatte
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
