import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { CheckCircle2, XCircle, RotateCcw, Award } from "lucide-react";

interface QuizQuestion {
  id: number;
  scenario: string;
  imageDescription: string;
  isDeepfake: boolean;
  difficulty: "easy" | "medium" | "hard";
  hints: string[];
}

const questionBank: QuizQuestion[] = [
  // Easy questions
  {
    id: 1,
    scenario: "Video di un politico che fa una dichiarazione controversa",
    imageDescription: "Movimento innaturale delle labbra, sincronia labiale imperfetta",
    isDeepfake: true,
    difficulty: "easy",
    hints: ["Osserva il movimento delle labbra", "L'audio sembra sincronizzato?"]
  },
  {
    id: 2,
    scenario: "Foto di un CEO che annuncia nuove politiche aziendali",
    imageDescription: "Illuminazione inconsistente sul viso, ombre che non corrispondono",
    isDeepfake: true,
    difficulty: "easy",
    hints: ["Controlla le ombre", "L'illuminazione è coerente?"]
  },
  {
    id: 3,
    scenario: "Intervista video registrata in studio professionale",
    imageDescription: "Movimenti naturali, qualità video coerente, nessun artefatto",
    isDeepfake: false,
    difficulty: "easy",
    hints: ["Tutto sembra naturale?", "La qualità è uniforme?"]
  },
  {
    id: 4,
    scenario: "Foto di famiglia condivisa sui social media",
    imageDescription: "Illuminazione naturale, nessun artefatto digitale visibile",
    isDeepfake: false,
    difficulty: "easy",
    hints: ["Cerca segni di manipolazione digitale", "Le proporzioni sono naturali?"]
  },
  
  // Medium questions
  {
    id: 5,
    scenario: "Video di una celebrità che promuove un prodotto finanziario",
    imageDescription: "Leggera sfocatura intorno ai bordi del viso, texture della pelle troppo liscia",
    isDeepfake: true,
    difficulty: "medium",
    hints: ["Esamina la texture della pelle", "I bordi del viso sono naturali?"]
  },
  {
    id: 6,
    scenario: "Articolo di notizie con citazioni da fonti verificabili",
    imageDescription: "Stile coerente, linguaggio naturale, fonti controllabili",
    isDeepfake: false,
    difficulty: "medium",
    hints: ["Le fonti sono verificabili?", "Lo stile è coerente?"]
  },
  {
    id: 7,
    scenario: "Email urgente dal tuo capo che richiede un trasferimento di denaro",
    imageDescription: "Linguaggio leggermente formale ma con piccole incongruenze stilistiche",
    isDeepfake: true,
    difficulty: "medium",
    hints: ["È un comportamento tipico?", "Ci sono errori sottili?"]
  },
  {
    id: 8,
    scenario: "Streaming live di un evento sportivo su piattaforma ufficiale",
    imageDescription: "Movimenti fluidi, reazioni naturali, qualità broadcast standard",
    isDeepfake: false,
    difficulty: "medium",
    hints: ["È trasmesso da fonte ufficiale?", "I movimenti sono fluidi?"]
  },
  
  // Hard questions
  {
    id: 9,
    scenario: "Video messaggio personale da un familiare",
    imageDescription: "Qualità leggermente inferiore ma con microespressioni quasi perfette, leggera ripetizione di pattern",
    isDeepfake: true,
    difficulty: "hard",
    hints: ["Ci sono pattern ripetitivi?", "Le microespressioni sono naturali?"]
  },
  {
    id: 10,
    scenario: "Post di blog tecnico con analisi dettagliata",
    imageDescription: "Struttura logica perfetta ma con occasionali affermazioni non verificabili",
    isDeepfake: true,
    difficulty: "hard",
    hints: ["Tutte le affermazioni sono verificabili?", "La logica è troppo perfetta?"]
  },
  {
    id: 11,
    scenario: "Conferenza stampa ufficiale registrata da più angolazioni",
    imageDescription: "Movimenti coerenti tra tutte le inquadrature, nessun artefatto",
    isDeepfake: false,
    difficulty: "hard",
    hints: ["Le angolazioni multiple concordano?", "Ci sono incoerenze?"]
  },
  {
    id: 12,
    scenario: "Foto professionale con editing leggero per migliorare i colori",
    imageDescription: "Ritocchi standard, nessuna manipolazione strutturale",
    isDeepfake: false,
    difficulty: "hard",
    hints: ["È editing normale o manipolazione?", "La struttura è intatta?"]
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
          
          <div className="bg-background/50 border border-accent/20 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
            <p className="text-center text-muted-foreground italic">
              {currentQuestion.imageDescription}
            </p>
          </div>

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
              <div className="space-y-2">
                <p className="font-semibold">
                  {selectedAnswer === currentQuestion.isDeepfake ? "Corretto!" : "Non corretto"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Questo contenuto {currentQuestion.isDeepfake ? "è" : "non è"} un deepfake.
                </p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Segnali da notare:</p>
                  {currentQuestion.hints.map((hint, index) => (
                    <p key={index} className="text-accent-cyan">• {hint}</p>
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
