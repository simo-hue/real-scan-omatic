import { Shield, Eye, AlertTriangle, CheckCircle2, Brain, Scan } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { DeepfakeQuiz } from './DeepfakeQuiz';

const warningSignsImages = [
  {
    icon: Eye,
    title: "Occhi e Sguardo",
    desc: "Movimenti oculari innaturali, battiti di ciglia irregolari o assenti, pupille asimmetriche",
    gradient: "from-primary to-accent-cyan"
  },
  {
    icon: Scan,
    title: "Bordi e Contorni",
    desc: "Sfocature incoerenti, contorni innaturali del viso, artefatti digitali ai bordi",
    gradient: "from-accent-purple to-accent-pink"
  },
  {
    icon: Brain,
    title: "Illuminazione",
    desc: "Ombre incoerenti, riflessi non realistici, direzione della luce contraddittoria",
    gradient: "from-accent-cyan to-primary"
  },
  {
    icon: AlertTriangle,
    title: "Movimenti Facciali",
    desc: "Espressioni rigide, micro-espressioni mancanti, sincronizzazione labiale imperfetta",
    gradient: "from-accent-pink to-accent-purple"
  }
];

const warningSignsText = [
  {
    icon: Shield,
    title: "Struttura e Stile",
    desc: "Cambi improvvisi di stile, ripetizioni innaturali, incoerenze logiche nel contenuto",
    gradient: "from-primary to-accent-purple"
  },
  {
    icon: Brain,
    title: "Conoscenza Fattuale",
    desc: "Errori in date, luoghi, eventi storici. L'AI può inventare informazioni plausibili ma false",
    gradient: "from-accent-cyan to-accent-pink"
  }
];

const checklistItems = [
  "Verifica la fonte del contenuto",
  "Cerca versioni originali tramite ricerca inversa",
  "Analizza i metadati del file",
  "Confronta con altre fonti affidabili",
  "Usa strumenti di verifica online",
  "Controlla la coerenza temporale",
  "Esamina il contesto della pubblicazione",
  "Consulta fact-checking professionali"
];

export const DeepfakeEducation = () => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  return (
    <div className="space-y-16 py-16">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-full border border-accent-purple/20 animate-pulse-glow">
          <Shield className="h-4 w-4 text-accent-purple" />
          <span className="text-sm font-semibold bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">
            Guida alla Sicurezza Digitale
          </span>
        </div>
        
        <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-accent-purple via-accent-pink to-primary bg-clip-text text-transparent animate-gradient">
            Riconosci i Deepfake
          </span>
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Impara a identificare contenuti manipolati e generati dall'AI.
          Metti alla prova le tue capacità con il nostro quiz interattivo.
        </p>
      </div>

      {/* Interactive Quiz Section */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="border-accent/50 text-accent mb-4 text-sm px-4 py-2">
            🎯 Quiz Interattivo
          </Badge>
          <h3 className="text-3xl font-bold glow-text-purple">
            Metti alla Prova le Tue Capacità
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ogni tentativo presenta domande diverse con difficoltà progressiva. Riesci a distinguere i deepfake dai contenuti autentici?
          </p>
        </div>
        <DeepfakeQuiz />
      </div>

      {/* Warning Signs - Images */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-1 bg-gradient-to-b from-primary to-accent-cyan rounded-full" />
          <h3 className="text-3xl font-bold text-foreground">
            Segnali nei Contenuti Visivi
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {warningSignsImages.map((sign, index) => (
            <Card 
              key={index}
              className="glass-effect p-6 space-y-4 hover:scale-105 transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(217_91%_60%_/_0.3)]"
              onClick={() => setExpandedCard(expandedCard === index ? null : index)}
            >
              <div className={`p-4 bg-gradient-to-br ${sign.gradient} bg-opacity-10 rounded-xl inline-block`}>
                <sign.icon className="h-8 w-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-foreground">
                  {sign.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {sign.desc}
                </p>
              </div>

              {expandedCard === index && (
                <div className="pt-4 border-t border-border/30 animate-fade-in">
                  <p className="text-xs text-muted-foreground italic">
                    💡 Tip: Usa lo zoom per esaminare dettagli sospetti. I deepfake spesso presentano anomalie nei dettagli fini.
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Warning Signs - Text */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-1 bg-gradient-to-b from-accent-purple to-accent-pink rounded-full" />
          <h3 className="text-3xl font-bold text-foreground">
            Segnali nei Contenuti Testuali
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {warningSignsText.map((sign, index) => (
            <Card 
              key={index}
              className="glass-effect p-8 space-y-4 hover:scale-[1.02] transition-all duration-300 border-border/50 hover:border-accent-purple/50"
            >
              <div className={`p-4 bg-gradient-to-br ${sign.gradient} bg-opacity-10 rounded-xl inline-block`}>
                <sign.icon className="h-8 w-8 text-accent-purple" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xl font-semibold text-foreground">
                  {sign.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {sign.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="glass-effect p-10 rounded-2xl border border-primary/20 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 to-accent-cyan/20 rounded-2xl">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">
            Checklist di Verifica
          </h3>
          <p className="text-muted-foreground">
            Segui questi passaggi per verificare l'autenticità del contenuto
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {checklistItems.map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-4 p-4 glass-effect rounded-xl hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent-purple/20 border border-primary/20 group-hover:scale-110 transition-transform">
                <span className="text-sm font-bold text-primary">{index + 1}</span>
              </div>
              <p className="text-sm text-foreground font-medium flex-1">
                {item}
              </p>
              <CheckCircle2 className="h-5 w-5 text-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Sii Scettico",
            desc: "Non credere automaticamente a contenuti sorprendenti o controversi. Verifica sempre.",
            icon: AlertTriangle,
            color: "text-accent-pink"
          },
          {
            title: "Educa Te Stesso",
            desc: "Resta aggiornato sulle nuove tecniche di manipolazione e strumenti di verifica.",
            icon: Brain,
            color: "text-primary"
          },
          {
            title: "Condividi con Responsabilità",
            desc: "Prima di condividere contenuti, assicurati della loro autenticità.",
            icon: Shield,
            color: "text-accent-purple"
          }
        ].map((practice, index) => (
          <Card 
            key={index}
            className="glass-effect p-6 text-center space-y-4 hover:scale-105 transition-all duration-300 border-border/50 hover:border-primary/50"
          >
            <div className="flex justify-center">
              <div className="p-4 bg-card/50 rounded-2xl">
                <practice.icon className={`h-8 w-8 ${practice.color}`} />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-foreground">
              {practice.title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {practice.desc}
            </p>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="glass-effect p-10 rounded-2xl border border-accent-purple/20 text-center space-y-6 bg-gradient-to-br from-accent-purple/5 to-accent-pink/5">
        <div className="space-y-3">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">
            Usa i Nostri Strumenti
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Il nostro sistema di analisi AI può aiutarti a identificare anomalie e segnali
            di manipolazione nei tuoi contenuti. Carica un file per iniziare l'analisi.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 justify-center text-xs text-muted-foreground">
          <span className="px-3 py-1 glass-effect rounded-full">✓ Analisi Immagini</span>
          <span className="px-3 py-1 glass-effect rounded-full">✓ Analisi Video</span>
          <span className="px-3 py-1 glass-effect rounded-full">✓ Analisi Testo</span>
          <span className="px-3 py-1 glass-effect rounded-full">✓ Report Dettagliati</span>
        </div>
      </div>
    </div>
  );
};
