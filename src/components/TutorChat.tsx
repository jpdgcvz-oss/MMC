/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Brain, Sparkles, AlertCircle, HelpCircle, RefreshCw, 
  ChevronRight, ArrowRight, CornerDownLeft, MessageCircle 
} from "lucide-react";
import { ChatMessage, StepState } from "../types";
// @ts-ignore
import capitaoCharacter from "../assets/images/capitao_character_1782266376699.jpg";

interface TutorChatProps {
  messages: ChatMessage[];
  currentStepState: StepState;
  onSendMessage: (text: string) => void;
  onAnswerPrime: (prime: number) => void;
  onAnswerDivision: (results: number[]) => void;
  onAnswerMultiply: (result: number) => void;
  activeNumbers: number[];
  activePrime?: number;
  isAiLoading: boolean;
  onReset: () => void;
  primesUsed: number[];
}

export default function TutorChat({
  messages,
  currentStepState,
  onSendMessage,
  onAnswerPrime,
  onAnswerDivision,
  onAnswerMultiply,
  activeNumbers,
  activePrime,
  isAiLoading,
  onReset,
  primesUsed
}: TutorChatProps) {
  const [customInput, setCustomInput] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [numInputs, setNumInputs] = useState<string[]>([]);
  
  // Tracking incorrect clicked multiple-choice options to disable/red-out
  const [primeWrong, setPrimeWrong] = useState<number[]>([]);
  const [divisionWrong, setDivisionWrong] = useState<string[]>([]);
  const [multiplyWrong, setMultiplyWrong] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize division inputs whenever the activeNumbers change
  useEffect(() => {
    setNumInputs(activeNumbers.map(() => ""));
    setPrimeWrong([]);
    setDivisionWrong([]);
    setMultiplyWrong([]);
  }, [activeNumbers, activePrime, currentStepState]);

  // Helper: 4 Prime Options for ASK_PRIME
  const getPrimeOptions = () => {
    const correctP = getSmallestPrime();
    const allPrimes = [2, 3, 5, 7, 11, 13];
    const potentialDistractors = allPrimes.filter(p => p !== correctP);
    const distractors = potentialDistractors.slice(0, 3);
    
    const options = [
      { label: `Primo ${correctP}`, isCorrect: true, value: correctP },
      ...distractors.map(d => ({ label: `Primo ${d}`, isCorrect: false, value: d }))
    ];
    return options.sort((a, b) => a.value - b.value);
  };

  // Helper: true smallest prime divisor
  const getSmallestPrime = () => {
    const primes = [2, 3, 5, 7, 11, 13];
    for (const p of primes) {
      if (activeNumbers.some(n => n > 1 && n % p === 0)) {
        return p;
      }
    }
    return 2;
  };

  // Helper: 4 Division Options
  const getDivisionOptions = () => {
    if (!activePrime) return [];
    const correct = activeNumbers.map(n => n % activePrime === 0 ? n / activePrime : n);
    const correctLabel = correct.join(", ");
    
    // Distractor 1: first element left as original
    const dist1 = [...correct];
    dist1[0] = activeNumbers[0];
    const label1 = dist1.join(", ");

    // Distractor 2: last element left as original
    const dist2 = [...correct];
    dist2[dist2.length - 1] = activeNumbers[activeNumbers.length - 1];
    const label2 = dist2.join(", ");

    // Distractor 3: elements offset by 1
    const dist3 = correct.map(n => n > 1 ? n - 1 : n + 1);
    const label3 = dist3.join(", ");

    const options = [
      { label: correctLabel, isCorrect: true, value: correct },
      { label: label1, isCorrect: false, value: dist1 },
      { label: label2, isCorrect: false, value: dist2 },
      { label: label3, isCorrect: false, value: dist3 },
    ];

    const unique: typeof options = [];
    const seen = new Set<string>();
    for (const opt of options) {
      if (!seen.has(opt.label)) {
        seen.add(opt.label);
        unique.push(opt);
      }
    }

    let fillIdx = 1;
    while (unique.length < 4) {
      const fake = correct.map(n => n + fillIdx);
      const fakeLabel = fake.join(", ");
      if (!seen.has(fakeLabel)) {
        seen.add(fakeLabel);
        unique.push({ label: fakeLabel, isCorrect: false, value: fake });
      }
      fillIdx++;
    }

    return unique.sort((a, b) => a.label.localeCompare(b.label));
  };

  // Helper: 4 Multiply Options
  const getMultiplyOptions = () => {
    const correctMMC = primesUsed.reduce((acc, val) => acc * val, 1);
    const dist1 = correctMMC % 2 === 0 ? correctMMC / 2 : correctMMC - 5;
    const dist2 = correctMMC + (activeNumbers[0] || 4);
    const dist3 = correctMMC * 2;

    const options = [
      { label: correctMMC.toString(), isCorrect: true, value: correctMMC },
      { label: dist1.toString(), isCorrect: false, value: dist1 },
      { label: dist2.toString(), isCorrect: false, value: dist2 },
      { label: dist3.toString(), isCorrect: false, value: dist3 },
    ];

    const unique: typeof options = [];
    const seen = new Set<string>();
    for (const opt of options) {
      if (!seen.has(opt.label) && parseInt(opt.label) > 0) {
        seen.add(opt.label);
        unique.push(opt);
      }
    }

    let fillIdx = 1;
    while (unique.length < 4) {
      const val = correctMMC + 10 * fillIdx;
      const fakeLabel = val.toString();
      if (!seen.has(fakeLabel)) {
        seen.add(fakeLabel);
        unique.push({ label: fakeLabel, isCorrect: false, value: val });
      }
      fillIdx++;
    }

    return unique.sort((a, b) => parseInt(a.label) - parseInt(b.label));
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiLoading]);

  // Format message text with bold highlights and Factorization tables
  const renderMessageText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Check if line is a factorization row like: "12, 15, 20 | 2" or "8, 12 | 2"
      if (line.includes("|") && (line.includes(",") || /\d+/.test(line))) {
        const parts = line.split("|");
        const nums = parts[0].trim();
        const divisor = parts[1].trim();
        
        return (
          <div key={idx} className="my-2 flex justify-center select-none font-mono">
            <div className="bg-indigo-950 text-white py-1.5 px-4 rounded-xl border border-indigo-850 flex items-center gap-3 shadow-sm">
              <span className="font-bold tracking-wider text-indigo-200">{nums}</span>
              <span className="w-[1.5px] h-5 bg-indigo-700"></span>
              <span className="font-bold text-amber-400">{divisor || " "}</span>
            </div>
          </div>
        );
      }

      // Handle simple markdown bold **text**
      const parts = [];
      let lastIndex = 0;
      const regex = /\*\*(.*?)\*\*/g;
      let match;

      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="font-extrabold text-indigo-700">
            {match[1]}
          </strong>
        );
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <p key={idx} className="leading-relaxed mb-2 text-slate-700 last:mb-0">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  const handleAiQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    onSendMessage(aiQuestion.trim());
    setAiQuestion("");
  };

  const handlePrimeClick = (prime: number) => {
    onAnswerPrime(prime);
  };

  const handleDivisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const results = numInputs.map(val => parseInt(val));
    if (results.some(isNaN)) return;
    onAnswerDivision(results);
  };

  const handleMultiplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInput);
    if (isNaN(val)) return;
    onAnswerMultiply(val);
    setCustomInput("");
  };

  return (
    <div className="flex flex-col bg-white border border-indigo-50 rounded-3xl overflow-hidden shadow-xl shadow-indigo-100/30 h-[600px]">
      
      {/* Chat header */}
      <div className="bg-slate-50 border-b border-indigo-50 py-3.5 px-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <img 
              src={capitaoCharacter} 
              alt="Capitão Matemática" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-none">Capitão Matemática</h3>
            <span className="text-[11px] text-indigo-600 font-semibold font-sans flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Capitão de MMC Ativo
            </span>
          </div>
        </div>
        
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-xl transition-all flex items-center gap-1.5 font-bold cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
          Recomeçar
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-indigo-50/10">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isTutor = msg.role === "model" || msg.role === "system";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-3 max-w-[85%] ${isTutor ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {/* Avatar */}
                {isTutor ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-100">
                    <img 
                      src={capitaoCharacter} 
                      alt="Capitão" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                    <span className="text-[10px] font-bold font-sans">VC</span>
                  </div>
                )}

                {/* Bubble */}
                <div className={`rounded-2xl p-3.5 shadow-sm text-sm border ${
                  isTutor 
                    ? "bg-white border-indigo-50/80 rounded-tl-none text-slate-700" 
                    : "bg-indigo-50 border-indigo-100/80 rounded-tr-none text-indigo-950"
                }`}>
                  {renderMessageText(msg.text)}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* AI Typing Indicator */}
        {isAiLoading && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 max-w-[85%] mr-auto"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-100">
              <img 
                src={capitaoCharacter} 
                alt="Capitão" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="bg-white border border-indigo-50 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Dynamic Interaction Panel */}
      <div className="border-t border-indigo-50 bg-white p-4 space-y-4">
        
        {/* Step-specific pedagogical controls */}
        <div className="p-3 bg-slate-50 border border-indigo-50/50 rounded-2xl space-y-3">
          {currentStepState === "ASK_PRIME" && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Passo 1: Qual é o menor número primo divisor para {activeNumbers.join(", ")}?
              </span>
              <div className="grid grid-cols-2 gap-2">
                {getPrimeOptions().map((opt, idx) => {
                  const letter = ["A", "B", "C", "D"][idx] || "A";
                  const isWrongClicked = primeWrong.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        if (!opt.isCorrect) {
                          setPrimeWrong(prev => [...prev, opt.value]);
                        }
                        onAnswerPrime(opt.value);
                      }}
                      className={`flex items-center gap-2.5 p-3 text-left text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        isWrongClicked
                          ? "bg-red-50 border-red-200 text-red-700 shadow-inner"
                          : "bg-white border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/20 text-slate-700 shadow-sm"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 ${
                        isWrongClicked ? "bg-red-200 text-red-800" : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {letter}
                      </span>
                      <span className="font-mono">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentStepState === "ASK_DIVISION" && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Passo 2: Resolva as divisões de [{activeNumbers.join(", ")}] por {activePrime}:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {getDivisionOptions().map((opt, idx) => {
                  const letter = ["A", "B", "C", "D"][idx] || "A";
                  const isWrongClicked = divisionWrong.includes(opt.label);
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        if (!opt.isCorrect) {
                          setDivisionWrong(prev => [...prev, opt.label]);
                        }
                        onAnswerDivision(opt.value);
                      }}
                      className={`flex items-center gap-2.5 p-3 text-left text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        isWrongClicked
                          ? "bg-red-50 border-red-200 text-red-700 shadow-inner"
                          : "bg-white border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/20 text-slate-700 shadow-sm"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 ${
                        isWrongClicked ? "bg-red-200 text-red-800" : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {letter}
                      </span>
                      <span className="font-mono">[{opt.label}]</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 italic">
                *Dica: Números não divisíveis repetem eles mesmos!
              </p>
            </div>
          )}

          {currentStepState === "ASK_MULTIPLY_MMC" && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Passo 3: Multiplique os fatores primos {primesUsed.join(" × ")} para achar o MMC:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {getMultiplyOptions().map((opt, idx) => {
                  const letter = ["A", "B", "C", "D"][idx] || "A";
                  const isWrongClicked = multiplyWrong.includes(opt.label);
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        if (!opt.isCorrect) {
                          setMultiplyWrong(prev => [...prev, opt.label]);
                        }
                        onAnswerMultiply(opt.value);
                      }}
                      className={`flex items-center gap-2.5 p-3 text-left text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        isWrongClicked
                          ? "bg-red-50 border-red-200 text-red-700 shadow-inner"
                          : "bg-white border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/20 text-slate-700 shadow-sm"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 ${
                        isWrongClicked ? "bg-red-200 text-red-800" : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {letter}
                      </span>
                      <span className="font-mono">MMC = {opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentStepState === "CONGRATULATIONS" && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-800 flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
                MMC completado com maestria!
              </span>
              <button
                onClick={onReset}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-xl text-xs font-bold shadow-md shadow-indigo-100 hover:shadow-lg transition-all cursor-pointer flex items-center gap-1"
              >
                Próximo Exercício
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Persistent AI General Question Bar */}
        <form onSubmit={handleAiQuestionSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MessageCircle className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Tire dúvidas gerais (Ex: Por que 2 é primo?)"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              disabled={isAiLoading}
              className="w-full bg-slate-50 border border-indigo-50 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700"
            />
          </div>
          <button
            type="submit"
            disabled={isAiLoading || !aiQuestion.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center justify-center cursor-pointer"
            title="Enviar dúvida de matemática para o Capitão Matemática"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
