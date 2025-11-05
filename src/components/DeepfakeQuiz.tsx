import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { CheckCircle2, XCircle, RotateCcw, Award } from "lucide-react";

// Import images
import fakeCeoDeepfake from "@/assets/quiz/fake-ceo-deepfake.jpg";
import realPoliticianPress from "@/assets/quiz/real-politician-press.jpg";
import fakeCelebrityScam from "@/assets/quiz/fake-celebrity-scam.jpg";
import realInterview from "@/assets/quiz/real-interview.jpg";
import realFamilyPark from "@/assets/quiz/real-family-park.jpg";
import realSports from "@/assets/quiz/real-sports.jpg";
import deepfakeFamilyMessage from "@/assets/quiz/deepfake-family-message.jpg";
import realPressConference from "@/assets/quiz/real-press-conference.jpg";

interface QuizQuestion {
  id: number;
  scenario: string;
  detailedDescription: string;
  imageUrl: string;
  isDeepfake: boolean;
  difficulty: "easy" | "medium" | "hard";
  hints: string[];
  explanation: string;
}

const questionBank: QuizQuestion[] = [
  // Easy questions
  {
    id: 1,
    scenario: "Foto professionale di un CEO durante un annuncio aziendale",
    detailedDescription: "Questa immagine mostra un CEO in abito formale con sfondo ufficio sfocato. L'illuminazione è professionale e la posa è composta. Il soggetto appare con un sorriso sicuro e professionale.",
    imageUrl: fakeCeoDeepfake,
    isDeepfake: true,
    difficulty: "easy",
    hints: [
      "Osserva la texture della pelle - sembra eccessivamente liscia e uniforme?",
      "Gli occhi hanno riflessi naturali o sembrano troppo perfetti?",
      "Lo sfondo sfocato sembra naturale o presenta anomalie?"
    ],
    explanation: "Questo è un deepfake generato da AI. Segnali chiave: la pelle appare innaturalmente levigata senza pori visibili, le proporzioni del viso sono leggermente troppo simmetriche (caratteristica tipica dell'AI), e lo sfondo presenta elementi sfocati che non seguono una logica prospettica coerente."
  },
  {
    id: 2,
    scenario: "Immagine di un politico durante una conferenza stampa ufficiale",
    detailedDescription: "Questa foto mostra un politico al podio con microfoni, bandiere americane sullo sfondo, e illuminazione professionale tipica di un evento ufficiale.",
    imageUrl: realPoliticianPress,
    isDeepfake: false,
    difficulty: "easy",
    hints: [
      "Le rughe e i dettagli della pelle sono naturali e realistici?",
      "L'illuminazione crea ombre coerenti sul viso e sugli oggetti?",
      "I microfoni e lo sfondo mostrano dettagli realistici?"
    ],
    explanation: "Questa è un'immagine reale. Indicatori chiave: texture naturale della pelle con rughe visibili, illuminazione professionale che crea ombre coerenti, dettagli realistici dei microfoni e delle bandiere, e proporzioni naturali del corpo e del viso."
  },
  {
    id: 3,
    scenario: "Immagine di intervista registrata in studio professionale",
    detailedDescription: "Questa è un'immagine di un'intervista televisiva registrata in uno studio broadcasting professionale. Due persone sono sedute in un ambiente ben illuminato, con telecamere professionali visibili.",
    imageUrl: realInterview,
    isDeepfake: false,
    difficulty: "easy",
    hints: [
      "L'illuminazione professionale dello studio è coerente su entrambe le persone?",
      "Le attrezzature visibili (telecamere, luci) sono reali e coerenti?",
      "I movimenti e le posture sembrano naturali?"
    ],
    explanation: "Questo contenuto è autentico. L'illuminazione professionale dello studio è perfettamente coerente, le attrezzature visibili nello sfondo mostrano dettagli realistici, e le posture delle persone mostrano naturale asimmetria e spontaneità."
  },
  {
    id: 4,
    scenario: "Foto di famiglia scattata in un parco all'aperto",
    detailedDescription: "Una foto di famiglia scattata all'aperto durante una giornata di sole. La famiglia appare felice e rilassata con sorrisi naturali e luce naturale.",
    imageUrl: realFamilyPark,
    isDeepfake: false,
    difficulty: "easy",
    hints: [
      "L'illuminazione naturale del sole crea ombre coerenti?",
      "Lo sfondo sfocato del parco mostra naturale profondità di campo?",
      "Le espressioni mostrano variazioni naturali tra le persone?"
    ],
    explanation: "Questa è una fotografia genuina. L'illuminazione naturale crea ombre coerenti, lo sfondo mostra naturale profondità di campo, le texture della pelle sono naturali, e ogni persona ha espressioni uniche e autentiche."
  },
  
  // Medium questions
  {
    id: 5,
    scenario: "Immagine di una persona che promuove un prodotto sui social",
    detailedDescription: "Questa immagine mostra una persona sorridente in un ambiente casual che tiene un prodotto. L'immagine sembra essere stata condivisa sui social media come endorsement.",
    imageUrl: fakeCelebrityScam,
    isDeepfake: true,
    difficulty: "medium",
    hints: [
      "La pelle del viso sembra innaturalmente perfetta e liscia?",
      "Il sorriso appare naturale o troppo perfetto e artificiale?",
      "L'interazione con il prodotto sembra genuina o posata?"
    ],
    explanation: "Questo è un deepfake sofisticato generato da AI. Segnali rivelatori: la texture della pelle è innaturalmente liscia e priva di imperfezioni naturali, il sorriso è perfetto ma manca delle microespressioni sottili, e il modo in cui il prodotto è tenuto sembra artificiale. Questo tipo di immagini è comunemente usato in truffe online."
  },
  {
    id: 6,
    scenario: "Articolo di notizie con citazioni da fonti verificabili",
    detailedDescription: "Un articolo giornalistico pubblicato su un sito di notizie riconosciuto. L'articolo riporta eventi recenti con citazioni dirette da funzionari governativi e esperti del settore. Le citazioni includono nomi completi, titoli e affiliazioni. L'articolo include anche riferimenti a documenti ufficiali e statistiche specifiche con indicazione delle fonti.",
    imageUrl: "",
    isDeepfake: false,
    difficulty: "medium",
    hints: [
      "Tutte le persone citate possono essere verificate tramite ricerca online?",
      "Le statistiche e i dati hanno fonti primarie tracciabili?",
      "Lo stile di scrittura è coerente con il giornalismo professionale verificato?"
    ],
    explanation: "Questo è contenuto autentico. Gli indicatori chiave includono: tutte le citazioni provengono da persone reali con nomi completi, titoli verificabili e affiliazioni istituzionali controllabili. Le statistiche citate possono essere rintracciate alle loro fonti originali (enti governativi, studi pubblicati). Lo stile di scrittura segue gli standard giornalistici professionali con struttura logica, equilibrio nella presentazione, e riferimenti incrociati. La possibilità di verificare ogni affermazione attraverso fonti multiple indipendenti è il marchio del giornalismo autentico."
  },
  {
    id: 7,
    scenario: "Email urgente dal tuo capo che richiede un trasferimento di denaro immediato",
    detailedDescription: "Hai ricevuto un'email che sembra provenire dall'indirizzo del tuo capo. Il messaggio dice che è in viaggio per lavoro e ha bisogno urgentemente che tu faccia un bonifico a un nuovo fornitore. Il tono è insolitamente formale ma il nome del mittente e l'indirizzo email sembrano corretti. Il messaggio enfatizza l'urgenza e la riservatezza della richiesta.",
    imageUrl: "",
    isDeepfake: true,
    difficulty: "medium",
    hints: [
      "Il tono e lo stile di comunicazione sono tipici del tuo capo?",
      "Ci sono piccole differenze nell'indirizzo email (come caratteri simili ma diversi)?",
      "È normale che richieste finanziarie vengano fatte via email senza procedure standard?"
    ],
    explanation: "Questo è probabilmente un tentativo di frode tramite email AI-generated (Business Email Compromise). Anche se l'indirizzo email può sembrare legittimo, potrebbe essere spoofato o leggermente modificato con caratteri simili. Il linguaggio leggermente formale ma con incongruenze stilistiche rispetto alle solite comunicazioni, combinato con l'urgenza artificiale e la richiesta di bypassare procedure standard, sono segnali classici di frode. Le email generate da AI spesso mancano delle peculiarità personali e del tono abituale della persona che presumibilmente le sta inviando."
  },
  {
    id: 8,
    scenario: "Immagine da streaming di un evento sportivo",
    detailedDescription: "Questa immagine cattura un momento di una partita di calcio importante. Il video mostra giocatori in azione con posture atletiche naturali. La qualità è quella standard dei broadcast sportivi professionali con nitidezza e inquadratura professionale.",
    imageUrl: realSports,
    isDeepfake: false,
    difficulty: "medium",
    hints: [
      "I giocatori mostrano posture atletiche fisicamente plausibili?",
      "Le divise dei giocatori mostrano pieghe naturali e dettagli realistici?",
      "Il pubblico sullo sfondo mostra varietà naturali nelle posizioni e reazioni?"
    ],
    explanation: "Questo è contenuto completamente autentico da un evento sportivo reale. Le immagini ufficiali hanno molteplici indicatori di autenticità: le posture atletiche complesse sono perfettamente coordinate e fisicamente plausibili. Le divise mostrano dettagli naturali del tessuto con pieghe realistiche. Il pubblico sullo sfondo mostra una varietà naturale di posizioni e comportamenti. La complessità e l'autenticità di un evento sportivo professionale rendono estremamente difficile creare un deepfake convincente."
  },
  
  // Hard questions
  {
    id: 9,
    scenario: "Immagine da video messaggio personale di un familiare che chiede aiuto",
    detailedDescription: "Questa è un'immagine estratta da quello che sembra essere un video messaggio da un membro della tua famiglia. La persona appare visibilmente angosciata in quella che sembra una situazione di emergenza finanziaria. La qualità dell'immagine è leggermente inferiore, come ci si aspetterebbe da una connessione internet in roaming. Il volto sembra corrispondere perfettamente al tuo familiare.",
    imageUrl: deepfakeFamilyMessage,
    isDeepfake: true,
    difficulty: "hard",
    hints: [
      "Osserva lo sfondo della stanza - gli elementi decorativi e i mobili seguono una logica spaziale coerente?",
      "La texture della pelle sul viso mostra dettagli naturali come pori, rughe e imperfezioni?",
      "L'espressione facciale cambia in modo fluido o ci sono transizioni leggermente innaturali?"
    ],
    explanation: "Questo è un deepfake molto sofisticato, parte di un tipo di truffa in crescita. Sebbene la qualità generale sia impressionante, un'analisi attenta rivela: lo sfondo mostra elementi (tende, fiori, mobili) che appaiono generati dall'AI con proporzioni e prospettiva non del tutto coerenti. La texture della pelle, pur sembrando buona a prima vista, è troppo uniforme e manca della naturale variazione di pori e imperfezioni. Le transizioni tra espressioni facciali sono leggermente troppo fluide, mancando delle sottili imperfezioni dei movimenti muscolari reali. Il contesto (richiesta urgente di denaro) è un segnale d'allarme importante - sempre verificare attraverso un canale alternativo (chiamata telefonica diretta)."
  },
  {
    id: 10,
    scenario: "Post di blog tecnico con analisi dettagliata e scientifica",
    detailedDescription: "Un articolo di blog su un argomento scientifico complesso, scritto con un linguaggio tecnico appropriato. L'articolo presenta una struttura logica impeccabile con introduzione, metodologia, risultati e conclusioni. Include grafici e tabelle ben formattate. Tuttavia, alcune delle affermazioni chiave, pur sembrando plausibili, non hanno riferimenti a studi pubblicati e alcune statistiche citate non compaiono in database scientifici verificabili.",
    imageUrl: "",
    isDeepfake: true,
    difficulty: "hard",
    hints: [
      "Ogni statistica citata può essere rintracciata a uno studio pubblicato o fonte primaria?",
      "I nomi degli autori citati sono reali e hanno pubblicazioni verificabili in quel campo?",
      "La bibliografia include DOI o link a paper peer-reviewed verificabili?"
    ],
    explanation: "Questo è contenuto AI-generated mascherato da articolo scientifico. L'AI moderna può creare testi con struttura logica perfetta e linguaggio tecnico convincente, ma spesso include 'allucinazioni' - affermazioni che sembrano plausibili ma non sono verificabili. Gli articoli scientifici autentici hanno sempre: riferimenti completi con DOI verificabili, autori con affiliazioni istituzionali reali e storia di pubblicazioni, statistiche che possono essere rintracciate alle loro fonti originali in database pubblici. L'assenza di questi elementi verificabili, combinata con una struttura 'troppo perfetta', rivela la natura artificiale del contenuto."
  },
  {
    id: 11,
    scenario: "Immagine da conferenza stampa ufficiale con multiple angolazioni",
    detailedDescription: "Un'immagine composita da una conferenza stampa importante trasmessa da multiple emittenti televisive, ciascuna con le proprie telecamere. L'immagine mostra la stessa persona da quattro angolazioni diverse: frontale, laterale e dall'alto. Tutti i dettagli visivi sono perfettamente coerenti tra tutte le prospettive.",
    imageUrl: realPressConference,
    isDeepfake: false,
    difficulty: "hard",
    hints: [
      "Le quattro angolazioni mostrano la stessa persona con movimenti perfettamente sincronizzati?",
      "Gli sfondi e le persone visibili in ciascuna angolazione sono coerenti tra loro?",
      "I dettagli come la cravatta rossa e le posizioni delle mani corrispondono in tutte le inquadrature?"
    ],
    explanation: "Questo è contenuto completamente autentico da un evento ufficiale reale. La presenza di quattro angolazioni simultanee da fonti indipendenti rende estremamente difficile creare un deepfake convincente. Gli indicatori chiave includono: perfetta coerenza di movimenti, gesti e timing tra tutte e quattro le prospettive. I dettagli come la cravatta rossa, la posizione delle mani, e le espressioni facciali sono identici in tutte le inquadrature. Le persone sullo sfondo e gli elementi della sala sono visibili in modo coerente da diverse angolazioni. La complessità di falsificare simultaneamente multiple prospettive dello stesso evento mantenendo coerenza perfetta è tecnicamente proibitiva anche per i deepfake più avanzati."
  },
  {
    id: 12,
    scenario: "Foto professionale con editing leggero per ottimizzazione",
    detailedDescription: "Una fotografia professionale scattata da un fotografo professionista per un portfolio o materiale promozionale. L'immagine mostra evidenti segni di post-produzione: i colori sono stati migliorati per maggiore vivacità, il contrasto è stato ottimizzato, e c'è stata una leggera correzione dell'esposizione. La pelle del soggetto appare levigata ma mantiene texture naturale. Non ci sono cambiamenti strutturali o alterazioni delle proporzioni.",
    imageUrl: "",
    isDeepfake: false,
    difficulty: "hard",
    hints: [
      "I miglioramenti sono limitati a colori, luminosità e piccole imperfezioni?",
      "Le proporzioni del corpo, la forma del viso e le caratteristiche principali sono intatte?",
      "La texture della pelle, pur ottimizzata, mostra ancora dettagli naturali come rughe e variazioni?"
    ],
    explanation: "Questo è contenuto autentico con editing fotografico standard e professionale, non un deepfake. È fondamentale distinguere tra l'editing fotografico normale (regolazione di colori, esposizione, rimozione di piccole imperfezioni) e la manipolazione strutturale che caratterizza i deepfake. Questa foto ha subito post-produzione standard che non altera la realtà fondamentale dell'immagine: nessun cambio di identità, nessuna alterazione delle caratteristiche facciali o corporee, nessuna aggiunta o rimozione di elementi importanti. L'editing professionale che migliora la qualità visiva senza distorcere la realtà è una pratica accettata e trasparente, molto diversa dalla creazione di deepfake che inganna intenzionalmente."
  }
];

