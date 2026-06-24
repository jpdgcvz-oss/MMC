/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { HelpCircle, Sparkles, Check, Hash } from "lucide-react";

interface ChalkboardProps {
  initialNumbers: number[];
  gridRows: {
    numbers: number[];
    divisor?: number;
  }[];
  currentNumbers: number[];
  activeStepState: string;
  activePrime?: number;
  divisionInputs: string[];
  onDivisionInputChange?: (index: number, val: string) => void;
  inputRefs?: React.MutableRefObject<(HTMLInputElement | null)[]>;
  stepErrors?: boolean[];
}

export default function Chalkboard({
  initialNumbers,
  gridRows,
  currentNumbers,
  activeStepState,
  activePrime,
  divisionInputs,
  onDivisionInputChange,
  stepErrors = []
}: ChalkboardProps) {
  const isThree = initialNumbers.length === 3;

  return (
    <div id="chalkboard-panel" className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-100 p-6 relative overflow-hidden flex flex-col h-full min-h-[480px]">
      
      {/* Decorative background visual accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>

      {/* Board Header */}
      <div className="flex items-center justify-between border-b border-indigo-50 pb-4 mb-4 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Quadro de Fatoração Ativa
          </h2>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-50/80 px-2.5 py-1 rounded-full text-xs text-indigo-700 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Fatoração Simultânea
        </div>
      </div>

      {/* Grid content container */}
      <div className="flex-1 flex flex-col justify-center items-center py-6">
        <div className="relative min-w-[280px] md:min-w-[340px]">
          {/* Factorization Grid */}
          <div className="grid grid-cols-12 gap-0 relative">
            
            {/* Left side: numbers column */}
            <div className={`col-span-8 flex flex-col gap-5 text-right pr-8`}>
              
              {/* Completed Rows */}
              {gridRows.map((row, idx) => (
                <motion.div
                  key={`row-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-3 gap-2 text-2xl font-bold tracking-wider text-slate-700 select-none"
                >
                  {isThree ? (
                    <>
                      <span className="col-span-1">{row.numbers[0]}</span>
                      <span className="col-span-1 text-slate-300 font-normal">,</span>
                      <span className="col-span-1">{row.numbers[1]}</span>
                      <span className="col-span-1 text-slate-300 font-normal">,</span>
                      <span className="col-span-1">{row.numbers[2]}</span>
                    </>
                  ) : (
                    <>
                      <span className="col-span-1"></span>
                      <span className="col-span-1">{row.numbers[0]}</span>
                      <span className="col-span-1 text-slate-300 font-normal">,</span>
                      <span className="col-span-1">{row.numbers[1]}</span>
                    </>
                  )}
                </motion.div>
              ))}

              {/* Current Active Row (the state of dividing or choosing prime) */}
              {activeStepState !== "CONGRATULATIONS" && (
                <div className="relative">
                  <motion.div 
                    animate={{ scale: activeStepState === "ASK_DIVISION" ? [1, 1.01, 1] : 1 }}
                    transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                    className={`grid grid-cols-3 gap-2 text-2xl font-bold tracking-wider rounded-2xl transition-all duration-300 ${
                      activeStepState === "ASK_DIVISION" 
                        ? "bg-amber-50/70 border border-amber-200 p-3 -m-3 shadow-sm shadow-amber-100" 
                        : "p-0"
                    }`}
                  >
                    {isThree ? (
                      <>
                        <div className="col-span-1 flex justify-end">
                          {activeStepState === "ASK_DIVISION" ? (
                            <div className="flex flex-col items-end">
                              <span className="text-slate-400 text-[10px] font-semibold mb-1">{currentNumbers[0]} ÷ {activePrime}</span>
                              <input
                                type="text"
                                maxLength={3}
                                placeholder="?"
                                value={divisionInputs[0] || ""}
                                onChange={(e) => onDivisionInputChange?.(0, e.target.value)}
                                className={`w-14 text-center bg-white border-2 rounded-xl text-lg py-1 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm ${
                                  stepErrors[0] ? "border-red-400 animate-shake bg-red-50 text-red-700" : "border-indigo-100"
                                }`}
                              />
                            </div>
                          ) : (
                            <span className="text-indigo-600">{currentNumbers[0]}</span>
                          )}
                        </div>
                        <span className="col-span-1 text-slate-300 font-normal flex items-end justify-center pb-2">,</span>
                        
                        <div className="col-span-1 flex justify-end">
                          {activeStepState === "ASK_DIVISION" ? (
                            <div className="flex flex-col items-end">
                              <span className="text-slate-400 text-[10px] font-semibold mb-1">{currentNumbers[1]} ÷ {activePrime}</span>
                              <input
                                type="text"
                                maxLength={3}
                                placeholder="?"
                                value={divisionInputs[1] || ""}
                                onChange={(e) => onDivisionInputChange?.(1, e.target.value)}
                                className={`w-14 text-center bg-white border-2 rounded-xl text-lg py-1 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm ${
                                  stepErrors[1] ? "border-red-400 animate-shake bg-red-50 text-red-700" : "border-indigo-100"
                                }`}
                              />
                            </div>
                          ) : (
                            <span className="text-indigo-600">{currentNumbers[1]}</span>
                          )}
                        </div>
                        <span className="col-span-1 text-slate-300 font-normal flex items-end justify-center pb-2">,</span>

                        <div className="col-span-1 flex justify-end">
                          {activeStepState === "ASK_DIVISION" ? (
                            <div className="flex flex-col items-end">
                              <span className="text-slate-400 text-[10px] font-semibold mb-1">{currentNumbers[2]} ÷ {activePrime}</span>
                              <input
                                type="text"
                                maxLength={3}
                                placeholder="?"
                                value={divisionInputs[2] || ""}
                                onChange={(e) => onDivisionInputChange?.(2, e.target.value)}
                                className={`w-14 text-center bg-white border-2 rounded-xl text-lg py-1 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm ${
                                  stepErrors[2] ? "border-red-400 animate-shake bg-red-50 text-red-700" : "border-indigo-100"
                                }`}
                              />
                            </div>
                          ) : (
                            <span className="text-indigo-600">{currentNumbers[2]}</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="col-span-1"></span>
                        <div className="col-span-1 flex justify-end">
                          {activeStepState === "ASK_DIVISION" ? (
                            <div className="flex flex-col items-end">
                              <span className="text-slate-400 text-[10px] font-semibold mb-1">{currentNumbers[0]} ÷ {activePrime}</span>
                              <input
                                type="text"
                                maxLength={3}
                                placeholder="?"
                                value={divisionInputs[0] || ""}
                                onChange={(e) => onDivisionInputChange?.(0, e.target.value)}
                                className={`w-14 text-center bg-white border-2 rounded-xl text-lg py-1 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm ${
                                  stepErrors[0] ? "border-red-400 animate-shake bg-red-50 text-red-700" : "border-indigo-100"
                                }`}
                              />
                            </div>
                          ) : (
                            <span className="text-indigo-600">{currentNumbers[0]}</span>
                          )}
                        </div>
                        <span className="col-span-1 text-slate-300 font-normal flex items-end justify-center pb-2">,</span>
                        
                        <div className="col-span-1 flex justify-end">
                          {activeStepState === "ASK_DIVISION" ? (
                            <div className="flex flex-col items-end">
                              <span className="text-slate-400 text-[10px] font-semibold mb-1">{currentNumbers[1]} ÷ {activePrime}</span>
                              <input
                                type="text"
                                maxLength={3}
                                placeholder="?"
                                value={divisionInputs[1] || ""}
                                onChange={(e) => onDivisionInputChange?.(1, e.target.value)}
                                className={`w-14 text-center bg-white border-2 rounded-xl text-lg py-1 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm ${
                                  stepErrors[1] ? "border-red-400 animate-shake bg-red-50 text-red-700" : "border-indigo-100"
                                }`}
                              />
                            </div>
                          ) : (
                            <span className="text-indigo-600">{currentNumbers[1]}</span>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                </div>
              )}

              {/* Show final 1s row when congratulations */}
              {activeStepState === "CONGRATULATIONS" && (
                <div className="grid grid-cols-3 gap-2 text-2xl font-bold tracking-wider text-indigo-600 select-none">
                  {isThree ? (
                    <>
                      <span className="col-span-1">1</span>
                      <span className="col-span-1 text-indigo-200 font-normal">,</span>
                      <span className="col-span-1">1</span>
                      <span className="col-span-1 text-indigo-200 font-normal">,</span>
                      <span className="col-span-1">1</span>
                    </>
                  ) : (
                    <>
                      <span className="col-span-1"></span>
                      <span className="col-span-1">1</span>
                      <span className="col-span-1 text-indigo-200 font-normal flex items-end">,</span>
                      <span className="col-span-1">1</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Vertical Theme Divider Bar */}
            <div className="col-span-1 flex justify-center relative">
              <div className="w-1 bg-indigo-100 rounded-full h-full min-h-[140px] absolute top-[-10px] bottom-[-10px]"></div>
            </div>

            {/* Right side: divisors column */}
            <div className="col-span-3 flex flex-col gap-5 text-left pl-6 select-none">
              
              {/* Completed Row Divisors */}
              {gridRows.map((row, idx) => (
                <motion.div
                  key={`div-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="text-2xl font-black text-indigo-600 bg-indigo-50/80 border border-indigo-100 px-3 py-1.5 rounded-xl h-[42px] flex items-center justify-center w-12"
                >
                  {row.divisor}
                </motion.div>
              ))}

              {/* Current Row Divisor */}
              {activeStepState !== "CONGRATULATIONS" && (
                <div className="text-2xl font-bold h-[42px] flex items-center justify-start pl-1">
                  {activePrime ? (
                    <motion.span 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-indigo-600 bg-indigo-50/80 border border-indigo-100 px-3 py-1.5 rounded-xl text-center w-12 font-black"
                    >
                      {activePrime}
                    </motion.span>
                  ) : (
                    activeStepState === "ASK_PRIME" ? (
                      <div className="border-2 border-dashed border-amber-300 bg-amber-50 rounded-xl w-12 h-10 flex items-center justify-center animate-pulse">
                        <span className="text-amber-500 italic text-xl font-bold">?</span>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Classroom Status Footer */}
      <div className="border-t border-indigo-50 pt-4 mt-auto select-none">
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Tutor de Fatoração Ativa</span>
          <span>Fatoração em tempo real</span>
        </div>
      </div>
    </div>
  );
}
