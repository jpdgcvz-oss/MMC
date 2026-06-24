/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { BookOpen, HelpCircle, ChevronDown, Award, Compass, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function DivisibilityTips() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"primes" | "rules" | "active">("rules");

  const rules = [
    { num: 2, rule: "O número deve ser par.", desc: "Qualquer número terminado em 0, 2, 4, 6 ou 8 dividesse por 2. Exemplo: 12, 40, 88." },
    { num: 3, rule: "A soma dos algarismos deve ser divisível por 3.", desc: "Some todos os algarismos do número. Se o resultado for 3, 6, 9, 12, etc., ele é divisível. Exemplo: 15 (1+5=6), 27 (2+7=9)." },
    { num: 5, rule: "O número deve terminar em 0 ou 5.", desc: "Qualquer número que termina com 0 ou 5 é perfeitamente divisível por 5. Exemplo: 25, 50, 115." },
    { num: 7, rule: "Divisão direta ou regra especial.", desc: "Regra rápida: Dobre o último algarismo e subtraia do restante. Se der múltiplo de 7, é divisível. Exemplo: 14, 21, 35, 49." },
    { num: 11, rule: "Soma alternada.", desc: "Subtraia a soma dos algarismos das posições ímpares pela soma das posições pares. Se o resultado for 0 ou múltiplo de 11, ele divide. Exemplo: 121, 132." },
  ];

  const primes = [
    { val: 2, desc: "O único número primo que é par. Sempre comece verificando por ele!" },
    { val: 3, desc: "O segundo menor primo. Se nenhum número for par, verifique se divide por 3." },
    { val: 5, desc: "Se terminar em 5 ou 0 e não dividir por 2 nem 3, use o 5." },
    { val: 7, desc: "Um primo muito comum em desafios e exercícios de fatoração." },
    { val: 11, desc: "Próximo primo importante após o 7." },
    { val: 13, desc: "Aparece em números menores específicos como 39 ou 65." },
  ];

  return (
    <div id="divisibility-tips" className="bg-white border border-indigo-50 rounded-3xl p-5 shadow-xl shadow-indigo-100/20 space-y-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between font-bold text-slate-850 focus:outline-none cursor-pointer"
      >
        <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-bold">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Guia de Apoio ao Estudante
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {(isOpen || true) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-4"
          >
            {/* Tabs */}
            <div className="flex border-b border-indigo-50 text-xs font-bold">
              <button
                onClick={() => setActiveTab("rules")}
                className={`pb-2 px-3 transition-all ${
                  activeTab === "rules" 
                    ? "border-b-2 border-indigo-600 text-indigo-700 font-bold" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Regras de Divisibilidade
              </button>
              <button
                onClick={() => setActiveTab("primes")}
                className={`pb-2 px-3 transition-all ${
                  activeTab === "primes" 
                    ? "border-b-2 border-indigo-600 text-indigo-700 font-bold" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Lista de Primos
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className={`pb-2 px-3 transition-all ${
                  activeTab === "active" 
                    ? "border-b-2 border-indigo-600 text-indigo-700 font-bold" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Metodologia Ativa?
              </button>
            </div>

            {/* Content Tabs */}
            <div className="text-xs space-y-3 min-h-[160px]">
              {activeTab === "rules" && (
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <div key={rule.num} className="border-l-2 border-indigo-500 pl-3 py-0.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                          {rule.num}
                        </span>
                        {rule.rule}
                      </div>
                      <p className="text-slate-500 mt-1">{rule.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "primes" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {primes.map((prime) => (
                    <div key={prime.val} className="p-2.5 rounded-2xl bg-slate-50 border border-indigo-50/50 shadow-sm">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="bg-indigo-600 text-white rounded-lg px-2 py-0.5 text-[10px] font-mono font-bold">
                          {prime.val}
                        </span>
                        Número Primo
                      </div>
                      <p className="text-slate-500 mt-1 leading-normal text-[11px]">{prime.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "active" && (
                <div className="space-y-3 text-slate-600 leading-relaxed p-2">
                  <div className="flex gap-2 items-start">
                    <Compass className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <p>
                      <strong>Ensino Ativo:</strong> Pesquisas educacionais provam que o cérebro retém até <strong>90% mais conhecimento</strong> quando somos desafiados a resolver passo a passo em vez de apenas ler a tabela de MMC pronta.
                    </p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Award className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p>
                      <strong>Erro como Oportunidade:</strong> O erro é uma parte natural e rica do aprendizado! Nosso tutor irá analisar onde você se confundiu nas divisões ou na escolha do número primo e explicará carinhosamente a regra matemática correspondente.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
