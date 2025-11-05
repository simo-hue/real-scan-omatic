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
      "Osserva attentamente il movimento delle labbra mentre parla",
      "L'audio sembra perfettamente sincronizzato con i movimenti della bocca?",
      "Guarda se ci sono lievi discontinuità tra l'audio e i movimenti facciali"
    ],
    explanation: "Questo è un deepfake. Sebbene la qualità generale sia buona, ci sono sottili incongruenze tra il movimento delle labbra e l'audio. I deepfake video spesso presentano problemi di sincronizzazione labiale, specialmente con parole che richiedono movimenti labiali specifici. Inoltre, le microespressioni facciali potrebbero apparire leggermente ritardate rispetto all'emozione trasmessa dalla voce."
  },
  {
    id: 2,
    scenario: "Foto professionale di un CEO che annuncia nuove politiche aziendali",
    detailedDescription: "Questa immagine mostra il CEO di una grande azienda tecnologica in quello che sembra essere il suo ufficio aziendale. L'illuminazione è professionale e l'ambiente suggerisce un contesto corporativo di alto livello. Il CEO appare fiducioso e professionale in abito formale.",
    imageUrl: deepfakeCeo,
    isDeepfake: true,
    difficulty: "easy",
    hints: [
      "Esamina attentamente le ombre sul viso e confrontale con la direzione della luce di sfondo",
      "L'illuminazione sul soggetto corrisponde all'illuminazione dell'ambiente?",
      "Guarda i bordi del viso - sembrano naturali o leggermente sfocati?"
    ],
    explanation: "Questa è un'immagine manipolata. Uno dei segnali principali è l'inconsistenza dell'illuminazione: le ombre sul viso non corrispondono perfettamente alla direzione e intensità della luce visibile nell'ambiente circostante. Inoltre, guardando attentamente i bordi del viso, si può notare una leggera sfocatura innaturale, tipica di quando un volto viene sostituito o modificato digitalmente."
  },
  {
    id: 3,
    scenario: "Intervista video registrata in studio professionale",
    detailedDescription: "Questo è un segmento di un'intervista televisiva registrata in uno studio broadcasting professionale. Due persone sono sedute in un ambiente ben illuminato, con telecamere professionali visibili. La conversazione sembra fluire naturalmente con gesti e espressioni appropriate al contesto della discussione.",
    imageUrl: realInterview,
    isDeepfake: false,
    difficulty: "easy",
    hints: [
      "Osserva la coerenza dei movimenti naturali e delle espressioni facciali",
      "La qualità video è uniforme in tutta la scena?",
      "Ci sono artefatti digitali o incongruenze visibili?"
    ],
    explanation: "Questo contenuto è autentico. Tutti gli elementi sono coerenti: l'illuminazione è uniforme e professionale, i movimenti sono fluidi e naturali, le espressioni facciali corrispondono al tono della conversazione, e non ci sono artefatti digitali. La qualità del video è costante in tutto il frame e le interazioni tra le persone appaiono genuine e spontanee."
  },
  {
    id: 4,
    scenario: "Foto di famiglia condivisa sui social media",
    detailedDescription: "Una tipica foto di famiglia scattata all'aperto in un parco durante una giornata di sole. La famiglia appare felice e rilassata, con sorrisi naturali. La foto ha le caratteristiche tipiche di una fotografia smartphone: colori vivaci, luce naturale del giorno, e una composizione informale ma piacevole.",
    imageUrl: realFamily,
    isDeepfake: false,
    difficulty: "easy",
    hints: [
      "Esamina l'illuminazione naturale e come le ombre cadono su tutti i soggetti",
      "Le proporzioni del viso e del corpo sono naturali per tutti?",
      "Ci sono segni di manipolazione digitale o artefatti insoliti?"
    ],
    explanation: "Questa è una fotografia genuina. L'illuminazione naturale del sole crea ombre coerenti su tutti i soggetti. Le texture della pelle mostrano dettagli naturali senza l'eccessiva levigatezza tipica delle manipolazioni. Le proporzioni facciali e corporee sono tutte naturali e le espressioni mostrano le microespressioni tipiche di sorrisi autentici, come le rughe intorno agli occhi."
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
      "Guarda attentamente la texture della pelle - sembra troppo liscia o eccessivamente perfetta?",
      "I bordi del viso sembrano leggermente sfocati o hanno un alone sottile?",
      "Le celebrità tipicamente promuovono prodotti finanziari non regolamentati?"
    ],
    explanation: "Questo è un deepfake sofisticato. Sebbene la qualità generale sia alta, ci sono segnali rivelatori: la texture della pelle appare innaturalmente liscia e priva di imperfezioni tipiche, suggerendo un forte processing digitale. C'è una leggera sfocatura intorno ai bordi del viso, specialmente vicino ai capelli. Inoltre, dal punto di vista contestuale, è altamente insolito che celebrità affidabili promuovano prodotti finanziari rischiosi o schemi di investimento non regolamentati - questo è spesso un segnale di contenuto fraudolento."
  },
  {
    id: 6,
    scenario: "Articolo di notizie con citazioni da fonti verificabili",
    detailedDescription: "Un articolo giornalistico pubblicato su un sito di notizie riconosciuto. L'articolo riporta eventi recenti con citazioni dirette da funzionari governativi e esperti del settore. Le citazioni includono nomi completi, titoli e affiliazioni. L'articolo include anche riferimenti a documenti ufficiali e statistiche specifiche con indicazione delle fonti.",
    imageUrl: "",
    isDeepfake: false,
    difficulty: "medium",
    hints: [
      "Le fonti citate possono essere verificate indipendentemente?",
      "Lo stile di scrittura è coerente con il giornalismo professionale?",
      "Le informazioni possono essere confermate da altre fonti affidabili?"
    ],
    explanation: "Questo è contenuto autentico. Gli indicatori chiave includono: citazioni verificabili con nomi completi e titoli che possono essere controllati, riferimenti a documenti pubblici accessibili, coerenza stilistica con standard giornalistici professionali, e la possibilità di confermare le informazioni attraverso fonti multiple indipendenti. Il giornalismo legittimo fornisce sempre tracce verificabili che permettono ai lettori di controllare l'accuratezza delle informazioni."
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
      "La fonte è una piattaforma di streaming ufficiale e verificata?",
      "I movimenti degli atleti sono fluidi e fisicamente plausibili?",
      "Le reazioni della folla e dei giocatori sono sincronizzate con gli eventi?"
    ],
    explanation: "Questo è contenuto completamente autentico. Gli streaming live ufficiali hanno diversi indicatori di autenticità: la fonte è verificata e ufficiale, i movimenti atletici sono complessi e fisicamente coerenti (estremamente difficili da falsificare in tempo reale), le reazioni multiple (giocatori, allenatori, pubblico) sono tutte sincronizzate naturalmente con gli eventi del gioco. La complessità e l'imprevedibilità di un evento sportivo live rendono praticamente impossibile creare un deepfake convincente in tempo reale."
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
      "Anche se sembra il tuo familiare, noti pattern ripetitivi nei gesti o nelle espressioni?",
      "Le microespressioni facciali (rughe, movimenti muscolari sottili) sono completamente naturali?",
      "Puoi verificare la storia attraverso altri canali di comunicazione con la stessa persona?"
    ],
    explanation: "Questo è un deepfake molto sofisticato, parte di un tipo di truffa in crescita. Anche se la qualità è impressionante e le caratteristiche generali sembrano corrette, un'osservazione attenta rivela sottili ripetizioni nei pattern di movimento e nelle espressioni. I deepfake più avanzati possono replicare volti e voci in modo molto convincente, ma spesso falliscono nelle microespressioni più sottili e complesse. Il contesto (richiesta urgente di denaro) è un segnale d'allarme importante. La verifica attraverso un canale di comunicazione diverso (telefono, video chiamata live) rivelerebbe rapidamente la frode."
  },
  {
    id: 10,
    scenario: "Post di blog tecnico con analisi dettagliata e scientifica",
    detailedDescription: "Un articolo di blog su un argomento scientifico complesso, scritto con un linguaggio tecnico appropriato. L'articolo presenta una struttura logica impeccabile con introduzione, metodologia, risultati e conclusioni. Include grafici e tabelle ben formattate. Tuttavia, alcune delle affermazioni chiave, pur sembrando plausibili, non hanno riferimenti a studi pubblicati e alcune statistiche citate non compaiono in database scientifici verificabili.",
    imageUrl: "",
    isDeepfake: true,
    difficulty: "hard",
    hints: [
      "Tutte le affermazioni scientifiche e le statistiche possono essere verificate in fonti accademiche?",
      "La struttura logica è 'troppo perfetta' mancando delle tipiche imperfezioni della scrittura umana?",
      "L'autore ha credenziali verificabili e altri lavori pubblicati?"
    ],
    explanation: "Questo è contenuto AI-generated mascherato da articolo scientifico. L'AI moderna può creare testi con struttura logica perfetta e linguaggio tecnico convincente, ma spesso include 'allucinazioni' - affermazioni che sembrano plausibili ma non sono verificabili. La perfezione eccessiva nella struttura, senza le piccole imperfezioni tipiche della scrittura umana, è un segnale. Gli articoli scientifici autentici hanno sempre riferimenti verificabili, affiliazioni istituzionali degli autori, e le statistiche possono essere rintracciate alle loro fonti originali. L'assenza di questi elementi verificabili, combinata con affermazioni che non compaiono in database scientifici, rivela la natura artificiale del contenuto."
  },
  {
    id: 11,
    scenario: "Conferenza stampa ufficiale registrata da più angolazioni simultaneamente",
    detailedDescription: "Una conferenza stampa importante trasmessa in diretta da multiple emittenti televisive, ciascuna con le proprie telecamere posizionate in punti diversi della sala. Il confronto tra i diversi feed video mostra la stessa persona da angolazioni diverse: frontale, laterale, e dall'alto. Tutti i movimenti, gesti e timing sono perfettamente coerenti tra tutte le prospettive. Il contenuto include anche domande spontanee da giornalisti e risposte immediate.",
    imageUrl: realPressConference,
    isDeepfake: false,
    difficulty: "hard",
    hints: [
      "Le multiple angolazioni di ripresa mostrano coerenza perfetta nei movimenti e timing?",
      "Ci sono incoerenze tra le diverse prospettive che potrebbero indicare manipolazione?",
      "Le risposte alle domande spontanee mostrano tempi di reazione naturali?"
    ],
    explanation: "Questo è contenuto completamente autentico. La presenza di multiple angolazioni di ripresa simultanee da fonti indipendenti (diverse emittenti televisive) rende estremamente difficile creare un deepfake convincente, poiché richiederebbe la manipolazione coordinata di tutti i feed video mantenendo coerenza perfetta tra prospettive diverse. Le risposte spontanee a domande imprevedibili con tempi di reazione naturali sono un ulteriore indicatore di autenticità. La complessità di falsificare simultaneamente multiple prospettive dello stesso evento in tempo reale è tecnicamente proibitiva anche per i deepfake più avanzati."
  },
  {
    id: 12,
    scenario: "Foto professionale con editing leggero per ottimizzazione",
    detailedDescription: "Una fotografia professionale scattata da un fotografo professionista per un portfolio o materiale promozionale. L'immagine mostra evidenti segni di post-produzione: i colori sono stati migliorati per maggiore vivacità, il contrasto è stato ottimizzato, e c'è stata una leggera correzione dell'esposizione. La pelle del soggetto appare levigata ma mantiene texture naturale. Non ci sono cambiamenti strutturali o alterazioni delle proporzioni.",
    imageUrl: "",
    isDeepfake: false,
    difficulty: "hard",
    hints: [
      "C'è una differenza tra editing fotografico standard e manipolazione strutturale?",
      "La struttura fondamentale e le proporzioni dell'immagine sono intatte?",
      "I miglioramenti sono limitati a colore, contrasto e piccole imperfezioni della pelle?"
    ],
    explanation: "Questo è contenuto autentico con editing fotografico standard e professionale, non un deepfake. È importante distinguere tra l'editing fotografico normale (regolazione di colori, esposizione, rimozione di piccole imperfezioni) e la manipolazione strutturale che caratterizza i deepfake. Questa foto ha subito post-produzione standard che non altera la realtà fondamentale dell'immagine: nessun cambio di identità, nessuna alterazione delle caratteristiche facciali o corporee, nessuna aggiunta o rimozione di elementi importanti. L'editing professionale che migliora la qualità visiva senza distorcere la realtà è una pratica accettata e non costituisce un deepfake o contenuto ingannevole."
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
