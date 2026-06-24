/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, Sparkles, Compass, Lightbulb, GraduationCap, 
  HelpCircle, ChevronRight, Award, Trophy, Star 
} from "lucide-react";
// @ts-ignore
import fepiLogo from "./assets/images/fepi_logo_1782266389493.jpg";
import { ChatMessage, StepState } from "./types";
import { 
  generateSteps, 
  getSmallestPrimeDivisor, 
  divideNumbers, 
  isPrime, 
  getDivisibilityRuleExplanation 
} from "./utils/mathUtils";

import Chalkboard from "./components/Chalkboard";
import IntroScreen from "./components/IntroScreen";
import TutorChat from "./components/TutorChat";
import DivisibilityTips from "./components/DivisibilityTips";

export default function App() {
  // Navigation / screen states
  const [inGame, setInGame] = useState(false);
  const [initialNumbers, setInitialNumbers] = useState<number[]>([]);
  const [currentNumbers, setCurrentNumbers] = useState<number[]>([]);
  const [gridRows, setGridRows] = useState<{ numbers: number[]; divisor?: number }[]>([]);
  const [primesUsed, setPrimesUsed] = useState<number[]>([]);
  const [currentStepState, setCurrentStepState] = useState<StepState>("INTRO");
  
  // Game control variables
  const [activePrime, setActivePrime] = useState<number | undefined>(undefined);
  const [divisionInputs, setDivisionInputs] = useState<string[]>([]);
  const [stepErrors, setStepErrors] = useState<boolean[]>([]);
  
  // Chat thread states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Initial welcome message on mounting
  useEffect(() => {
    const welcomeId = Math.random().toString();
    setMessages([
      {
        id: welcomeId,
        role: "model",
        text: "Olá! Sou o seu **Tutor de Matemática Especialista em Metodologias Ativas**. Que ótimo ter você aqui! 🌟\n\nHoje vamos aprender a calcular o **Mínimo Múltiplo Comum (MMC)** de uma forma super interativa: você será o protagonista e eu serei o seu guia.\n\nPara começarmos, **digite ou selecione os números** que você deseja encontrar o MMC na configuração ao lado!",
        timestamp: new Date()
      }
    ]);
  }, []);

  // Helper to add chat messages
  const addMessage = (role: "user" | "model", text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        role,
        text,
        timestamp: new Date()
      }
    ]);
  };

  // Resets the game session
  const handleReset = () => {
    setInGame(false);
    setInitialNumbers([]);
    setCurrentNumbers([]);
    setGridRows([]);
    setPrimesUsed([]);
    setCurrentStepState("INTRO");
    setActivePrime(undefined);
    setDivisionInputs([]);
    setStepErrors([]);
    
    setMessages([
      {
        id: Math.random().toString(),
        role: "model",
        text: "Vamos começar uma nova jornada de aprendizado! **Escolha os novos números** para fatorarmos juntos.",
        timestamp: new Date()
      }
    ]);
  };

  // Initiates a factorization session
  const handleStartGame = (numbers: number[]) => {
    setInitialNumbers(numbers);
    setCurrentNumbers(numbers);
    setGridRows([{ numbers }]);
    setPrimesUsed([]);
    setCurrentStepState("ASK_PRIME");
    setInGame(true);
    setDivisionInputs(numbers.map(() => ""));
    setStepErrors(numbers.map(() => false));

    const numString = numbers.length === 3 
      ? `**${numbers[0]}, ${numbers[1]} e ${numbers[2]}**` 
      : `**${numbers[0]} e ${numbers[1]}**`;

    addMessage("model", `Excelente escolha! Vamos encontrar o MMC de ${numString} por meio da fatoração simultânea.\n\nOlhe o nosso **Quadro de Fatoração** à direita! Ele já foi inicializado com os números que você escolheu.\n\nAgora, vamos ao primeiro passo. Me diga:\n\n**Qual é o menor número primo que podemos usar para dividir esses números agora?**`);
  };

  // Process the student's answer for the divisor prime
  const handleAnswerPrime = (prime: number) => {
    // 1. Calculate true smallest prime divisor
    const correctPrime = getSmallestPrimeDivisor(currentNumbers);
    
    // Log user step
    addMessage("user", `Acho que podemos usar o número primo ${prime}.`);

    if (prime === correctPrime) {
      // Correct answer!
      setActivePrime(prime);
      setPrimesUsed(prev => [...prev, prime]);
      setDivisionInputs(currentNumbers.map(() => ""));
      setStepErrors(currentNumbers.map(() => false));
      
      // Update grid row divisor
      setGridRows(prev => {
        const copy = [...prev];
        if (copy.length > 0) {
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            divisor: prime
          };
        }
        return copy;
      });

      setCurrentStepState("ASK_DIVISION");
      
      setTimeout(() => {
        addMessage("model", `**Muito bem!** O número **${prime}** é exatamente o menor número primo divisor correto! 👏\n\nAgora, dê uma olhada no quadro-negro. Escrevemos o ${prime} do lado direito da linha vertical.\n\nO próximo passo é realizar as divisões. **Qual é o resultado de dividir ${currentNumbers.join(", ")} por ${prime}?**\n\nPreencha os valores diretamente no quadro de fatoração ou use os campos aqui embaixo! Se um número não for divisível, basta repeti-lo.`);
      }, 500);

    } else {
      // Check why it's wrong to give high-quality pedagogical feedback
      if (!isPrime(prime)) {
        addMessage("model", `Opa! O número **${prime}** não é um número primo. 🧐\n\nLembra que os **números primos** são aqueles maiores que 1 que têm apenas dois divisores: o 1 e eles mesmos (como 2, 3, 5, 7, 11, etc.).\n\nQual é o menor número primo que divide pelo menos um dos números **${currentNumbers.join(", ")}** de forma exata?`);
      } else if (!currentNumbers.some(n => n > 1 && n % prime === 0)) {
        addMessage("model", `O número **${prime}** é primo, mas **não divide nenhum** de nossos números atuais (**${currentNumbers.join(", ")}**) sem deixar resto.\n\nPrecisamos encontrar um divisor exato! Qual é o menor número primo divisor disponível?`);
      } else {
        // It divides, but it's not the smallest
        const ruleExplanation = getDivisibilityRuleExplanation(correctPrime);
        addMessage("model", `Você percebeu bem! O número **${prime}** realmente divide um de nossos números. Mas atenção:\n\n**Ele não é o menor primo divisor disponível!**\n\nPara mantermos a fatoração simultânea organizada, devemos começar sempre pelo menor primo possível. Como temos números pares, podemos começar por um primo menor!\n\n*Dica:* ${ruleExplanation}\n\nQual é o menor primo que devemos escolher?`);
      }
    }
  };

  // Process the student's answer for division calculations
  const handleAnswerDivision = (results: number[]) => {
    // 1. Calculate correct divisions
    const correctResults = divideNumbers(currentNumbers, activePrime!);
    
    // Construct user submission display
    addMessage("user", `Os resultados das divisões são: ${results.join(", ")}`);

    // Verify answers index by index
    const errors = results.map((res, idx) => res !== correctResults[idx]);
    setStepErrors(errors);

    if (errors.some(err => err)) {
      // Find where they went wrong to explain
      const explanations: string[] = [];
      results.forEach((res, idx) => {
        if (res !== correctResults[idx]) {
          const original = currentNumbers[idx];
          if (original % activePrime! === 0) {
            explanations.push(`Na divisão de **${original} ÷ ${activePrime}**, o resultado correto é **${original / activePrime!}**, e você colocou **${res}**.`);
          } else {
            explanations.push(`O número **${original}** não é divisível por **${activePrime}**. Portanto, seguindo a nossa regra, deveríamos apenas repetir o número **${original}**, mas você colocou **${res}**.`);
          }
        }
      });

      addMessage("model", `Ficamos bem pertinho! Vamos revisar as contas com calma:\n\n${explanations.join("\n")}\n\nAjuste as divisões que têm o contorno vermelho e tente novamente. Errar faz parte do aprendizado!`);
    } else {
      // Correct divisions!
      // Add a new row to the table grid for the next step
      const updatedGrid = [...gridRows, { numbers: correctResults }];
      setGridRows(updatedGrid);
      setCurrentNumbers(correctResults);
      setActivePrime(undefined);
      
      // Reset inputs
      setDivisionInputs(correctResults.map(() => ""));
      setStepErrors(correctResults.map(() => false));

      // Check if all numbers reached 1
      const isComplete = correctResults.every(n => n === 1);

      if (isComplete) {
        setCurrentStepState("ASK_MULTIPLY_MMC");
        setTimeout(() => {
          addMessage("model", `**Incrível! Excelente trabalho!** 🎉\n\nConseguimos reduzir todos os números a **1**! Veja como o nosso Quadro de Fatoração está completo.\n\nAgora vem o grande desafio final. Para encontrar o **MMC**, precisamos multiplicar todos os números primos que usamos na fatoração:\n\n**${primesUsed.join(" × ")}**\n\nQual é o resultado final dessa multiplicação?`);
        }, 500);
      } else {
        setCurrentStepState("ASK_PRIME");
        setTimeout(() => {
          addMessage("model", `**Sensacional! Divisões exatas.** 🌟 Já escrevi a nova linha no nosso quadro: **${correctResults.join(", ")}**.\n\nContinuando o nosso processo de fatoração, me responda:\n\n**Qual é o menor número primo que divide pelo menos um desses novos números agora?**`);
        }, 500);
      }
    }
  };

  // Process the final multiplication step
  const handleAnswerMultiply = (result: number) => {
    // Calculate actual MMC
    const correctMMC = primesUsed.reduce((acc, val) => acc * val, 1);
    
    addMessage("user", `O resultado do MMC é ${result}.`);

    if (result === correctMMC) {
      setCurrentStepState("CONGRATULATIONS");
      addMessage("model", `🏆 **SENSACIONAL! VOCÊ DESCOBRIU O MMC!** \n\nA resposta correta é mesmo **${correctMMC}**! \n\nParabéns! Você utilizou metodologias ativas com maestria: escolheu os números, encontrou os menores primos divisores, calculou as divisões no quadro e efetuou a multiplicação final.\n\nCompreender o processo passo a passo é o segredo para se tornar um mestre em matemática! Se quiser praticar novamente com outros números, clique em **Próximo Exercício** ou pergunte algo ao nosso Tutor.`);
    } else {
      addMessage("model", `Quase lá! O resultado **${result}** não está correto.\n\nVamos fazer por partes:\n${primesUsed.map((p, idx) => {
        if (idx === 0) return "";
        const partial = primesUsed.slice(0, idx + 1).reduce((a, b) => a * b, 1);
        const formula = primesUsed.slice(0, idx + 1).join(" × ");
        return `- ${formula} = **${partial}**`;
      }).filter(Boolean).join("\n")}\n\nTente fazer a multiplicação novamente com calma!`);
    }
  };

  // Handles standard general chat messages using server-side Gemini tutor
  const handleSendMessage = async (text: string) => {
    // Add user message to chat thread
    addMessage("user", text);
    setIsAiLoading(true);

    try {
      // Build conversation history for the AI tutor
      const history = messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        text: msg.text
      }));

      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          history: history.slice(-6) // Send last 6 messages to stay fast and compact
        })
      });

      if (!response.ok) {
        throw new Error("Erro na comunicação com o servidor.");
      }

      const data = await response.json();
      addMessage("model", data.reply);
    } catch (err: any) {
      console.error(err);
      addMessage("model", "Estou por aqui! Desculpe, tive um pequeno soluço de conexão com o meu cérebro de IA. Mas fique tranquilo! Podemos continuar o nosso jogo de MMC perfeitamente nos botões interativos e no quadro-negro.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Division inputs updater callback from Chalkboard UI
  const handleDivisionInputChange = (index: number, val: string) => {
    const copy = [...divisionInputs];
    copy[index] = val;
    setDivisionInputs(copy);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Editorial Navigation Header */}
      <header className="bg-white border-b border-indigo-50 py-4 px-6 select-none shadow-xl shadow-indigo-100/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={fepiLogo} 
              alt="Colégio FEPI" 
              className="h-10 w-auto object-contain" 
              referrerPolicy="no-referrer"
            />
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Capitão Matemática: Desafio do MMC
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
                Metodologias Ativas de Matemática
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/50">
              <Brain className="w-3.5 h-3.5 animate-pulse" />
              Capitão Disponível
            </span>
            <span className="text-indigo-100">|</span>
            <span className="font-mono text-slate-400">Ativo</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col justify-center">
        
        <AnimatePresence mode="wait">
          {!inGame ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <IntroScreen onStartGame={handleStartGame} />
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="grid lg:grid-cols-12 gap-6 items-stretch"
            >
              {/* Left Column: Interactive active chatbot */}
              <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-6">
                <TutorChat
                  messages={messages}
                  currentStepState={currentStepState}
                  onSendMessage={handleSendMessage}
                  onAnswerPrime={handleAnswerPrime}
                  onAnswerDivision={handleAnswerDivision}
                  onAnswerMultiply={handleAnswerMultiply}
                  activeNumbers={currentNumbers}
                  activePrime={activePrime}
                  isAiLoading={isAiLoading}
                  onReset={handleReset}
                  primesUsed={primesUsed}
                />

                <DivisibilityTips />
              </div>

              {/* Right Column: Chalkboard Simulation */}
              <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-6">
                
                {/* Visual statistics or progress row */}
                <div className="bg-white border border-indigo-50 rounded-3xl p-4 flex items-center justify-between shadow-xl shadow-indigo-100/10 select-none">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-amber-50 rounded-xl text-amber-600">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-500 animate-spin-slow" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-none">Exercício em Andamento</h4>
                      <p className="text-[11px] text-slate-500 mt-1">MMC de {initialNumbers.join(", ")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Status</span>
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100/50">
                        {currentStepState === "ASK_PRIME" ? "Escolhendo Primo" : 
                         currentStepState === "ASK_DIVISION" ? "Dividindo Linha" : 
                         currentStepState === "ASK_MULTIPLY_MMC" ? "Resultado Final" : "Finalizado"}
                      </span>
                    </div>
                  </div>
                </div>

                <Chalkboard
                  initialNumbers={initialNumbers}
                  gridRows={gridRows}
                  currentNumbers={currentNumbers}
                  activeStepState={currentStepState}
                  activePrime={activePrime}
                  divisionInputs={divisionInputs}
                  onDivisionInputChange={handleDivisionInputChange}
                  stepErrors={stepErrors}
                />

                {/* Additional Active Learning motivators */}
                <div className="p-4 rounded-3xl bg-indigo-50/40 border border-indigo-100/50 flex items-start gap-3.5 shadow-sm">
                  <Lightbulb className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-950">
                    <strong className="font-bold">O que fazer agora?</strong> 
                    {currentStepState === "ASK_PRIME" && " Verifique os números destacados no quadro virtual. Qual é o menor número primo (2, 3, 5...) que consegue dividir pelo menos um deles sem sobrar resto? Selecione-o no chat!"}
                    {currentStepState === "ASK_DIVISION" && ` Insira os resultados das divisões de cada número por ${activePrime} no quadro. Se o número não dividir exatamente, repita o número atual. Depois, confirme sua resposta!`}
                    {currentStepState === "ASK_MULTIPLY_MMC" && " Multiplique todos os números primos que colocamos na coluna da direita do nosso quadro. O produto deles é o MMC final! Calcule de cabeça ou em um papel."}
                    {currentStepState === "CONGRATULATIONS" && " Parabéns pelo seu aprendizado ativo! O MMC foi calculado com sucesso. Clique em 'Próximo Exercício' para tentar fatorar outro grupo de números."}
                  </div>
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Aesthetic Footer */}
      <footer className="bg-white border-t border-indigo-50 py-6 mt-auto select-none">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Capitão Matemática. Desenvolvido pelo Professor João Paulo Dutra.</p>
          <div className="flex gap-4">
            <span className="hover:text-indigo-600 cursor-pointer">Termos de Uso</span>
            <span>•</span>
            <span className="hover:text-indigo-600 cursor-pointer">Metodologias Ativas</span>
            <span>•</span>
            <span className="hover:text-indigo-600 cursor-pointer">Ajuda</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