export const DeepfakeQuiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    startNewQuiz();
  }, []);

  const startNewQuiz = () => {
    // Randomize and select 10 questions with progressive difficulty
    const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
    const easyQuestions = shuffled.filter(q => q.difficulty === "easy").slice(0, 3);
    const mediumQuestions = shuffled.filter(q => q.difficulty === "medium").slice(0, 4);
    const hardQuestions = shuffled.filter(q => q.difficulty === "hard").slice(0, 3);
    
    const selectedQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
    setQuizQuestions(selectedQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setShowHint(false);
    setQuizCompleted(false);
  };

  const handleAnswer = (answer: boolean) => {
    if (answered) return;
    
    setSelectedAnswer(answer);
    setAnswered(true);
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (answer === currentQuestion.isDeepfake) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswered(false);
      setSelectedAnswer(null);
      setShowHint(false);
    } else {
      setQuizCompleted(true);
    }
  };

  if (quizQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-lg text-primary">Caricamento quiz...</div>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = (score / quizQuestions.length) * 100;
    return (
      <Card className="glass-effect border-accent/30 p-8 text-center space-y-6">
        <div className="flex justify-center">
          <Award className="w-24 h-24 text-accent animate-pulse-glow" />
        </div>
        <h3 className="text-3xl font-bold glow-text-blue">Quiz Completato!</h3>
        <div className="space-y-4">
          <p className="text-xl">
            Punteggio: <span className="text-accent font-bold">{score}</span> / {quizQuestions.length}
          </p>
          <Progress value={percentage} className="h-3" />
          <p className="text-muted-foreground">
            {percentage >= 80 && "Eccellente! Sei un esperto nel riconoscere i deepfake!"}
            {percentage >= 60 && percentage < 80 && "Buon lavoro! Con più pratica diventerai un esperto."}
            {percentage >= 40 && percentage < 60 && "Non male! Continua a esercitarti per migliorare."}
            {percentage < 40 && "Hai bisogno di più pratica. Rivedi i segnali da cercare!"}
          </p>
        </div>
        <Button 
          onClick={startNewQuiz}
          className="bg-gradient-to-r from-accent via-accent-purple to-accent-cyan hover:opacity-90 transition-all"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Riprova con Nuove Domande
        </Button>
      </Card>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Domanda {currentQuestionIndex + 1} di {quizQuestions.length}
            </span>
            <Badge 
              variant="outline" 
              className={`
                ${currentQuestion.difficulty === "easy" && "border-green-500/50 text-green-400"}
                ${currentQuestion.difficulty === "medium" && "border-yellow-500/50 text-yellow-400"}
                ${currentQuestion.difficulty === "hard" && "border-red-500/50 text-red-400"}
              `}
            >
              {currentQuestion.difficulty === "easy" && "Facile"}
              {currentQuestion.difficulty === "medium" && "Medio"}
              {currentQuestion.difficulty === "hard" && "Difficile"}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="text-right ml-4">
          <p className="text-sm text-muted-foreground">Punteggio</p>
          <p className="text-2xl font-bold text-accent">{score}</p>
        </div>
      </div>

      <Card className="glass-effect border-accent/30 p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold glow-text-blue">
            {currentQuestion.scenario}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentQuestion.detailedDescription}
          </p>
          
          {currentQuestion.imageUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-accent/20">
              <img 
                src={currentQuestion.imageUrl} 
                alt={currentQuestion.scenario}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {!currentQuestion.imageUrl && (
            <div className="bg-background/50 border border-accent/20 rounded-lg p-6 min-h-[200px] flex items-center justify-center">
              <p className="text-center text-muted-foreground italic">
                📧 Contenuto testuale - Leggi attentamente la descrizione sopra
              </p>
            </div>
          )}

          {!answered && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHint(!showHint)}
              className="w-full border-accent/30"
            >
              {showHint ? "Nascondi Suggerimento" : "Mostra Suggerimento"}
            </Button>
          )}

          {showHint && !answered && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
              {currentQuestion.hints.map((hint, index) => (
                <p key={index} className="text-sm text-accent-cyan">
                  💡 {hint}
                </p>
              ))}
            </div>
          )}

          {answered && (
            <div className={`border rounded-lg p-4 flex items-start gap-3 ${
              selectedAnswer === currentQuestion.isDeepfake 
                ? "bg-green-500/10 border-green-500/30" 
                : "bg-red-500/10 border-red-500/30"
            }`}>
              {selectedAnswer === currentQuestion.isDeepfake ? (
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-3">
                <p className="font-semibold">
                  {selectedAnswer === currentQuestion.isDeepfake ? "Corretto!" : "Non corretto"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Questo contenuto {currentQuestion.isDeepfake ? "è" : "non è"} un deepfake.
                </p>
                <div className="bg-background/30 p-3 rounded-lg border border-accent/20">
                  <p className="text-sm leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-foreground">Segnali chiave da ricordare:</p>
                  {currentQuestion.hints.map((hint, index) => (
                    <p key={index} className="text-accent-cyan flex items-start gap-2">
                      <span className="flex-shrink-0">•</span>
                      <span>{hint}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {!answered ? (
            <>
              <Button
                onClick={() => handleAnswer(true)}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                È un Deepfake
              </Button>
              <Button
                onClick={() => handleAnswer(false)}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                È Autentico
              </Button>
            </>
          ) : (
            <Button
              onClick={nextQuestion}
              className="w-full bg-gradient-to-r from-accent via-accent-purple to-accent-cyan hover:opacity-90"
            >
              {currentQuestionIndex < quizQuestions.length - 1 ? "Prossima Domanda" : "Vedi Risultati"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
