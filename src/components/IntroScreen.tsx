/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Brain, Sparkles, ChevronRight, Calculator, Hash, Compass } from "lucide-react";
import { motion } from "motion/react";

interface IntroScreenProps {
  onStartGame: (numbers: number[]) => void;
}

export default function IntroScreen({ onStartGame }: IntroScreenProps) {
  const [numCount, setNumCount] = useState<2 | 3>(2);
  const [val1, setVal1] = useState<number>(8);
  const [val2, setVal2] = useState<number>(12);
  const [val3, setVal3] = useState<number>(15);

  const presets = [
    { name: "Iniciante Clássico", nums: [8, 12], desc: "Perfeito para aprender as primeiras divisões por 2 e 3." },
    { name: "Desafio Ímpar", nums: [9, 15], desc: "Excelente para exercitar divisões diretas pelo primo 3." },
    { name: "Trio Harmonioso", nums: [12, 15, 20], desc: "O trio mais didático! Envolve os primos 2, 3 e 5." },
    { name: "Desafio dos Primos", nums: [15, 25, 30], desc: "Desafio com números maiores para quem já pegou o jeito!" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selected = numCount === 2 ? [val1, val2] : [val1, val2, val3];
    // Filter values
    const cleaned = selected.map(n => Math.max(2, Math.min(99, Math.floor(n))));
    onStartGame(cleaned);
  };

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-12 gap-8 items-stretch py-4">
      {/* Editorial/Intro Column */}
      <div className="md:col-span-5 flex flex-col justify-center space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold tracking-wider uppercase">
            <Brain className="w-3.5 h-3.5 animate-pulse" />
            Metodologias Ativas
          </div>
          <h1 className="text-4xl font-sans font-extrabold text-slate-800 tracking-tight leading-tight">
            Descubra o MMC Através do <span className="text-indigo-600 bg-indigo-50/80 px-3 py-0.5 rounded-2xl border border-indigo-100/50 inline-block">Diálogo</span>
          </h1>
        </div>

        <p className="text-slate-600 leading-relaxed text-sm">
          Bem-vindo ao seu espaço de aprendizado dinâmico! Aqui, você não apenas calcula o Mínimo Múltiplo Comum, mas é 
          guiado passo a passo pelo nosso tutor especialista. 
        </p>

        <div className="space-y-3 font-sans text-sm">
          <div className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">1</span>
            <p className="text-slate-600"><strong className="text-slate-800">Você Escolhe:</strong> Defina 2 ou 3 números que deseja fatorar simultaneamente.</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">2</span>
            <p className="text-slate-600"><strong className="text-slate-800">O Tutor Pergunta:</strong> Identifique os menores números primos divisores interativamente.</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">3</span>
            <p className="text-slate-600"><strong className="text-slate-800">Você Resolve:</strong> Preencha as divisões diretamente no quadro de fatoração.</p>
          </div>
        </div>

        {/* Tip Badge */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/60 flex gap-3 text-xs text-amber-900">
          <Compass className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Dica Pedagógica:</strong> A fatoração simultânea organiza os números em colunas, facilitando a visualização de qual número divide por cada fator primo.
          </span>
        </div>
      </div>

      {/* Inputs / Preset Column */}
      <div className="md:col-span-7 bg-white border border-indigo-100 rounded-3xl p-6 shadow-xl shadow-indigo-100/30 flex flex-col justify-between">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 border-b border-indigo-50 pb-3 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            Configurar Nova Fatoração
          </h2>

          {/* Tab Selector for number of items */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Quantos números você quer calcular?
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-indigo-50/50">
              <button
                type="button"
                onClick={() => setNumCount(2)}
                className={`py-2 text-sm font-medium rounded-xl transition-all ${
                  numCount === 2 
                    ? "bg-white text-indigo-700 shadow-sm font-bold border border-indigo-50" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                2 números (Simples)
              </button>
              <button
                type="button"
                onClick={() => setNumCount(3)}
                className={`py-2 text-sm font-medium rounded-xl transition-all ${
                  numCount === 3 
                    ? "bg-white text-indigo-700 shadow-sm font-bold border border-indigo-50" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                3 números (Desafio Trio)
              </button>
            </div>
          </div>

          {/* Sliders / Inputs */}
          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Defina os números (valores entre 2 e 99)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 p-3.5 bg-slate-50/50 rounded-2xl border border-indigo-50">
                <span className="text-xs font-mono text-indigo-700 font-bold block">Número A</span>
                <input
                  type="number"
                  min={2}
                  max={99}
                  value={val1}
                  onChange={(e) => setVal1(Math.max(2, Math.min(99, parseInt(e.target.value) || 2)))}
                  className="w-full text-center text-xl font-bold bg-white border border-indigo-100 rounded-xl py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
                <input
                  type="range"
                  min={2}
                  max={99}
                  value={val1}
                  onChange={(e) => setVal1(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 mt-2 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 p-3.5 bg-slate-50/50 rounded-2xl border border-indigo-50">
                <span className="text-xs font-mono text-indigo-700 font-bold block">Número B</span>
                <input
                  type="number"
                  min={2}
                  max={99}
                  value={val2}
                  onChange={(e) => setVal2(Math.max(2, Math.min(99, parseInt(e.target.value) || 2)))}
                  className="w-full text-center text-xl font-bold bg-white border border-indigo-100 rounded-xl py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
                <input
                  type="range"
                  min={2}
                  max={99}
                  value={val2}
                  onChange={(e) => setVal2(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 mt-2 cursor-pointer"
                />
              </div>

              {numCount === 3 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1.5 p-3.5 bg-slate-50/50 rounded-2xl border border-indigo-50"
                >
                  <span className="text-xs font-mono text-indigo-700 font-bold block">Número C</span>
                  <input
                    type="number"
                    min={2}
                    max={99}
                    value={val3}
                    onChange={(e) => setVal3(Math.max(2, Math.min(99, parseInt(e.target.value) || 2)))}
                    className="w-full text-center text-xl font-bold bg-white border border-indigo-100 rounded-xl py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  />
                  <input
                    type="range"
                    min={2}
                    max={99}
                    value={val3}
                    onChange={(e) => setVal3(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 mt-2 cursor-pointer"
                  />
                </motion.div>
              )}
            </div>
          </div>

          {/* Action Trigger */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            Iniciar Fatoração Ativa
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        {/* Presets Grid */}
        <div className="mt-6 pt-5 border-t border-indigo-50">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
            Ou escolha um desafio pedagógico pronto:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presets.map((preset, index) => {
              return (
                <div
                  key={index}
                  onClick={() => {
                    setNumCount(preset.nums.length as 2 | 3);
                    setVal1(preset.nums[0]);
                    setVal2(preset.nums[1]);
                    if (preset.nums[2]) setVal3(preset.nums[2]);
                    onStartGame(preset.nums);
                  }}
                  className="p-3.5 rounded-2xl border border-indigo-50 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/30 cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{preset.name}</span>
                    <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-100 font-bold">
                      {preset.nums.join(" e ")}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1">
                    {preset.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
