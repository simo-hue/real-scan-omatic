import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { CheckCircle2, XCircle, RotateCcw, Award } from "lucide-react";

// Import images
import deepfakeCeo from "@/assets/quiz/deepfake-ceo.jpg";
import deepfakePolitician from "@/assets/quiz/deepfake-politician.jpg";
import deepfakeCelebrity from "@/assets/quiz/deepfake-celebrity.jpg";
import realInterview from "@/assets/quiz/real-interview.jpg";
import realFamily from "@/assets/quiz/real-family.jpg";
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
    scenario: "Video di un politico che fa una dichiarazione controversa",
    detailedDescription: "In questo video, vediamo un politico di alto profilo durante quella che sembra essere una conferenza stampa ufficiale. Il politico sta facendo dichiarazioni su una questione controversa di politica nazionale. La qualità del video è buona e il setting sembra professionale con microfoni e sfondo istituzionale.",
    imageUrl: deepfakePolitician,
    isDeepfake: true,
    difficulty: "easy",
    hints: [
      "Osserva la mano alzata - il movimento sembra naturale o leggermente rigido?",
      "Guarda la bocca mentre parla - le labbra si muovono in modo completamente sincronizzato?",
      "Nota lo sfondo blu sfocato - i bordi del viso rimangono nitidi o c'è sfocatura innaturale?"
    ],
    explanation: "Questo è un deepfake generato da AI. Sebbene la qualità generale sia alta, ci sono segnali rivelatori: il gesto della mano alzata appare leggermente innaturale e rigido. I bordi del viso, specialmente vicino ai capelli contro lo sfondo blu, mostrano una leggera inconsistenza. La texture della pelle appare troppo uniforme senza le naturali imperfezioni. Questo tipo di immagini AI-generated manca delle sottili imperfezioni e variazioni che caratterizzano le foto autentiche."
  },
  {
    id: 2,
    scenario: "Foto professionale di un CEO che annuncia nuove politiche aziendali",
    detailedDescription: "Questa immagine mostra il CEO di una grande azienda tecnologica in quello che sembra essere il suo ufficio aziendale. L'illuminazione è professionale e l'ambiente suggerisce un contesto corporativo di alto livello. Il CEO appare fiducioso e professionale in abito formale.",
    imageUrl: deepfakeCeo,
    isDeepfake: true,
    difficulty: "easy",
    hints: [
      "Esamina la texture della pelle - sembra naturale o eccessivamente levigata?",
      "Guarda lo sfondo sfocato dell'ufficio - i dettagli architettonici sono coerenti?",
      "Osserva gli occhi - la riflessione della luce in entrambi gli occhi è identica e naturale?"
    ],
    explanation: "Questa è un'immagine generata da AI. I segnali principali includono: la pelle appare innaturalmente perfetta e levigata, priva delle normali imperfezioni, pori e texture naturale. Lo sfondo, sebbene sfocato professionalmente, mostra elementi architettonici che non seguono una logica spaziale coerente. La simmetria quasi perfetta del viso e l'uniformità dell'illuminazione sono tipiche delle generazioni AI. Le immagini reali mostrano sempre piccole asimmetrie naturali e variazioni nella texture della pelle."
  },
  {
    id: 3,
    scenario: "Intervista video registrata in studio professionale",
    detailedDescription: "Questo è un segmento di un'intervista televisiva registrata in uno studio broadcasting professionale. Due persone sono sedute in un ambiente ben illuminato, con telecamere professionali visibili. La conversazione sembra fluire naturalmente con gesti e espressioni appropriate al contesto della discussione.",
    imageUrl: realInterview,
    isDeepfake: false,
    difficulty: "easy",
    hints: [
      "Osserva l'illuminazione professionale dello studio - è coerente su entrambe le persone?",
      "Le attrezzature visibili (telecamere, luci) sono reali e coerenti con uno studio TV?",
      "I movimenti e le posture delle due persone sembrano naturali e spontanei?"
    ],
    explanation: "Questo contenuto è autentico. Gli indicatori chiave includono: l'illuminazione professionale dello studio è perfettamente coerente su entrambi i soggetti, creando le tipiche ombre controllate di un ambiente broadcast. Le attrezzature visibili nello sfondo (telecamere, luci, monitors) mostrano dettagli realistici e coerenti. Le posture e i gesti delle due persone mostrano la naturale asimmetria e spontaneità delle interazioni umane reali. La qualità dell'immagine è uniforme e non mostra i tipici artefatti di compressione o generazione AI."
  },
  {
    id: 4,
    scenario: "Foto di famiglia condivisa sui social media",
    detailedDescription: "Una tipica foto di famiglia scattata all'aperto in un parco durante una giornata di sole. La famiglia appare felice e rilassata, con sorrisi naturali. La foto ha le caratteristiche tipiche di una fotografia smartphone: colori vivaci, luce naturale del giorno, e una composizione informale ma piacevole.",
    imageUrl: realFamily,
    isDeepfake: false,
    difficulty: "easy",
    hints: [
      "Guarda l'illuminazione naturale del sole - crea ombre coerenti su tutti i membri della famiglia?",
      "Lo sfondo sfocato del parco mostra una naturale profondità di campo?",
      "Le espressioni e i sorrisi mostrano variazioni naturali tra i diversi membri?"
    ],
    explanation: "Questa è una fotografia genuina. L'illuminazione naturale del sole crea ombre coerenti e realistiche su tutti e quattro i membri della famiglia, con la luce che proviene dalla stessa direzione. Lo sfondo sfocato mostra una naturale profondità di campo tipica delle fotocamere moderne. Le texture della pelle mostrano dettagli naturali, imperfezioni e variazioni. Ogni persona ha un'espressione unica e naturale - i bambini con sorrisi spontanei, gli adulti con espressioni autentiche. La composizione informale e le piccole imperfezioni (pieghe nei vestiti, capelli mossi dal vento) sono tipiche delle foto di famiglia autentiche."
  },
  
  // Medium questions
  {
    id: 5,
    scenario: "Video di una celebrità che promuove un prodotto finanziario sui social",
    detailedDescription: "Questo video mostra una celebrità nota in un ambiente casual che sembra essere un caffè o un ristorante. La celebrità sta parlando con entusiasmo di un'opportunità di investimento, sostenendo di aver guadagnato molto denaro. Il video è stato condiviso sui social media con migliaia di visualizzazioni e sembra provenire dall'account verificato della celebrità.",
    imageUrl: deepfakeCelebrity,
    isDeepfake: true,
    difficulty: "medium",
    hints: [
      "La pelle del viso sembra innaturalmente perfetta, priva di pori o imperfezioni?",
      "Osserva il prodotto tenuto in mano - l'interazione sembra naturale o posata?",
      "Lo sfondo sfocato del caffè mostra elementi coerenti o ci sono anomalie?"
    ],
    explanation: "Questo è un deepfake sofisticato generato da AI. I segnali rivelatori includono: la texture della pelle è innaturalmente liscia e priva di imperfezioni, pori o variazioni naturali. Il sorriso è perfetto ma manca delle microespressioni sottili tipiche delle emozioni genuine. Il modo in cui il prodotto è tenuto in mano sembra posato e artificiale. Inoltre, dal punto di vista contestuale, è altamente insolito che celebrità affidabili promuovano prodotti finanziari rischiosi - questo è un segnale d'allarme comune nelle truffe con deepfake."
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
    scenario: "Streaming live di un evento sportivo su piattaforma ufficiale",
    detailedDescription: "Stai guardando uno streaming di una partita di calcio importante sulla piattaforma ufficiale della lega sportiva. Il video mostra giocatori in azione con movimenti fluidi, reazioni naturali agli eventi del gioco, e commento live dei telecronisti. La qualità è quella standard dei broadcast sportivi professionali con replay istantanei e grafiche overlay.",
    imageUrl: realSports,
    isDeepfake: false,
    difficulty: "medium",
    hints: [
      "I movimenti atletici complessi (corsa, salti, cambi di direzione) sono fisicamente plausibili?",
      "Le divise dei giocatori mostrano pieghe naturali e movimento del tessuto durante l'azione?",
      "Il pubblico sullo sfondo mostra reazioni variegate e naturali?"
    ],
    explanation: "Questo è contenuto completamente autentico da un evento sportivo reale. Gli streaming live ufficiali hanno molteplici indicatori di autenticità: i movimenti atletici complessi sono perfettamente coordinati e fisicamente plausibili (estremamente difficili da falsificare in tempo reale). Le divise mostrano movimento naturale del tessuto con pieghe che cambiano realisticamente. Il pubblico sullo sfondo mostra una varietà naturale di reazioni e comportamenti. La complessità e l'imprevedibilità di un evento sportivo live rendono praticamente impossibile creare un deepfake convincente in tempo reale."
  },
  
  // Hard questions
  {
    id: 9,
    scenario: "Video messaggio personale da un familiare che chiede aiuto finanziario",
    detailedDescription: "Hai ricevuto un video messaggio che sembra essere da un membro della tua famiglia. La persona appare visibilmente angosciata e spiega di essere in una situazione di emergenza finanziaria mentre è all'estero. La qualità del video è leggermente inferiore, come ci si aspetterebbe da una connessione internet in roaming. Il volto e la voce sembrano corrispondere perfettamente al tuo familiare, incluse maniere e modo di parlare.",
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
    scenario: "Conferenza stampa ufficiale registrata da più angolazioni simultaneamente",
    detailedDescription: "Una conferenza stampa importante trasmessa in diretta da multiple emittenti televisive, ciascuna con le proprie telecamere posizionate in punti diversi della sala. Il confronto tra i diversi feed video mostra la stessa persona da angolazioni diverse: frontale, laterale, e dall'alto. Tutti i movimenti, gesti e timing sono perfettamente coerenti tra tutte le prospettive. Il contenuto include anche domande spontanee da giornalisti e risposte immediate.",
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
