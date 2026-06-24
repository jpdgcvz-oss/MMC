/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Brain, Sparkles, RefreshCw, MessageCircle 
} from "lucide-react";
import { ChatMessage, StepState } from "../types";
// @ts-ignore
import capitaoCharacter from "../assets/images/capitao_character_1782266376699.jpg";

interface TutorChatProps {
  messages: ChatMessage[];
  currentStepState: StepState;
  onSendMessage: (text: string) => void;
  activeNumbers: number[];
  activePrime?: number;
  isAiLoading: boolean;
  onReset: () => void;
}

export default function TutorChat({
  messages,
  currentStepState,
  onSendMessage,
  activeNumbers,
  activePrime,
  isAiLoading,
  onReset
}: TutorChatProps) {
  const [aiQuestion, setAiQuestion] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat safely without causing parent window scroll jumps
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
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
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-indigo-50/10">
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
      </div>

      {/* Persistent AI General Question Bar & Form */}
      <div className="border-t border-indigo-50 bg-white p-4">
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
