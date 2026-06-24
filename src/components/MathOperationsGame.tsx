/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Minus, X, Check, HelpCircle, RefreshCw, 
  ArrowLeft, ArrowRight, Brain, Sparkles, BookOpen, AlertCircle, Award, Trophy, Star, Divide
} from "lucide-react";

// Types for our operations game
type OperationType = "ADD" | "SUB" | "MUL" | "DIV";

interface OperationPreset {
  id: string;
  type: OperationType;
  num1: number;
  num2: number;
  title: string;
  description: string;
  difficulty: "Fácil" | "Médio" | "Difícil";
}

interface OptionItem {
  id: string;
  label: string;
  isCorrect: boolean;
  value?: {
    result: string;
    carry?: string;
    borrow?: boolean;
    groupIdx?: number;
    colIdx?: number;
    remainder?: string;
    remainderColIdx?: number;
  };
  feedback?: string;
}

const PRESETS: OperationPreset[] = [
  {
    id: "add-easy",
    type: "ADD",
    num1: 43,
    num2: 25,
    title: "Adição Simples",
    description: "Para aquecer! Adição de dois algarismos sem precisar 'ir um'.",
    difficulty: "Fácil"
  },
  {
    id: "add-medium",
    type: "ADD",
    num1: 385,
    num2: 47,
    title: "Adição com 'Vai Um'",
    description: "Alinhamento importante! Soma que exige transporte para a dezena e centena.",
    difficulty: "Médio"
  },
  {
    id: "add-hard",
    type: "ADD",
    num1: 589,
    num2: 264,
    title: "Soma de Três Dígitos",
    description: "Desafio completo com múltiplos transportes ('vai um') entre colunas.",
    difficulty: "Difícil"
  },
  {
    id: "sub-easy",
    type: "SUB",
    num1: 87,
    num2: 34,
    title: "Subtração Sem Empréstimo",
    description: "Subtração direta de dois dígitos, ideal para compreender a montagem.",
    difficulty: "Fácil"
  },
  {
    id: "sub-medium",
    type: "SUB",
    num1: 243,
    num2: 85,
    title: "Subtração com Empréstimo",
    description: "Pegue emprestado da dezena para subtrair unidades maiores!",
    difficulty: "Médio"
  },
  {
    id: "sub-hard",
    type: "SUB",
    num1: 405,
    num2: 128,
    title: "Empréstimo Através do Zero",
    description: "O maior clássico! Quando a dezena é zero e precisamos pegar da centena.",
    difficulty: "Difícil"
  },
  {
    id: "mul-easy",
    type: "MUL",
    num1: 32,
    num2: 3,
    title: "Multiplicação Direta",
    description: "Multiplicação simples por um dígito sem carry-over.",
    difficulty: "Fácil"
  },
  {
    id: "mul-medium",
    type: "MUL",
    num1: 46,
    num2: 8,
    title: "Multiplicação com Transporte",
    description: "Multiplicando com transporte ('vai um') para a coluna seguinte.",
    difficulty: "Médio"
  },
  {
    id: "mul-hard",
    type: "MUL",
    num1: 135,
    num2: 6,
    title: "Multiplicação Desafio",
    description: "Três algarismos multiplicados por um dígito com múltiplos transportes.",
    difficulty: "Difícil"
  },
  {
    id: "mul-two-digits",
    type: "MUL",
    num1: 34,
    num2: 12,
    title: "Multiplicação com 2 Algarismos",
    description: "Resolva primeiro toda a multiplicação das unidades, depois das dezenas e faça a soma final das duas parcelas!",
    difficulty: "Difícil"
  },
  {
    id: "div-easy",
    type: "DIV",
    num1: 48,
    num2: 4,
    title: "Divisão Exata Simples",
    description: "Divisão de dois dígitos sem precisar agrupar de início, perfeita para aprender o fluxo.",
    difficulty: "Fácil"
  },
  {
    id: "div-medium",
    type: "DIV",
    num1: 246,
    num2: 6,
    title: "Agrupamento de Início",
    description: "O primeiro dígito é menor que o divisor, então precisamos agrupar os dois primeiros!",
    difficulty: "Médio"
  },
  {
    id: "div-hard",
    type: "DIV",
    num1: 385,
    num2: 5,
    title: "Divisão Desafio Completa",
    description: "Três dígitos divididos por 5 com múltiplos passos de resto e divisão.",
    difficulty: "Difícil"
  }
];

interface MathOperationsGameProps {
  onBackToMenu: () => void;
}

export default function MathOperationsGame({ onBackToMenu }: MathOperationsGameProps) {
  // Game mode selection & presets
  const [selectedPreset, setSelectedPreset] = useState<OperationPreset | null>(null);
  
  // Custom numbers setup
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customType, setCustomType] = useState<OperationType>("ADD");
  const [customNum1, setCustomNum1] = useState(385);
  const [customNum2, setCustomNum2] = useState(47);
  const [divCustomNum1, setDivCustomNum1] = useState(246);
  const [divCustomNum2, setDivCustomNum2] = useState(6);
  const [showChangeNumbersModal, setShowChangeNumbersModal] = useState(false);

  // Active game states
  const [gameStage, setGameStage] = useState<"SELECT" | "SETUP" | "SOLVING" | "COMPLETED">("SELECT");
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [opType, setOpType] = useState<OperationType>("ADD");

  // Options for multiple choice gameplay
  const [currentOptions, setCurrentOptions] = useState<OptionItem[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [wrongOptions, setWrongOptions] = useState<string[]>([]);

  // Simple shuffle function
  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  // Grid cell values (thousands, hundreds, tens, units - index 0, 1, 2, 3)
  // Student inputs during SETUP stage
  const [gridRow1, setGridRow1] = useState<string[]>(["", "", "", ""]); // Top number digits
  const [gridRow2, setGridRow2] = useState<string[]>(["", "", "", ""]); // Bottom number digits
  const [gridOperator, setGridOperator] = useState<string>(""); // Operator sign (+, -, x)
  
  // Student inputs during SOLVING stage
  const [gridResult, setGridResult] = useState<string[]>(["", "", "", ""]); // Answer digits
  const [gridCarries, setGridCarries] = useState<string[]>(["", "", "", ""]); // "Vai um" carry values
  
  // 2-Digit Multiplication Specific States
  const [mulStep, setMulStep] = useState<"PARTIAL1" | "PARTIAL2" | "ADDITION">("PARTIAL1");
  const [gridMulRow1, setGridMulRow1] = useState<string[]>(["", "", "", ""]); // 1st partial product (top * bottom units)
  const [gridMulRow2, setGridMulRow2] = useState<string[]>(["", "", "", ""]); // 2nd partial product (top * bottom tens)
  
  // Borrowing tracking for subtraction
  // index points to column: 0=Thousands, 1=Hundreds, 2=Tens, 3=Units
  const [borrowedFrom, setBorrowedFrom] = useState<boolean[]>([false, false, false, false]);
  const [originalValues, setOriginalValues] = useState<string[]>(["", "", "", ""]); // Stored when slashed
  const [borrowedValue, setBorrowedValue] = useState<string[]>(["", "", "", ""]); // Stored when slashed (e.g. "3" instead of "4")
  const [hasExtraTen, setHasExtraTen] = useState<boolean[]>([false, false, false, false]); // For column receiving 10

  // Feedback states
  const [tutorMessage, setTutorMessage] = useState<string>("");
  const [divStepIndex, setDivStepIndex] = useState<number>(0);
  const [divSteps, setDivSteps] = useState<any[]>([]);

  // Dynamic division steps generator for element-by-element long division
  const generateDivisionSteps = (n1: number, n2: number) => {
    const steps = [];
    const digits = n1.toString().split("");
    let i = 0;
    let prevRemainder = 0;

    let firstGroupSize = 1;
    if (parseInt(digits[0]) < n2 && digits.length > 1) {
      firstGroupSize = 2;
      if (parseInt(digits.slice(0, 2).join("")) < n2 && digits.length > 2) {
        firstGroupSize = 3;
      }
    }

    while (i < digits.length) {
      const digit = digits[i];
      if (i === 0) {
        // First digit
        if (firstGroupSize > 1) {
          const groupedVal = parseInt(digits.slice(0, firstGroupSize).join(""));
          const q = Math.floor(groupedVal / n2);
          const r = groupedVal % n2;
          
          const firstDigitCol = digits.length === 3 ? 1 : digits.length === 2 ? 2 : 3;
          const quotientColIdx = firstDigitCol + firstGroupSize - 1;

          steps.push({
            type: "GROUP",
            message: firstGroupSize === 3 
              ? `Como o primeiro algarismo **${digits[0]}** e o segundo **${digits[1]}** são menores que o divisor **${n2}**, nós juntamos com o terceiro algarismo **${digits[2]}** para formar o número **${groupedVal}**.`
              : `Como o primeiro algarismo **${digits[0]}** é menor que o divisor **${n2}**, nós juntamos com o próximo algarismo **${digits[1]}** para formar o número **${groupedVal}**.`,
            options: [
              {
                id: `div-group-${i}`,
                label: `Dividir ${groupedVal}`,
                isCorrect: true,
                value: { result: "", groupIdx: firstGroupSize - 1 }
              },
              {
                id: `div-group-wrong-${i}`,
                label: `Dividir ${digits[0]}`,
                isCorrect: false,
                feedback: `Não é possível dividir um número menor por um divisor maior nas contas de divisão inteira escolar! Junte os algarismos.`
              },
              {
                id: `div-group-wrong-2-${i}`,
                label: `Dividir tudo`,
                isCorrect: false,
                feedback: `Vá passo a passo! Primeiro, separe o menor grupo de algarismos da esquerda que seja maior ou igual a ${n2}.`
              }
            ]
          });

          steps.push({
            type: "DIVIDE",
            message: `Agora, divida **${groupedVal}** por **${n2}**. Quantas vezes o **${n2}** cabe inteiramente dentro de **${groupedVal}**?`,
            options: [
              {
                id: `div-divide-${i}`,
                label: `Dá ${q}`,
                isCorrect: true,
                value: { result: q.toString(), colIdx: quotientColIdx }
              },
              {
                id: `div-divide-wrong-1-${i}`,
                label: `Dá ${q + 1}`,
                isCorrect: false,
                feedback: `${q + 1} × ${n2} = ${(q + 1) * n2}, que passa de ${groupedVal}! Escolha um valor menor.`
              },
              {
                id: `div-divide-wrong-2-${i}`,
                label: `Dá ${q - 1 >= 0 ? q - 1 : q + 2}`,
                isCorrect: false,
                feedback: `Podemos chegar mais perto de ${groupedVal} sem passar dele!`
              }
            ]
          });

          steps.push({
            type: "SUBTRACT",
            message: `Multiplicamos **${q} × ${n2} = ${q * n2}**. Agora, subtraia esse valor de **${groupedVal}** para achar o resto:`,
            options: [
              {
                id: `div-sub-${i}`,
                label: `Resto: ${r}`,
                isCorrect: true,
                value: { result: "", remainder: r.toString(), remainderColIdx: quotientColIdx }
              },
              {
                id: `div-sub-wrong-${i}`,
                label: `Resto: ${r + 1}`,
                isCorrect: false,
                feedback: `Cálculo incorreto. Faça a subtração: ${groupedVal} - ${q * n2}.`
              },
              {
                id: `div-sub-wrong-2-${i}`,
                label: `Resto: ${r + 2}`,
                isCorrect: false,
                feedback: `Essa não é a resposta correta. Faça a conta de cabeça ou no rascunho!`
              }
            ]
          });

          prevRemainder = r;
          i += firstGroupSize; // skip grouped indices
        } else {
          // Normal divide of first digit
          const digitVal = parseInt(digit);
          const q = Math.floor(digitVal / n2);
          const r = digitVal % n2;
          const colIdx = digits.length === 3 ? 1 : digits.length === 2 ? 2 : 3;

          steps.push({
            type: "DIVIDE",
            message: `Divida o primeiro algarismo **${digit}** por **${n2}**. Qual é o maior número inteiro que multiplicado por **${n2}** chega mais perto de **${digit}**?`,
            options: [
              {
                id: `div-divide-${i}`,
                label: `Dá ${q}`,
                isCorrect: true,
                value: { result: q.toString(), colIdx: colIdx }
              },
              {
                id: `div-divide-wrong-1-${i}`,
                label: `Dá ${q + 1}`,
                isCorrect: false,
                feedback: `${q + 1} × ${n2} passa de ${digit}!`
              },
              {
                id: `div-divide-wrong-2-${i}`,
                label: `Dá ${q - 1 >= 0 ? q - 1 : q + 2}`,
                isCorrect: false,
                feedback: `Podemos chegar mais perto de ${digit}!`
              }
            ]
          });

          steps.push({
            type: "SUBTRACT",
            message: `Multiplicamos **${q} × ${n2} = ${q * n2}**. Subtraia esse valor de **${digit}** para obter o resto:`,
            options: [
              {
                id: `div-sub-${i}`,
                label: `Resto: ${r}`,
                isCorrect: true,
                value: { result: "", remainder: r.toString(), remainderColIdx: colIdx }
              },
              {
                id: `div-sub-wrong-${i}`,
                label: `Resto: ${r + 1}`,
                isCorrect: false,
                feedback: `Incorreto. Faça a subtração: ${digit} - ${q * n2}.`
              }
            ]
          });

          prevRemainder = r;
          i += 1;
        }
      } else {
        // Subsequent digits: must "bring down"
        const nextDigit = digits[i];
        const combinedVal = parseInt(prevRemainder.toString() + nextDigit);
        const q = Math.floor(combinedVal / n2);
        const r = combinedVal % n2;
        const colIdx = 3 - (digits.length - 1 - i);

        steps.push({
          type: "BRING_DOWN",
          message: `Agora, baixe o próximo algarismo **${nextDigit}** do dividendo juntando-o com o resto anterior (**${prevRemainder}**) para formar o número **${combinedVal}**.`,
          options: [
            {
              id: `div-bring-${i}`,
              label: `Baixar o ${nextDigit}`,
              isCorrect: true,
              value: { result: "" }
            },
            {
              id: `div-bring-wrong-${i}`,
              label: `Dividir só ${nextDigit}`,
              isCorrect: false,
              feedback: `Não se esqueça de juntar o dígito baixado com o resto da operação anterior!`
            }
          ]
        });

        steps.push({
          type: "DIVIDE",
          message: `Divida **${combinedVal}** por **${n2}**. Quantas vezes o divisor **${n2}** cabe dentro de **${combinedVal}**?`,
          options: [
            {
              id: `div-divide-${i}`,
              label: `Dá ${q}`,
              isCorrect: true,
              value: { result: q.toString(), colIdx: colIdx }
            },
            {
              id: `div-divide-wrong-1-${i}`,
              label: `Dá ${q + 1}`,
              isCorrect: false,
              feedback: `Passa de ${combinedVal}!`
            },
            {
              id: `div-divide-wrong-2-${i}`,
              label: `Dá ${q - 1 >= 0 ? q - 1 : q + 2}`,
              isCorrect: false,
              feedback: `Podemos chegar mais perto de ${combinedVal} sem passar!`
            }
          ]
        });

        steps.push({
          type: "SUBTRACT",
          message: `Multiplicamos **${q} × ${n2} = ${q * n2}**. Subtraia de **${combinedVal}** para encontrar o resto:`,
          options: [
            {
              id: `div-sub-${i}`,
              label: `Resto: ${r}`,
              isCorrect: true,
              value: { result: "", remainder: r.toString(), remainderColIdx: colIdx }
            },
            {
              id: `div-sub-wrong-${i}`,
              label: `Resto: ${r + 1}`,
              isCorrect: false,
              feedback: `Incorreto. Faça a subtração: ${combinedVal} - ${q * n2}.`
            }
          ]
        });

        prevRemainder = r;
        i += 1;
      }
    }

    return steps;
  };

  // Model representing the custom step-by-step Portuguese Division bracket and subtractions
  const getDivisionBoardModel = () => {
    const digits = num1.toString().split("");
    const divisor = num2;
    
    if (!divSteps || divSteps.length === 0) {
      return {
        isFirstGrouped: false,
        groupSize: 1,
        revealedQuotient: [],
        stages: []
      };
    }

    let groupSize = 1;
    if (parseInt(digits[0]) < divisor && digits.length > 1) {
      groupSize = 2;
      if (parseInt(digits.slice(0, 2).join("")) < divisor && digits.length > 2) {
        groupSize = 3;
      }
    }
    const isFirstGrouped = groupSize > 1;
    
    // Let's determine which steps have been reached or completed
    const isStepReached = (type: string, occurrence: number) => {
      let count = 0;
      for (let i = 0; i <= divStepIndex; i++) {
        if (divSteps[i]?.type === type) {
          if (count === occurrence) return true;
          count++;
        }
      }
      return false;
    };

    const isStepCompleted = (type: string, occurrence: number) => {
      let count = 0;
      for (let i = 0; i < divStepIndex; i++) {
        if (divSteps[i]?.type === type) {
          if (count === occurrence) return true;
          count++;
        }
      }
      return false;
    };

    // Calculate revealed quotient digits
    const revealedQuotient: string[] = [];
    for (let i = 0; i < divSteps.length; i++) {
      if (divSteps[i]?.type === "DIVIDE") {
        const correctOpt = divSteps[i]?.options?.find((o: any) => o.isCorrect);
        const val = correctOpt?.value?.result;
        if (val) {
          if (i < divStepIndex || gameStage === "COMPLETED") {
            revealedQuotient.push(val);
          } else if (i === divStepIndex) {
            revealedQuotient.push("?");
          }
        }
      }
    }

    interface SubtractionStage {
      level: number;
      topValue: string;
      subValue: string;
      remainder: string;
      bringDownDigit?: string;
      bringDownFromIdx?: number;
      showTop: boolean;
      showSub: boolean;
      showLine: boolean;
      showRemainder: boolean;
      showBringDown: boolean;
      activeType?: "DIVIDE" | "SUBTRACT" | "BRING_DOWN";
    }

    const stages: SubtractionStage[] = [];

    // Stage 1: First Division
    const val1 = parseInt(digits.slice(0, groupSize).join(""));
    const q1 = Math.floor(val1 / divisor);
    const sub1 = q1 * divisor;
    const rem1 = val1 - sub1;

    stages.push({
      level: 1,
      topValue: val1.toString(),
      subValue: sub1.toString(),
      remainder: rem1.toString(),
      showTop: true,
      showSub: isStepReached("SUBTRACT", 0),
      showLine: isStepReached("SUBTRACT", 0),
      showRemainder: isStepCompleted("SUBTRACT", 0) || isStepReached("BRING_DOWN", 0) || isStepReached("DIVIDE", 1) || gameStage === "COMPLETED",
      showBringDown: isStepReached("BRING_DOWN", 0) && digits.length > groupSize,
      bringDownDigit: digits[groupSize],
      bringDownFromIdx: groupSize + 1,
      activeType: divSteps[divStepIndex]?.type === "DIVIDE" && divStepIndex <= 1 ? "DIVIDE" :
                  divSteps[divStepIndex]?.type === "SUBTRACT" && divStepIndex <= 2 ? "SUBTRACT" : undefined
    });

    // Stage 2: Second Division
    if (digits.length > groupSize) {
      const nextDigit1 = digits[groupSize];
      const combinedVal1 = parseInt(rem1.toString() + nextDigit1);
      const q2 = Math.floor(combinedVal1 / divisor);
      const sub2 = q2 * divisor;
      const rem2 = combinedVal1 - sub2;
      const hasStage3 = digits.length > groupSize + 1;

      stages.push({
        level: 2,
        topValue: combinedVal1.toString(),
        subValue: sub2.toString(),
        remainder: rem2.toString(),
        showTop: isStepReached("BRING_DOWN", 0),
        showSub: isStepReached("SUBTRACT", 1),
        showLine: isStepReached("SUBTRACT", 1),
        showRemainder: isStepCompleted("SUBTRACT", 1) || (hasStage3 && isStepReached("BRING_DOWN", 1)) || isStepReached("DIVIDE", 2) || gameStage === "COMPLETED",
        showBringDown: hasStage3 && isStepReached("BRING_DOWN", 1),
        bringDownDigit: hasStage3 ? digits[groupSize + 1] : undefined,
        bringDownFromIdx: hasStage3 ? groupSize + 2 : undefined,
        activeType: divSteps[divStepIndex]?.type === "BRING_DOWN" && divSteps[divStepIndex]?.options[0]?.id?.includes(`div-bring-${groupSize}`) ? "BRING_DOWN" :
                    divSteps[divStepIndex]?.type === "DIVIDE" && divSteps[divStepIndex]?.options[0]?.id?.includes(`div-divide-${groupSize}`) ? "DIVIDE" :
                    divSteps[divStepIndex]?.type === "SUBTRACT" && divSteps[divStepIndex]?.options[0]?.id?.includes(`div-sub-${groupSize}`) ? "SUBTRACT" : undefined
      });

      // Stage 3: Third Division (only if 3 digits and group size was 1)
      if (hasStage3) {
        const nextDigit2 = digits[groupSize + 1];
        const combinedVal2 = parseInt(rem2.toString() + nextDigit2);
        const q3 = Math.floor(combinedVal2 / divisor);
        const sub3 = q3 * divisor;
        const rem3 = combinedVal2 - sub3;

        stages.push({
          level: 3,
          topValue: combinedVal2.toString(),
          subValue: sub3.toString(),
          remainder: rem3.toString(),
          showTop: isStepReached("BRING_DOWN", 1),
          showSub: isStepReached("SUBTRACT", 2),
          showLine: isStepReached("SUBTRACT", 2),
          showRemainder: isStepCompleted("SUBTRACT", 2) || gameStage === "COMPLETED",
          showBringDown: false,
          activeType: divSteps[divStepIndex]?.type === "BRING_DOWN" && divSteps[divStepIndex]?.options[0]?.id?.includes(`div-bring-${groupSize+1}`) ? "BRING_DOWN" :
                      divSteps[divStepIndex]?.type === "DIVIDE" && divSteps[divStepIndex]?.options[0]?.id?.includes(`div-divide-${groupSize+1}`) ? "DIVIDE" :
                      divSteps[divStepIndex]?.type === "SUBTRACT" && divSteps[divStepIndex]?.options[0]?.id?.includes(`div-sub-${groupSize+1}`) ? "SUBTRACT" : undefined
        });
      }
    }

    return {
      isFirstGrouped,
      groupSize,
      revealedQuotient,
      stages
    };
  };

  const getDivisionGridCells = () => {
    const model = getDivisionBoardModel();
    if (!model) return [];
    
    interface GridCell {
      row: number;
      col: number;
      content: string;
      className?: string;
      isHighlighted?: boolean;
      showArrow?: boolean;
      arrowStartRow?: number;
      arrowEndRow?: number;
    }

    const cells: GridCell[] = [];
    const digits = num1.toString().split("");
    const firstDigitCol = 1;
    
    // Row 0: Dividend
    for (let c = 1; c <= digits.length; c++) {
      const digit = digits[c - 1];
      const isGrouped = c >= firstDigitCol && c < firstDigitCol + model.groupSize;
      const isCurrentActive = model.stages[0]?.activeType === "DIVIDE" && isGrouped;
      cells.push({
        row: 0,
        col: c,
        content: digit,
        isHighlighted: isCurrentActive,
        className: `border border-indigo-100 rounded-xl bg-white text-indigo-950 font-extrabold text-lg flex items-center justify-center w-10 h-10 shadow-sm`
      });
    }

    // Bracket Line and Divisor on Col 5 Row 0
    cells.push({
      row: 0,
      col: 5,
      content: num2.toString(),
      className: `border-l-4 border-b-4 border-indigo-900 bg-indigo-50/80 text-indigo-950 font-extrabold text-lg flex items-center justify-center w-10 h-10`
    });

    // Quotient Row: Row 1, Col 5
    const qStr = model.revealedQuotient.join("");
    cells.push({
      row: 1,
      col: 5,
      content: qStr || " ",
      className: `text-emerald-700 font-extrabold text-lg tracking-widest bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center justify-center w-10 h-10 shadow-sm`
    });

    // Render the subtraction/remainder stages
    model.stages.forEach((stage, sIdx) => {
      // Subtraction line
      if (stage.showSub) {
        const subRowIdx = sIdx * 2 + 1;
        
        // minus symbol
        cells.push({
          row: subRowIdx,
          col: 0,
          content: "−",
          className: `text-red-500 font-extrabold text-xl flex items-center justify-center h-10`
        });

        const subDigits = stage.subValue.split("");
        let subCols: number[] = [];
        const endCol = firstDigitCol + model.groupSize + sIdx - 1;
        for (let d = 0; d < subDigits.length; d++) {
          subCols.unshift(endCol - d);
        }

        subDigits.forEach((d, dIdx) => {
          const col = subCols[dIdx];
          cells.push({
            row: subRowIdx,
            col: col,
            content: d,
            isHighlighted: stage.activeType === "SUBTRACT",
            className: `border-b-2 border-slate-700/80 text-indigo-950 font-extrabold text-lg flex items-center justify-center h-10`
          });
        });
      }

      // Remainder line
      if (stage.showRemainder) {
        const remRowIdx = sIdx * 2 + 2;
        const remCol = firstDigitCol + model.groupSize + sIdx - 1;
        
        const nextStage = model.stages[sIdx + 1];
        const isNextStageDividing = nextStage?.activeType === "DIVIDE";
        const isCurrentActiveBringDown = stage.activeType === "BRING_DOWN";

        let remClassName = `font-extrabold text-lg flex items-center justify-center w-10 h-10 shadow-sm transition-all `;
        
        if (isCurrentActiveBringDown) {
          // Unified with brought down digit on right (rounded left only, border-r-0)
          remClassName += `bg-amber-100 border-2 border-r-0 border-amber-400 rounded-l-xl rounded-r-none text-amber-800 animate-pulse`;
        } else if (isNextStageDividing) {
          // Unified in next stage division (rounded left only, border-r-0, indigo theme)
          remClassName += `bg-indigo-100 border-2 border-r-0 border-indigo-400 rounded-l-xl rounded-r-none text-indigo-900`;
        } else {
          // Normal remainder style
          remClassName += `bg-emerald-50/70 border border-emerald-100 rounded-xl text-emerald-600`;
        }

        cells.push({
          row: remRowIdx,
          col: remCol,
          content: stage.remainder,
          isHighlighted: stage.activeType === "SUBTRACT",
          className: remClassName
        });

        // Bring down digit next to remainder
        if (stage.showBringDown && stage.bringDownDigit) {
          const downCol = stage.bringDownFromIdx || 3;
          
          let downClassName = `font-extrabold text-lg flex items-center justify-center w-10 h-10 shadow-sm transition-all `;
          if (isCurrentActiveBringDown) {
            // Unified with remainder on left (rounded right only, border-l-0)
            downClassName += `bg-amber-100 border-2 border-l-0 border-amber-400 rounded-r-xl rounded-l-none text-amber-800 animate-pulse`;
          } else if (isNextStageDividing) {
            // Unified in next stage division (rounded right only, border-l-0, indigo theme)
            downClassName += `bg-indigo-100 border-2 border-l-0 border-indigo-400 rounded-r-xl rounded-l-none text-indigo-900`;
          } else {
            // Normal bring down style
            downClassName += `bg-amber-50 border border-amber-200 rounded-xl text-amber-600`;
          }

          cells.push({
            row: remRowIdx,
            col: downCol,
            content: stage.bringDownDigit,
            isHighlighted: stage.activeType === "BRING_DOWN",
            className: downClassName,
            showArrow: true,
            arrowStartRow: 1,
            arrowEndRow: remRowIdx
          });
        }
      }
    });

    return cells;
  };

  const [activeColumn, setActiveColumn] = useState<number>(3); // start at Units (index 3)
  const [setupErrors, setSetupErrors] = useState<{ row1?: boolean[]; row2?: boolean[]; operator?: boolean }>({});
  const [solvingErrors, setSolvingErrors] = useState<{ result?: boolean[]; carries?: boolean[] }>({});

  // Generate options for multiple choice
  useEffect(() => {
    if (gameStage !== "SOLVING") {
      setCurrentOptions([]);
      setSelectedOptionId(null);
      setWrongOptions([]);
      return;
    }

    if (opType === "DIV") {
      // Division options are managed by our step index flow directly!
      return;
    }

    // Reset option selections for the new step/column
    setSelectedOptionId(null);
    setWrongOptions([]);

    const expectedRow1 = ["", "", "", ""];
    const expectedRow2 = ["", "", "", ""];
    const n1Str = num1.toString();
    const n2Str = num2.toString();

    for (let i = 0; i < n1Str.length; i++) {
      expectedRow1[3 - i] = n1Str[n1Str.length - 1 - i];
    }
    for (let i = 0; i < n2Str.length; i++) {
      expectedRow2[3 - i] = n2Str[n2Str.length - 1 - i];
    }

    const colIdx = activeColumn;

    const uniqueOptions = (optionsList: OptionItem[]): OptionItem[] => {
      const seen = new Set<string>();
      const result: OptionItem[] = [];
      for (const opt of optionsList) {
        if (!seen.has(opt.label)) {
          seen.add(opt.label);
          result.push(opt);
        }
      }
      let idx = 1;
      while (result.length < 4) {
        const val = Math.floor(Math.random() * 10);
        const label = `${val}`;
        if (!seen.has(label)) {
          seen.add(label);
          result.push({
            id: `fake-fill-${idx}`,
            label,
            isCorrect: false,
            value: { result: val.toString() }
          });
          idx++;
        }
      }
      return result;
    };

    if (opType === "ADD") {
      const digit1 = parseInt(expectedRow1[colIdx] || "0");
      const digit2 = parseInt(expectedRow2[colIdx] || "0");
      const carryIn = parseInt(gridCarries[colIdx] || "0");

      const colSum = digit1 + digit2 + carryIn;
      const expectedDigitResult = colSum % 10;
      const expectedCarryOut = Math.floor(colSum / 10);

      let opts: OptionItem[] = [];
      if (expectedCarryOut > 0) {
        opts = [
          {
            id: "add-correct",
            label: `${expectedDigitResult} (Sobe ${expectedCarryOut})`,
            isCorrect: true,
            value: { result: expectedDigitResult.toString(), carry: expectedCarryOut.toString() }
          },
          {
            id: "add-wrong-carry",
            label: `${expectedDigitResult}`,
            isCorrect: false,
            value: { result: expectedDigitResult.toString(), carry: "0" }
          },
          {
            id: "add-wrong-digit-1",
            label: `${(expectedDigitResult + 1) % 10} (Sobe ${expectedCarryOut})`,
            isCorrect: false,
            value: { result: ((expectedDigitResult + 1) % 10).toString(), carry: expectedCarryOut.toString() }
          },
          {
            id: "add-wrong-digit-2",
            label: `${(expectedDigitResult + 2) % 10} (Sobe ${expectedCarryOut})`,
            isCorrect: false,
            value: { result: ((expectedDigitResult + 2) % 10).toString(), carry: expectedCarryOut.toString() }
          }
        ];
      } else {
        opts = [
          {
            id: "add-correct",
            label: `${expectedDigitResult}`,
            isCorrect: true,
            value: { result: expectedDigitResult.toString(), carry: "0" }
          },
          {
            id: "add-wrong-digit-1",
            label: `${(expectedDigitResult + 1) % 10}`,
            isCorrect: false,
            value: { result: ((expectedDigitResult + 1) % 10).toString(), carry: "0" }
          },
          {
            id: "add-wrong-digit-2",
            label: `${(expectedDigitResult + 2) % 10}`,
            isCorrect: false,
            value: { result: ((expectedDigitResult + 2) % 10).toString(), carry: "0" }
          }
        ];
      }

      setCurrentOptions(shuffleArray(uniqueOptions(opts)));
    } 
    
    else if (opType === "SUB") {
      const actualD1 = parseInt(gridRow1[colIdx] || "0");
      const d2 = parseInt(expectedRow2[colIdx] || "0");
      const computedD1 = actualD1 + (hasExtraTen[colIdx] ? 10 : 0);

      if (computedD1 < d2) {
        // Needs borrowing
        const opts: OptionItem[] = [
          {
            id: "sub-borrow-correct",
            label: `Pegar emprestado (✂️)`,
            isCorrect: true,
            value: { result: "", borrow: true }
          },
          {
            id: "sub-borrow-wrong-1",
            label: `Calcular ${d2} - ${computedD1}`,
            isCorrect: false,
            value: { result: (d2 - computedD1).toString() }
          },
          {
            id: "sub-borrow-wrong-2",
            label: `Colocar zero (0)`,
            isCorrect: false,
            value: { result: "0" }
          },
          {
            id: "sub-borrow-wrong-3",
            label: `Somar: ${computedD1} + ${d2}`,
            isCorrect: false,
            value: { result: ((computedD1 + d2) % 10).toString() }
          }
        ];
        setCurrentOptions(shuffleArray(uniqueOptions(opts)));
      } else {
        const expectedResult = computedD1 - d2;
        const opts: OptionItem[] = [
          {
            id: "sub-calc-correct",
            label: `${expectedResult}`,
            isCorrect: true,
            value: { result: expectedResult.toString() }
          },
          {
            id: "sub-calc-wrong-1",
            label: `${expectedResult + 1}`,
            isCorrect: false,
            value: { result: (expectedResult + 1).toString() }
          },
          {
            id: "sub-calc-wrong-2",
            label: `${expectedResult === 0 ? 9 : expectedResult - 1}`,
            isCorrect: false,
            value: { result: (expectedResult === 0 ? 9 : expectedResult - 1).toString() }
          },
          {
            id: "sub-calc-wrong-3",
            label: `${expectedResult + 2}`,
            isCorrect: false,
            value: { result: (expectedResult + 2).toString() }
          }
        ];
        setCurrentOptions(shuffleArray(uniqueOptions(opts)));
      }
    } 
    
    else if (opType === "MUL") {
      if (num2 >= 10) {
        if (mulStep === "PARTIAL1") {
          const digit1 = parseInt(expectedRow1[colIdx] || "0");
          const multiplier = num2 % 10;
          const carryIn = parseInt(gridCarries[colIdx] || "0");

          const product = (digit1 * multiplier) + carryIn;
          const expectedDigitResult = product % 10;
          const expectedCarryOut = Math.floor(product / 10);

          let opts: OptionItem[] = [];
          if (expectedCarryOut > 0) {
            opts = [
              {
                id: "mul-p1-correct",
                label: `${expectedDigitResult} (Sobe ${expectedCarryOut})`,
                isCorrect: true,
                value: { result: expectedDigitResult.toString(), carry: expectedCarryOut.toString() }
              },
              {
                id: "mul-p1-wrong-carry",
                label: `${expectedDigitResult}`,
                isCorrect: false,
                value: { result: expectedDigitResult.toString(), carry: "0" }
              },
              {
                id: "mul-p1-wrong-digit-1",
                label: `${(expectedDigitResult + 1) % 10} (Sobe ${expectedCarryOut})`,
                isCorrect: false,
                value: { result: ((expectedDigitResult + 1) % 10).toString(), carry: expectedCarryOut.toString() }
              },
              {
                id: "mul-p1-wrong-digit-2",
                label: `${(expectedDigitResult + 2) % 10} (Sobe ${expectedCarryOut})`,
                isCorrect: false,
                value: { result: ((expectedDigitResult + 2) % 10).toString(), carry: expectedCarryOut.toString() }
              }
            ];
          } else {
            opts = [
              {
                id: "mul-p1-correct",
                label: `${expectedDigitResult}`,
                isCorrect: true,
                value: { result: expectedDigitResult.toString(), carry: "0" }
              },
              {
                id: "mul-p1-wrong-digit-1",
                label: `${(expectedDigitResult + 1) % 10}`,
                isCorrect: false,
                value: { result: ((expectedDigitResult + 1) % 10).toString(), carry: "0" }
              },
              {
                id: "mul-p1-wrong-digit-2",
                label: `${(expectedDigitResult + 2) % 10}`,
                isCorrect: false,
                value: { result: ((expectedDigitResult + 2) % 10).toString(), carry: "0" }
              }
            ];
          }
          setCurrentOptions(shuffleArray(uniqueOptions(opts)));
        } else if (mulStep === "PARTIAL2") {
          const topDigitCol = colIdx + 1;
          const digit1 = parseInt(expectedRow1[topDigitCol] || "0");
          const multiplier = Math.floor(num2 / 10);
          const carryIn = parseInt(gridCarries[colIdx] || "0");

          const product = (digit1 * multiplier) + carryIn;
          const expectedDigitResult = product % 10;
          const expectedCarryOut = Math.floor(product / 10);

          let opts: OptionItem[] = [];
          if (expectedCarryOut > 0) {
            opts = [
              {
                id: "mul-p2-correct",
                label: `${expectedDigitResult} (Sobe ${expectedCarryOut})`,
                isCorrect: true,
                value: { result: expectedDigitResult.toString(), carry: expectedCarryOut.toString() }
              },
              {
                id: "mul-p2-wrong-carry",
                label: `${expectedDigitResult}`,
                isCorrect: false,
                value: { result: expectedDigitResult.toString(), carry: "0" }
              },
              {
                id: "mul-p2-wrong-digit-1",
                label: `${(expectedDigitResult + 1) % 10} (Sobe ${expectedCarryOut})`,
                isCorrect: false,
                value: { result: ((expectedDigitResult + 1) % 10).toString(), carry: expectedCarryOut.toString() }
              },
              {
                id: "mul-p2-wrong-digit-2",
                label: `${(expectedDigitResult + 2) % 10} (Sobe ${expectedCarryOut})`,
                isCorrect: false,
                value: { result: ((expectedDigitResult + 2) % 10).toString(), carry: expectedCarryOut.toString() }
              }
            ];
          } else {
            opts = [
              {
                id: "mul-p2-correct",
                label: `${expectedDigitResult}`,
                isCorrect: true,
                value: { result: expectedDigitResult.toString(), carry: "0" }
              },
              {
                id: "mul-p2-wrong-digit-1",
                label: `${(expectedDigitResult + 1) % 10}`,
                isCorrect: false,
                value: { result: ((expectedDigitResult + 1) % 10).toString(), carry: "0" }
              },
              {
                id: "mul-p2-wrong-digit-2",
                label: `${(expectedDigitResult + 2) % 10}`,
                isCorrect: false,
                value: { result: ((expectedDigitResult + 2) % 10).toString(), carry: "0" }
              }
            ];
          }
          setCurrentOptions(shuffleArray(uniqueOptions(opts)));
        } else if (mulStep === "ADDITION") {
          const digit1 = parseInt(gridMulRow1[colIdx] || "0");
          const val2Raw = gridMulRow2[colIdx] || "0";
          const digit2 = val2Raw === "+" ? 0 : parseInt(val2Raw || "0");
          const carryIn = parseInt(gridCarries[colIdx] || "0");

          const colSum = digit1 + digit2 + carryIn;
          const expectedDigitResult = colSum % 10;
          const expectedCarryOut = Math.floor(colSum / 10);

          let opts: OptionItem[] = [];
          if (expectedCarryOut > 0) {
            opts = [
              {
                id: "mul-add-correct",
                label: `${expectedDigitResult} (Sobe ${expectedCarryOut})`,
                isCorrect: true,
                value: { result: expectedDigitResult.toString(), carry: expectedCarryOut.toString() }
              },
              {
                id: "mul-add-wrong-carry",
                label: `${expectedDigitResult}`,
                isCorrect: false,
                value: { result: expectedDigitResult.toString(), carry: "0" }
              },
              {
                id: "mul-add-wrong-digit-1",
                label: `${(expectedDigitResult + 1) % 10} (Sobe ${expectedCarryOut})`,
                isCorrect: false,
                value: { result: ((expectedDigitResult + 1) % 10).toString(), carry: expectedCarryOut.toString() }
              },
              {
                id: "mul-add-wrong-digit-2",
                label: `${(expectedDigitResult + 2) % 10} (Sobe ${expectedCarryOut})`,
                isCorrect: false,
                value: { result: ((expectedDigitResult + 2) % 10).toString(), carry: expectedCarryOut.toString() }
              }
            ];
          } else {
            opts = [
              {
                id: "mul-add-correct",
                label: `${expectedDigitResult}`,
                isCorrect: true,
                value: { result: expectedDigitResult.toString(), carry: "0" }
              },
              {
                id: "mul-add-wrong-digit-1",
                label: `${(expectedDigitResult + 1) % 10}`,
                isCorrect: false,
                value: { result: ((expectedDigitResult + 1) % 10).toString(), carry: "0" }
              },
              {
                id: "mul-add-wrong-digit-2",
                label: `${(expectedDigitResult + 2) % 10}`,
                isCorrect: false,
                value: { result: ((expectedDigitResult + 2) % 10).toString(), carry: "0" }
              }
            ];
          }
          setCurrentOptions(shuffleArray(uniqueOptions(opts)));
        }
      } else {
        const digit1 = parseInt(expectedRow1[colIdx] || "0");
        const multiplier = num2;
        const carryIn = parseInt(gridCarries[colIdx] || "0");

        const product = (digit1 * multiplier) + carryIn;
        const expectedDigitResult = product % 10;
        const expectedCarryOut = Math.floor(product / 10);

        let opts: OptionItem[] = [];
        if (expectedCarryOut > 0) {
          opts = [
            {
              id: "mul-correct",
              label: `${expectedDigitResult} (Sobe ${expectedCarryOut})`,
              isCorrect: true,
              value: { result: expectedDigitResult.toString(), carry: expectedCarryOut.toString() }
            },
            {
              id: "mul-wrong-carry",
              label: `${expectedDigitResult}`,
              isCorrect: false,
              value: { result: expectedDigitResult.toString(), carry: "0" }
            },
            {
              id: "mul-wrong-digit-1",
              label: `${(expectedDigitResult + 1) % 10} (Sobe ${expectedCarryOut})`,
              isCorrect: false,
              value: { result: ((expectedDigitResult + 1) % 10).toString(), carry: expectedCarryOut.toString() }
            },
            {
              id: "mul-wrong-digit-2",
              label: `${(expectedDigitResult + 2) % 10} (Sobe ${expectedCarryOut})`,
              isCorrect: false,
              value: { result: ((expectedDigitResult + 2) % 10).toString(), carry: expectedCarryOut.toString() }
            }
          ];
        } else {
          opts = [
            {
              id: "mul-correct",
              label: `${expectedDigitResult}`,
              isCorrect: true,
              value: { result: expectedDigitResult.toString(), carry: "0" }
            },
            {
              id: "mul-wrong-digit-1",
              label: `${(expectedDigitResult + 1) % 10}`,
              isCorrect: false,
              value: { result: ((expectedDigitResult + 1) % 10).toString(), carry: "0" }
            },
            {
              id: "mul-wrong-digit-2",
              label: `${(expectedDigitResult + 2) % 10}`,
              isCorrect: false,
              value: { result: ((expectedDigitResult + 2) % 10).toString(), carry: "0" }
            }
          ];
        }

        setCurrentOptions(shuffleArray(uniqueOptions(opts)));
      }
    }
  }, [activeColumn, gameStage, borrowedFrom, hasExtraTen, opType, num1, num2, mulStep, gridMulRow1, gridMulRow2]);

  // Initialize selected preset
  const handleStartPreset = (preset: OperationPreset) => {
    setSelectedPreset(preset);
    setNum1(preset.num1);
    setNum2(preset.num2);
    setOpType(preset.type);
    initGameGrid(preset.num1, preset.num2, preset.type);
  };

  const handleStartCustom = () => {
    setNum1(customNum1);
    setNum2(customNum2);
    setOpType(customType);
    initGameGrid(customNum1, customNum2, customType);
  };

  const initGameGrid = (n1: number, n2: number, type: OperationType) => {
    // Reset grids
    setGridRow1(["", "", "", ""]);
    setGridRow2(["", "", "", ""]);
    setGridOperator("");
    setGridResult(["", "", "", ""]);
    setGridCarries(["", "", "", ""]);
    setBorrowedFrom([false, false, false, false]);
    setOriginalValues(["", "", "", ""]);
    setBorrowedValue(["", "", "", ""]);
    setHasExtraTen([false, false, false, false]);
    setSetupErrors({});
    setSolvingErrors({});
    setDivStepIndex(0);
    setDivSteps([]);
    setMulStep("PARTIAL1");
    setGridMulRow1(["", "", "", ""]);
    setGridMulRow2(["", "", "", ""]);
    
    if (type === "DIV") {
      setGameStage("SOLVING");
      const steps = generateDivisionSteps(n1, n2);
      setDivSteps(steps);
      setDivStepIndex(0);
      setTutorMessage(steps[0].message);
      setCurrentOptions(shuffleArray(steps[0].options));
      return;
    }

    // Set stage to SETUP
    setGameStage("SETUP");
    setActiveColumn(3); // Start with units

    let opSymbol = "";
    if (type === "ADD") opSymbol = "mais (+)";
    else if (type === "SUB") opSymbol = "menos (-)";
    else if (type === "MUL") opSymbol = "vezes (×)";
    else if (type === "DIV") opSymbol = "dividido por (÷)";

    const expectedOperator = type === "ADD" ? "+" : type === "SUB" ? "-" : type === "MUL" ? "×" : "÷";

    setTutorMessage(
      `Vamos treinar a montagem da conta! O desafio é armar a operação **${n1} ${expectedOperator} ${n2}**.\n\nEscreva cada algarismo do primeiro número (dividendo/cima) na primeira linha do quadro quadriculado, e o segundo número (divisor/baixo) na linha de baixo.\n\n**Muito importante:** Alinhe os números corretamente à direita! Unidades na coluna **U**, dezenas na coluna **D**, centenas na coluna **C**.\n\nNão esqueça de colocar o sinal **${expectedOperator}** na célula do operador à esquerda!`
    );
  };

  // Check setup
  const handleVerifySetup = () => {
    const r1 = [...gridRow1];
    const r2 = [...gridRow2];
    const op = gridOperator;

    // We expect numbers to be aligned correctly to the right (Units, Tens, Hundreds, Thousands)
    const n1Str = num1.toString();
    const n2Str = num2.toString();

    const expectedRow1 = ["", "", "", ""];
    const expectedRow2 = ["", "", "", ""];

    // Populate expected rows from right to left
    for (let i = 0; i < n1Str.length; i++) {
      expectedRow1[3 - i] = n1Str[n1Str.length - 1 - i];
    }
    for (let i = 0; i < n2Str.length; i++) {
      expectedRow2[3 - i] = n2Str[n2Str.length - 1 - i];
    }

    const expectedOperator = opType === "ADD" ? "+" : opType === "SUB" ? "-" : opType === "MUL" ? "×" : "÷";

    const errorsRow1 = r1.map((val, idx) => val !== expectedRow1[idx]);
    const errorsRow2 = r2.map((val, idx) => val !== expectedRow2[idx]);
    
    let errorOperator = op !== expectedOperator;
    if (opType === "MUL") {
      const allowedMulOperators = ["×", "x", "X", "*"];
      errorOperator = !allowedMulOperators.includes(op);
    }

    const hasErrors = errorsRow1.some(e => e) || errorsRow2.some(e => e) || errorOperator;

    if (hasErrors) {
      setSetupErrors({
        row1: errorsRow1,
        row2: errorsRow2,
        operator: errorOperator
      });

      // Analyze where they went wrong
      if (errorOperator) {
        setTutorMessage(
          opType === "MUL"
            ? `Opa! O operador que você escolheu está incorreto ou está faltando. Para esta multiplicação, use o sinal **×**, **x** ou **\***.`
            : `Opa! O operador que você escolheu está incorreto ou está faltando. Para esta conta, use o sinal **${expectedOperator}**.`
        );
      } else {
        setTutorMessage(
          `Atenção na montagem! Lembre-se que devemos alinhar os algarismos à direita. O dividendo **${num1}** deve ter as unidades na coluna **U**, dezenas na **D** e centenas na **C**.\n\nVeja as células marcadas em vermelho e corrija o posicionamento dos algarismos!`
        );
      }
    } else {
      setSetupErrors({});
      setGameStage("SOLVING");
      
      if (opType === "DIV") {
        const steps = generateDivisionSteps(num1, num2);
        setDivSteps(steps);
        setDivStepIndex(0);
        setTutorMessage(steps[0].message);
        setCurrentOptions(shuffleArray(steps[0].options));
        
        const firstCol = expectedRow1.findIndex(digit => digit !== "");
        setActiveColumn(firstCol >= 0 ? firstCol : 2);
        return;
      }

      setActiveColumn(3); // Start with Units column
      
      let nextInstruction = "";
      if (opType === "ADD") {
        nextInstruction = `**Excelente trabalho! A conta está armada com perfeita simetria.** 🌟\n\nAgora vamos resolver coluna por coluna, começando sempre da direita para a esquerda: das **Unidades (U)** para as Centenas.\n\nNa coluna das **Unidades**, some os algarismos: **${expectedRow1[3]} + ${expectedRow2[3]}**.\n\nQual é o resultado? Se passar de 9, coloque apenas a unidade no resultado e o valor que 'vai um' no círculo cinza lá em cima da coluna das Dezenas (D)!`;
      } else if (opType === "SUB") {
        const u1 = parseInt(expectedRow1[3]);
        const u2 = parseInt(expectedRow2[3]);
        if (u1 < u2) {
          nextInstruction = `**Excelente! Conta montada com sucesso.** 👏\n\nAgora vamos subtrair a coluna das **Unidades (U)**: **${u1} - ${u2}**.\n\nHum, espere! O número **${u1}** é menor que **${u2}**, então não podemos subtrair diretamente. \n\nPrecisamos **pegar emprestado** da coluna das Dezenas! Clique no botão de tesoura ✂️ ao lado da coluna das Dezenas para emprestar 1 dezena para as unidades!`;
        } else {
          nextInstruction = `**Excelente! Conta montada com sucesso.** 👏\n\nVamos começar resolvendo a coluna das **Unidades (U)**: **${u1} - ${u2}**. \n\nQual é o resultado dessa subtração? Escreva na célula de resultado!`;
        }
      } else { // MUL
        if (num2 >= 10) {
          setGridMulRow1(["", "", "", ""]);
          setGridMulRow2(["", "", "", "+"]);
          setMulStep("PARTIAL1");
          nextInstruction = `**Excelente trabalho! A conta está armada com perfeita simetria.** 🌟\n\nComo o multiplicador de baixo (**${num2}**) possui 2 algarismos, vamos resolver em etapas:\n\n1) Multiplicar as **Unidades** (**${num2 % 10}**) por todos os números de cima.\n2) Multiplicar as **Dezenas** (**${Math.floor(num2 / 10)}**) por todos os de cima (colocando um **+** nas Unidades da segunda linha para pular uma casa).\n3) Somar as duas parcelas no final!\n\nVamos começar! Calcule: **${num2 % 10} × ${expectedRow1[3] || 0}**.`;
        } else {
          nextInstruction = `**Maravilha! Conta armada perfeitamente.** ⚡\n\nAgora vamos multiplicar o número de baixo por cada algarismo de cima, começando das **Unidades (U)**.\n\nCalcule: **${num2} × ${expectedRow1[3] || 0}**.\n\nEscreva o resultado na célula correspondente das Unidades! Se o resultado tiver dois dígitos, mande a dezena para o balãozinho 'vai um' acima da coluna das Dezenas (D)!`;
        }
      }

      setTutorMessage(nextInstruction);
    }
  };

  // Borrowing logic for subtraction
  const handleBorrow = (fromColIdx: number) => {
    // We want to borrow from fromColIdx (e.g., 2 = Tens) to fromColIdx + 1 (e.g., 3 = Units)
    const targetColIdx = fromColIdx + 1;
    
    const valAtFromStr = gridRow1[fromColIdx];
    if (!valAtFromStr || valAtFromStr === "0") {
      // If borrowing from 0, need to borrow from even further left first!
      if (fromColIdx === 2 && gridRow1[1] && gridRow1[1] !== "0") {
        setTutorMessage(
          `Como a coluna das Dezenas (D) é **0**, você não pode pegar emprestado dela diretamente! \n\nPrimeiro, você deve pegar emprestado da coluna das **Centenas (C)** para a coluna das **Dezenas (D)**! Clique no botão de empréstimo ✂️ na coluna das Centenas.`
        );
      } else {
        setTutorMessage(`Não há algarismos suficientes na coluna à esquerda para pegar emprestado!`);
      }
      return;
    }

    const valAtFrom = parseInt(valAtFromStr);
    const newValAtFrom = valAtFrom - 1;

    // Update borrowed arrays
    const newBorrowed = [...borrowedFrom];
    newBorrowed[fromColIdx] = true;
    setBorrowedFrom(newBorrowed);

    const newOriginals = [...originalValues];
    newOriginals[fromColIdx] = valAtFromStr;
    setOriginalValues(newOriginals);

    const newBorrowedVals = [...borrowedValue];
    newBorrowedVals[fromColIdx] = newValAtFrom.toString();
    setBorrowedValue(newBorrowedVals);

    // Apply the extra ten to the receiving column
    const newHasExtraTen = [...hasExtraTen];
    newHasExtraTen[targetColIdx] = true;
    setHasExtraTen(newHasExtraTen);

    // Update the actual value on the grid row representation so we can calculate with it
    const updatedRow1 = [...gridRow1];
    updatedRow1[fromColIdx] = newValAtFrom.toString();
    setGridRow1(updatedRow1);

    setTutorMessage(
      `**Isso aí! Você pegou emprestado com sucesso!** ✂️\n\nO número **${valAtFromStr}** na coluna da esquerda foi riscado e agora vale **${newValAtFrom}**.\n\nA coluna atual recebeu 10 unidades e agora tem um **1** posicionado na frente, somando com o valor que já estava lá.\n\nAgora você pode resolver essa coluna! Faça o cálculo e coloque o resultado na célula correspondente.`
    );
  };

  // Multiple choice selection handler
  const handleSelectOption = (opt: OptionItem) => {
    if (opType === "DIV") {
      if (opt.isCorrect) {
        setSelectedOptionId(opt.id);
        
        // Fill result cell if colIdx is specified
        if (opt.value && opt.value.colIdx !== undefined) {
          const copyRes = [...gridResult];
          copyRes[opt.value.colIdx] = opt.value.result;
          setGridResult(copyRes);
        }

        setTimeout(() => {
          const nextIdx = divStepIndex + 1;
          if (nextIdx < divSteps.length) {
            setDivStepIndex(nextIdx);
            setTutorMessage(divSteps[nextIdx].message);
            setCurrentOptions(shuffleArray(divSteps[nextIdx].options));
            setSelectedOptionId(null);
            setWrongOptions([]);
            
            // Highlight current digit column
            const currentStep = divSteps[nextIdx];
            if (currentStep.type === "DIVIDE" && currentStep.options[0]?.value?.colIdx !== undefined) {
              setActiveColumn(currentStep.options[0].value.colIdx);
            }
          } else {
            setGameStage("COMPLETED");
            const finalRemainder = num1 % num2;
            setTutorMessage(
              `🏆 **PARABÉNS! VOCÊ DOMINOU A DIVISÃO ESCOLAR PASSO A PASSO!** 🏆\n\n` +
              `O resultado de **${num1} ÷ ${num2}** é **${Math.floor(num1 / num2)}**${finalRemainder > 0 ? ` com resto **${finalRemainder}**` : " de forma exata (resto 0)"}.\n\n` +
              `Você aprendeu a agrupar parcelas, estimar o quociente por tabuadas e subtrair restos de forma perfeita! Continue brilhando!`
            );
          }
        }, 1200);
      } else {
        setWrongOptions(prev => [...prev, opt.id]);
        if (opt.feedback) {
          setTutorMessage(opt.feedback);
        } else {
          setTutorMessage(`Ops! Essa não é a resposta certa para esta etapa. Dê uma olhada no cálculo e tente novamente!`);
        }
      }
      return;
    }

    if (opt.isCorrect) {
      setSelectedOptionId(opt.id);
      
      // Update the board inputs automatically with the correct values
      if (opt.value.borrow) {
        // Trigger borrow action
        handleBorrow(activeColumn - 1);
      } else {
        if (opType === "MUL" && num2 >= 10) {
          if (mulStep === "PARTIAL1") {
            const copy = [...gridMulRow1];
            copy[activeColumn] = opt.value.result;
            setGridMulRow1(copy);
          } else if (mulStep === "PARTIAL2") {
            const copy = [...gridMulRow2];
            copy[activeColumn] = opt.value.result;
            setGridMulRow2(copy);
          } else {
            const copy = [...gridResult];
            copy[activeColumn] = opt.value.result;
            setGridResult(copy);
          }
        } else {
          // Fill result cell
          const copyRes = [...gridResult];
          copyRes[activeColumn] = opt.value.result;
          setGridResult(copyRes);
        }

        // Fill carry-over if available
        if (opt.value.carry !== undefined && activeColumn > 0) {
          const copyCarries = [...gridCarries];
          const carryVal = parseInt(opt.value.carry) || 0;
          copyCarries[activeColumn - 1] = carryVal > 0 ? opt.value.carry : "";
          setGridCarries(copyCarries);
        }
      }

      // Automatically verify after 1.2 seconds so students can see their correct choice reflected
      setTimeout(() => {
        if (opt.value.borrow) {
          // Borrowing handled, wait for next step
        } else {
          handleVerifyColumn();
        }
      }, 1200);

    } else {
      setWrongOptions(prev => [...prev, opt.id]);
      
      // Give custom feedback from the Tutor based on the wrong option chosen
      if (opType === "ADD") {
        setTutorMessage(
          `Ops! Essa opção não está correta. Lembre-se de somar com calma:\n\n` + 
          `Dígito de cima + Dígito de baixo + Sobe (se houver).\n\nTente outra alternativa!`
        );
      } else if (opType === "SUB") {
        if (opt.id.includes("borrow")) {
          setTutorMessage(
            `Hum, não é bem assim! Como o número de cima é menor que o de baixo, você realmente precisa pegar emprestado da esquerda primeiro. Não podemos fazer contas diretas invertidas ou pular colunas!\n\nSelecione a opção de pegar emprestado.`
          );
        } else {
          setTutorMessage(
            `O valor subtraído para essa coluna não está correto. Faça a conta novamente subtraindo o número de baixo do valor updated de cima.\n\nTente outra alternativa!`
          );
        }
      } else if (opType === "MUL") {
        if (num2 >= 10) {
          if (mulStep === "PARTIAL1") {
            setTutorMessage(
              `Ops! O resultado da multiplicação por unidade está incorreto.\n\nMultiplique as unidades de baixo (**${num2 % 10}**) pelo dígito correspondente de cima e adicione o valor que subiu (se houver).\n\nTente outra opção!`
            );
          } else if (mulStep === "PARTIAL2") {
            setTutorMessage(
              `Hum! O resultado da multiplicação por dezena está incorreto.\n\nMultiplique as dezenas de baixo (**${Math.floor(num2 / 10)}**) pelo dígito de cima (lembre-se do alinhamento) e adicione o 'vai um' se houver.\n\nTente outra opção!`
            );
          } else {
            setTutorMessage(
              `Cuidado! A soma final das parcelas desta coluna não está correta.\n\nSome o dígito da primeira parcela com o da segunda parcela e some o 'vai um' que subiu (se houver).\n\nTente outra opção!`
            );
          }
        } else {
          setTutorMessage(
            `Cuidado! Esse resultado de multiplicação está incorreto. Multiplique o número de baixo pelo dígito de cima e adicione o valor que subiu (se houver).\n\nTente outra alternativa!`
          );
        }
      }
    }
  };

  // Verify a solving step (column by column)
  const handleVerifyColumn = () => {
    const expectedRow1 = ["", "", "", ""];
    const expectedRow2 = ["", "", "", ""];
    const n1Str = num1.toString();
    const n2Str = num2.toString();

    for (let i = 0; i < n1Str.length; i++) {
      expectedRow1[3 - i] = n1Str[n1Str.length - 1 - i];
    }
    for (let i = 0; i < n2Str.length; i++) {
      expectedRow2[3 - i] = n2Str[n2Str.length - 1 - i];
    }

    // Solve based on operation type
    if (opType === "ADD") {
      // Step by step verification for ADDITION
      const colIdx = activeColumn; // 3 (Units), 2 (Tens), 1 (Hundreds), 0 (Thousands)
      
      const digit1 = parseInt(expectedRow1[colIdx] || "0");
      const digit2 = parseInt(expectedRow2[colIdx] || "0");
      const carryIn = parseInt(gridCarries[colIdx] || "0");

      const colSum = digit1 + digit2 + carryIn;
      const expectedDigitResult = colSum % 10;
      const expectedCarryOut = Math.floor(colSum / 10);

      const studentResult = parseInt(gridResult[colIdx] || "");
      const studentCarryOut = parseInt(gridCarries[colIdx - 1] || "0");

      const isResultCorrect = studentResult === expectedDigitResult;
      const isCarryCorrect = colIdx === 0 ? true : studentCarryOut === expectedCarryOut;

      if (!isResultCorrect || !isCarryCorrect) {
        // Highlight errors
        const newResErrors = [...(solvingErrors.result || [false, false, false, false])];
        const newCarryErrors = [...(solvingErrors.carries || [false, false, false, false])];
        newResErrors[colIdx] = !isResultCorrect;
        if (colIdx > 0) newCarryErrors[colIdx - 1] = !isCarryCorrect;

        setSolvingErrors({
          result: newResErrors,
          carries: newCarryErrors
        });

        if (!isResultCorrect) {
          setTutorMessage(
            `A soma da coluna não está correta. Calcule novamente: **${digit1} (cima) + ${digit2} (baixo)${carryIn > 0 ? ` + ${carryIn} (que subiu)` : ""}**.`
          );
        } else {
          setTutorMessage(
            `O resultado da coluna está certo (${studentResult}), mas você esqueceu de subir o valor ('vai um') para a coluna à esquerda! Como a soma foi **${colSum}**, você deve colocar **${expectedCarryOut}** no balãozinho acima da coluna da esquerda.`
          );
        }
      } else {
        // Success for this column!
        setSolvingErrors({});
        
        if (colIdx > 0) {
          const nextCol = colIdx - 1;
          setActiveColumn(nextCol);
          
          const nextD1 = expectedRow1[nextCol];
          const nextD2 = expectedRow2[nextCol];
          
          if (!nextD1 && !nextD2 && expectedCarryOut === 0) {
            // No more columns to solve
            setGameStage("COMPLETED");
            setTutorMessage(
              `🏆 **PARABÉNS! VOCÊ MONTOU E RESOLVEU A OPERAÇÃO COM SUCESSO!** 🏆\n\nO resultado de **${num1} + ${num2}** é **${num1 + num2}**.\n\nVocê dominou as técnicas de alinhamento por casas decimais e o transporte de valores com o 'vai um'. Excelente trabalho pedagógico!`
            );
          } else {
            setTutorMessage(
              `**Excelente! Coluna resolvida com precisão.** 👏\n\nAgora passamos para a coluna das **${nextCol === 2 ? "Dezenas (D)" : "Centenas (C)"}**.\n\nSome os dígitos: **${nextD1 || 0} + ${nextD2 || 0}**${expectedCarryOut > 0 ? ` e lembre de adicionar o **${expectedCarryOut}** que veio da coluna anterior` : ""}.\n\nQual é o resultado?`
            );
          }
        } else {
          // Solved everything
          setGameStage("COMPLETED");
          setTutorMessage(
            `🏆 **PARABÉNS! VOCÊ MONTOU E RESOLVEU A OPERAÇÃO COM SUCESSO!** 🏆\n\nO resultado de **${num1} + ${num2}** é **${num1 + num2}**.\n\nSua organização e raciocínio matemático estão brilhantes!`
          );
        }
      }
    } 
    
    else if (opType === "SUB") {
      // Step by step verification for SUBTRACTION
      const colIdx = activeColumn;
      
      const originalD1 = parseInt(expectedRow1[colIdx] || "0");
      // Note: gridRow1 contains the updated digit if borrowed
      const actualD1 = parseInt(gridRow1[colIdx] || "0");
      const d2 = parseInt(expectedRow2[colIdx] || "0");

      // Calculate correct column result
      // If we borrowed, we added 10 to our current column
      let computedD1 = actualD1;
      if (hasExtraTen[colIdx]) {
        computedD1 = actualD1 + 10;
      }

      const expectedResult = computedD1 - d2;
      const studentResult = parseInt(gridResult[colIdx] || "");

      const isCorrect = studentResult === expectedResult;

      if (!isCorrect) {
        const newResErrors = [...(solvingErrors.result || [false, false, false, false])];
        newResErrors[colIdx] = true;
        setSolvingErrors({ result: newResErrors });

        if (computedD1 < d2) {
          setTutorMessage(
            `Atenção! Você tentou fazer a subtração, mas **${computedD1}** ainda é menor que **${d2}**! \n\nVocê precisa **pegar emprestado** da coluna da esquerda primeiro usando o botão de tesoura ✂️.`
          );
        } else {
          setTutorMessage(
            `O cálculo da subtração está incorreto para esta coluna. Faça a conta novamente: **${computedD1} - ${d2}**.`
          );
        }
      } else {
        setSolvingErrors({});
        
        if (colIdx > 0) {
          const nextCol = colIdx - 1;
          const nextD1Str = gridRow1[nextCol];
          const nextD2Str = expectedRow2[nextCol];

          if (!nextD1Str && !nextD2Str) {
            // Completed
            setGameStage("COMPLETED");
            setTutorMessage(
              `🏆 **SENSACIONAL! VOCÊ DOMINOU A SUBTRAÇÃO COM EMPRÉSTIMO!** 🏆\n\nO resultado final de **${num1} - ${num2}** é **${num1 - num2}**.\n\nVocê aprendeu como funciona o sistema posicional decimal na prática, trocando dezenas por unidades para realizar contas complexas. Ótimo trabalho!`
            );
          } else {
            setActiveColumn(nextCol);
            const nextD1 = parseInt(nextD1Str || "0");
            const nextD2 = parseInt(nextD2Str || "0");

            if (nextD1 < nextD2) {
              setTutorMessage(
                `**Muito bem! Coluna das Unidades resolvida.** 👏\n\nAgora vamos para a coluna das **${nextCol === 2 ? "Dezenas (D)" : "Centenas (C)"}**.\n\nO dígito atual de cima vale **${nextD1}** e o de baixo é **${nextD2}**.\n\nComo **${nextD1} < ${nextD2}**, você precisará pegar emprestado da coluna à esquerda! Clique na tesoura ✂️ correspondente para realizar o empréstimo.`
              );
            } else {
              setTutorMessage(
                `**Muito bem! Coluna resolvida com sucesso.** 👏\n\nAgora vamos para a coluna das **${nextCol === 2 ? "Dezenas (D)" : "Centenas (C)"}**.\n\nCalcule: **${nextD1} - ${nextD2}**.`
              );
            }
          }
        } else {
          setGameStage("COMPLETED");
          setTutorMessage(
            `🏆 **SENSACIONAL! VOCÊ DOMINOU A SUBTRAÇÃO COM EMPRÉSTIMO!** 🏆\n\nO resultado final de **${num1} - ${num2}** é **${num1 - num2}**.\n\nExcelente aplicação de metodologias ativas!`
          );
        }
      }
    } 
    
    else if (opType === "MUL") {
      if (num2 >= 10) {
        if (mulStep === "PARTIAL1") {
          const colIdx = activeColumn;
          const digit1 = parseInt(expectedRow1[colIdx] || "0");
          const multiplier = num2 % 10;
          const carryIn = parseInt(gridCarries[colIdx] || "0");

          const product = (digit1 * multiplier) + carryIn;
          const expectedDigitResult = product % 10;
          const expectedCarryOut = Math.floor(product / 10);

          const studentResult = parseInt(gridMulRow1[colIdx] || "");
          const studentCarryOut = parseInt(gridCarries[colIdx - 1] || "0");

          const isResultCorrect = studentResult === expectedDigitResult;
          const isCarryCorrect = colIdx === 0 ? true : studentCarryOut === expectedCarryOut;

          if (!isResultCorrect || !isCarryCorrect) {
            const newResErrors = [...(solvingErrors.result || [false, false, false, false])];
            const newCarryErrors = [...(solvingErrors.carries || [false, false, false, false])];
            newResErrors[colIdx] = !isResultCorrect;
            if (colIdx > 0) newCarryErrors[colIdx - 1] = !isCarryCorrect;

            setSolvingErrors({
              result: newResErrors,
              carries: newCarryErrors
            });

            if (!isResultCorrect) {
              setTutorMessage(
                `O cálculo da primeira parcela (unidades) não está correto. Calcule novamente: **${multiplier} × ${digit1}${carryIn > 0 ? ` + ${carryIn} (que subiu)` : ""}**.`
              );
            } else {
              setTutorMessage(
                `O algarismo do resultado está certo (${studentResult}), mas você esqueceu de colocar o transporte correspondente de **${expectedCarryOut}** na coluna da esquerda! Preencha o balãozinho acima da coluna da esquerda.`
              );
            }
          } else {
            setSolvingErrors({});
            const nextCol = colIdx - 1;
            const nextD1 = expectedRow1[nextCol];

            if (nextCol < 0 || (!nextD1 && expectedCarryOut === 0)) {
              setMulStep("PARTIAL2");
              setActiveColumn(2); // Tens column of gridMulRow2
              setGridCarries(["", "", "", ""]); // clear carries for tens multiplication
              setTutorMessage(
                `**Excelente! Primeira parcela (multiplicação por ${multiplier}) concluída com sucesso.** 👏\n\nAgora vamos multiplicar o algarismo das **Dezenas** de baixo (**${Math.floor(num2 / 10)}**) por todos os algarismos de cima.\n\nLembra que pulamos a coluna das Unidades? Já colocamos um sinal **+** nela de forma automática!\n\nComece multiplicando pelas **Unidades**: **${Math.floor(num2 / 10)} × ${expectedRow1[3] || 0}**. Escreva o resultado na coluna das Dezenas (D)!`
              );
            } else if (!nextD1 && expectedCarryOut > 0) {
              setActiveColumn(nextCol);
              setTutorMessage(
                `**Excelente!** Agora temos o número **${expectedCarryOut}** que subiu na última coluna de multiplicação.\n\nComo não há mais números para multiplicar à esquerda, basta descer o **${expectedCarryOut}** diretamente para a primeira parcela da coluna das **${nextCol === 2 ? "Dezenas" : nextCol === 1 ? "Centenas" : "Milhar"}**!`
              );
            } else {
              setActiveColumn(nextCol);
              setTutorMessage(
                `**Sensacional! Multiplicação exata.** 👏\n\nAgora multiplicamos o próximo algarismo à esquerda nas **${nextCol === 2 ? "Dezenas" : "Centenas"}**:\n\nCalcule: **${multiplier} × ${nextD1}**${expectedCarryOut > 0 ? ` e adicione o **${expectedCarryOut}** que subiu` : ""}.\n\nQual é o resultado?`
              );
            }
          }
        } else if (mulStep === "PARTIAL2") {
          const colIdx = activeColumn;
          const multiplier = Math.floor(num2 / 10);
          const topDigitCol = colIdx + 1;
          const digit1 = parseInt(expectedRow1[topDigitCol] || "0");
          const carryIn = parseInt(gridCarries[colIdx] || "0");

          const product = (digit1 * multiplier) + carryIn;
          const expectedDigitResult = product % 10;
          const expectedCarryOut = Math.floor(product / 10);

          const studentResult = parseInt(gridMulRow2[colIdx] || "");
          const studentCarryOut = parseInt(gridCarries[colIdx - 1] || "0");

          const isResultCorrect = studentResult === expectedDigitResult;
          const isCarryCorrect = colIdx === 0 ? true : studentCarryOut === expectedCarryOut;

          if (!isResultCorrect || !isCarryCorrect) {
            const newResErrors = [...(solvingErrors.result || [false, false, false, false])];
            const newCarryErrors = [...(solvingErrors.carries || [false, false, false, false])];
            newResErrors[colIdx] = !isResultCorrect;
            if (colIdx > 0) newCarryErrors[colIdx - 1] = !isCarryCorrect;

            setSolvingErrors({
              result: newResErrors,
              carries: newCarryErrors
            });

            if (!isResultCorrect) {
              setTutorMessage(
                `O cálculo da segunda parcela (dezenas) não está correto. Calcule novamente: **${multiplier} × ${digit1}${carryIn > 0 ? ` + ${carryIn} (que subiu)` : ""}**.`
              );
            } else {
              setTutorMessage(
                `O algarismo da segunda parcela está correto (${studentResult}), mas você esqueceu de colocar o transporte correspondente de **${expectedCarryOut}** no balãozinho! Preencha-o na coluna da esquerda.`
              );
            }
          } else {
            setSolvingErrors({});
            const nextCol = colIdx - 1;
            const nextTopD1 = expectedRow1[nextCol + 1];

            if (nextCol < 0 || (!nextTopD1 && expectedCarryOut === 0)) {
              setMulStep("ADDITION");
              setActiveColumn(3); // Start adding from rightmost Units column
              setGridCarries(["", "", "", ""]); // clear carries for addition
              setTutorMessage(
                `**Maravilhoso! As duas parcelas da multiplicação foram geradas perfeitamente!** ⚡\n\nAgora temos:\n1ª Parcela (Unidades): **${parseInt(gridMulRow1.join(""))}**\n2ª Parcela (Dezenas): **${parseInt(gridMulRow2.join("").replace("+", "0"))}**\n\nVamos somar as duas parcelas coluna por coluna, começando das **Unidades (U)**: **${gridMulRow1[3] || 0} + ${gridMulRow2[3] || 0}**.`
              );
            } else if (!nextTopD1 && expectedCarryOut > 0) {
              setActiveColumn(nextCol);
              setTutorMessage(
                `**Excelente!** Agora temos o número **${expectedCarryOut}** que subiu na última coluna de multiplicação.\n\nComo não há mais números para multiplicar à esquerda, basta descer o **${expectedCarryOut}** diretamente para a segunda parcela da coluna das **${nextCol === 1 ? "Centenas" : "Milhares"}**!`
              );
            } else {
              setActiveColumn(nextCol);
              setTutorMessage(
                `**Muito bem!** Agora multiplicamos o próximo dígito à esquerda:\n\nCalcule: **${multiplier} × ${expectedRow1[nextCol + 1]}**${expectedCarryOut > 0 ? ` e adicione o **${expectedCarryOut}** que subiu` : ""}.\n\nQual é o resultado?`
              );
            }
          }
        } else if (mulStep === "ADDITION") {
          const colIdx = activeColumn;
          const digit1 = parseInt(gridMulRow1[colIdx] || "0");
          const val2Raw = gridMulRow2[colIdx] || "0";
          const digit2 = val2Raw === "+" ? 0 : parseInt(val2Raw || "0");
          const carryIn = parseInt(gridCarries[colIdx] || "0");

          const colSum = digit1 + digit2 + carryIn;
          const expectedDigitResult = colSum % 10;
          const expectedCarryOut = Math.floor(colSum / 10);

          const studentResult = parseInt(gridResult[colIdx] || "");
          const studentCarryOut = parseInt(gridCarries[colIdx - 1] || "0");

          const isResultCorrect = studentResult === expectedDigitResult;
          const isCarryCorrect = colIdx === 0 ? true : studentCarryOut === expectedCarryOut;

          if (!isResultCorrect || !isCarryCorrect) {
            const newResErrors = [...(solvingErrors.result || [false, false, false, false])];
            const newCarryErrors = [...(solvingErrors.carries || [false, false, false, false])];
            newResErrors[colIdx] = !isResultCorrect;
            if (colIdx > 0) newCarryErrors[colIdx - 1] = !isCarryCorrect;

            setSolvingErrors({
              result: newResErrors,
              carries: newCarryErrors
            });

            if (!isResultCorrect) {
              setTutorMessage(
                `A soma desta coluna está incorreta. Some com cuidado: **${digit1} + ${digit2}${carryIn > 0 ? ` + ${carryIn} (que subiu)` : ""}**.`
              );
            } else {
              setTutorMessage(
                `O valor da soma está correto (${studentResult}), mas você esqueceu de colocar o transporte correspondente de **${expectedCarryOut}** no balãozinho 'vai um' da coluna à esquerda!`
              );
            }
          } else {
            setSolvingErrors({});
            const nextCol = colIdx - 1;
            const nextD1Val = gridMulRow1[nextCol];
            const nextD2Val = gridMulRow2[nextCol];

            if (nextCol < 0 || (!nextD1Val && !nextD2Val && expectedCarryOut === 0)) {
              setGameStage("COMPLETED");
              setTutorMessage(
                `🏆 **PARABÉNS! VOCÊ DOMINOU A MULTIPLICAÇÃO COM DOIS MULTIPLICADORES!** 🏆\n\nO resultado de **${num1} × ${num2}** é **${num1 * num2}**.\n\nVocê realizou as multiplicações parciais, pulou a casa decimal corretamente e somou tudo com precisão brilhante!`
              );
            } else if (!nextD1Val && !nextD2Val && expectedCarryOut > 0) {
              setActiveColumn(nextCol);
              setTutorMessage(
                `**Perfeito!** Agora coloque o **${expectedCarryOut}** que sobrou da soma diretamente na célula da coluna da esquerda!`
              );
            } else {
              setActiveColumn(nextCol);
              const nextDigit2 = nextD2Val === "+" ? 0 : parseInt(nextD2Val || "0");
              setTutorMessage(
                `**Excelente!** Agora vamos somar a coluna das **${nextCol === 2 ? "Dezenas (D)" : nextCol === 1 ? "Centenas (C)" : "Milhares (M)"}**:\n\nSome: **${nextD1Val || 0} + ${nextDigit2}**${expectedCarryOut > 0 ? ` e adicione o **${expectedCarryOut}** que veio da coluna anterior` : ""}.`
              );
            }
          }
        }
      } else {
        const colIdx = activeColumn;
        
        const digit1 = parseInt(expectedRow1[colIdx] || "0");
        const multiplier = num2;
        const carryIn = parseInt(gridCarries[colIdx] || "0");

        const product = (digit1 * multiplier) + carryIn;
        const expectedDigitResult = product % 10;
        const expectedCarryOut = Math.floor(product / 10);

        const studentResult = parseInt(gridResult[colIdx] || "");
        const studentCarryOut = parseInt(gridCarries[colIdx - 1] || "0");

        const isResultCorrect = studentResult === expectedDigitResult;
        const isCarryCorrect = colIdx === 0 ? true : studentCarryOut === expectedCarryOut;

        if (!isResultCorrect || !isCarryCorrect) {
          const newResErrors = [...(solvingErrors.result || [false, false, false, false])];
          const newCarryErrors = [...(solvingErrors.carries || [false, false, false, false])];
          newResErrors[colIdx] = !isResultCorrect;
          if (colIdx > 0) newCarryErrors[colIdx - 1] = !isCarryCorrect;

          setSolvingErrors({
            result: newResErrors,
            carries: newCarryErrors
          });

          if (!isResultCorrect) {
            setTutorMessage(
              `O cálculo da multiplicação não está correto. Calcule novamente: **${multiplier} × ${digit1}${carryIn > 0 ? ` + ${carryIn} (que subiu)` : ""}**.`
            );
          } else {
            setTutorMessage(
              `O algarismo do resultado está certo (${studentResult}), mas você esqueceu de colocar o transporte correspondente de **${expectedCarryOut}** na coluna da esquerda! Preencha o balãozinho acima da coluna da esquerda.`
            );
          }
        } else {
          setSolvingErrors({});
          
          if (colIdx > 0) {
            const nextCol = colIdx - 1;
            const nextD1 = expectedRow1[nextCol];

            if (!nextD1 && expectedCarryOut === 0) {
              setGameStage("COMPLETED");
              setTutorMessage(
                `🏆 **PARABÉNS! VOCÊ DOMINOU A MULTIPLICAÇÃO COM TRANSPORTE!** 🏆\n\nO resultado de **${num1} × ${num2}** é **${num1 * num2}**.\n\nArmar e realizar a conta passo a passo ajuda a consolidar o raciocínio matemático. Você fez um trabalho magnífico!`
              );
            } else if (!nextD1 && expectedCarryOut > 0) {
              setActiveColumn(nextCol);
              setTutorMessage(
                `**Excelente!** Agora temos o número **${expectedCarryOut}** que subiu na última coluna.\n\nComo não há mais números para multiplicar à esquerda, basta descer o **${expectedCarryOut}** diretamente para a célula de resultado da coluna das **${nextCol === 2 ? "Dezenas" : nextCol === 1 ? "Centenas" : "Milhar"}**!`
              );
            } else {
              setActiveColumn(nextCol);
              setTutorMessage(
                `**Sensacional! Multiplicação exata.** 👏\n\nAgora multiplicamos o próximo algarismo à esquerda nas **${nextCol === 2 ? "Dezenas" : "Centenas"}**:\n\nCalcule: **${multiplier} × ${nextD1}**${expectedCarryOut > 0 ? ` e adicione o **${expectedCarryOut}** que subiu` : ""}.\n\nQual é o resultado?`
              );
            }
          } else {
            setGameStage("COMPLETED");
            setTutorMessage(
              `🏆 **PARABÉNS! VOCÊ DOMINOU A MULTIPLICAÇÃO COM TRANSPORTE!** 🏆\n\nO resultado de **${num1} × ${num2}** é **${num1 * num2}**.\n\nVocê é um mestre da matemática!`
            );
          }
        }
      }
    }
  };

  const handleRestartSession = () => {
    if (selectedPreset) {
      handleStartPreset(selectedPreset);
    } else {
      handleStartCustom();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Back Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors cursor-pointer bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Menu Principal
        </button>

        <div className="flex items-center gap-2">
          <span className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <BookOpen className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-slate-700 bg-indigo-50 border border-indigo-100/50 px-3 py-1 rounded-full uppercase tracking-wider">
            Operações Básicas
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameStage === "SELECT" ? (
          <motion.div
            key="selection-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left: Interactive explanations */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold tracking-wider uppercase">
                  <Brain className="w-3.5 h-3.5 animate-pulse" />
                  Metodologia Prática
                </div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                  Aprenda a <span className="text-indigo-600 bg-indigo-50 px-3 py-0.5 rounded-2xl border border-indigo-100/50 inline-block">Armar e Resolver</span> Contas
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Muitos alunos erram contas de somar, subtrair ou multiplicar simplesmente por não alinharem os números de forma adequada (Unidade sob Unidade, Dezena sob Dezena). 
                </p>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Neste simulador de caderno quadriculado, você vai praticar a **montagem espacial das operações** e resolver passo a passo simulando o transporte ("vai um") ou empréstimo ("pegar emprestado") de forma totalmente interativa!
                </p>
              </div>

              {/* Guide card */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-3 shadow-inner">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Como Funciona o Desafio:
                </h4>
                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">1</span>
                    <p><strong>Escolha a Operação:</strong> Selecione um dos desafios pré-configurados ou crie uma conta personalizada de Adição, Subtração, Multiplicação ou Divisão.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">2</span>
                    <p><strong>Arme no Quadriculado:</strong> Digite cada dígito na sua respectiva coluna (Centena, Dezena, Unidade) alinhando as casas corretamente.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">3</span>
                    <p><strong>Resolva com Auxílio:</strong> Resolva coluna por coluna com dicas pedagógicas em tempo real do Capitão Matemática!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Presets and custom settings */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* SECTION 1: CUSTOM OPERATION CREATION */}
              <div className="bg-white border-2 border-indigo-100 rounded-3xl p-6 shadow-xl shadow-indigo-100/10 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <Plus className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                      Crie sua Própria Conta (Inserir Números)
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Digite os números que você deseja treinar e monte a operação no quadro quadriculado!
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      1. Escolha o Tipo de Operação:
                    </label>
                    <div className="grid grid-cols-4 gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomType("ADD");
                          setCustomNum1(385);
                          setCustomNum2(47);
                        }}
                        className={`py-2 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer ${
                          customType === "ADD" 
                            ? "bg-white text-emerald-700 shadow-sm border border-slate-100" 
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Soma (+)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomType("SUB");
                          setCustomNum1(243);
                          setCustomNum2(85);
                        }}
                        className={`py-2 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer ${
                          customType === "SUB" 
                            ? "bg-white text-blue-700 shadow-sm border border-slate-100" 
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Sub (-)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomType("MUL");
                          setCustomNum1(46);
                          setCustomNum2(8);
                        }}
                        className={`py-2 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer ${
                          customType === "MUL" 
                            ? "bg-white text-amber-700 shadow-sm border border-slate-100" 
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Mult (×)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomType("DIV");
                          setCustomNum1(246);
                          setCustomNum2(6);
                        }}
                        className={`py-2 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer ${
                          customType === "DIV" 
                            ? "bg-white text-indigo-700 shadow-sm border border-slate-100" 
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Div (÷)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-xs font-mono text-indigo-700 font-bold block">Primeiro Número (De 10 a 999)</span>
                      <input
                        type="number"
                        min={10}
                        max={999}
                        value={customNum1}
                        onChange={(e) => setCustomNum1(Math.max(10, Math.min(999, parseInt(e.target.value) || 10)))}
                        className="w-full text-center text-xl font-bold bg-white border border-slate-200 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      />
                    </div>

                    <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-xs font-mono text-indigo-700 font-bold block">
                        {customType === "DIV" 
                          ? "Segundo Número / Divisor (De 2 a 99)" 
                          : customType === "MUL" 
                            ? "Segundo Número / Multiplicador (De 2 a 99)" 
                            : "Segundo Número (De 10 a 999)"}
                      </span>
                      <input
                        type="number"
                        min={customType === "DIV" || customType === "MUL" ? 2 : 10}
                        max={customType === "DIV" || customType === "MUL" ? 99 : 999}
                        value={customNum2}
                        onChange={(e) => {
                          const minVal = customType === "DIV" || customType === "MUL" ? 2 : 10;
                          const maxVal = customType === "DIV" || customType === "MUL" ? 99 : 999;
                          setCustomNum2(Math.max(minVal, Math.min(maxVal, parseInt(e.target.value) || minVal)));
                        }}
                        className="w-full text-center text-xl font-bold bg-white border border-slate-200 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Verification check if Subtraction/Division is invalid */}
                  {customType === "SUB" && customNum1 < customNum2 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>O primeiro número precisa ser maior ou igual ao segundo para a subtração escolar!</span>
                    </div>
                  )}

                  {customType === "DIV" && customNum1 < customNum2 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>O dividendo precisa ser maior ou igual ao divisor!</span>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={(customType === "SUB" || customType === "DIV") && customNum1 < customNum2}
                    onClick={handleStartCustom}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-100 hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    Criar e Armar Operação Personalizada
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SECTION 2: READY-MADE DIDACTIC CHALLENGES */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-100/10 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  Ou Escolha um Desafio Didático Pronto:
                </h3>
                
                {/* Categorized presets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {/* ADDITION PRESETS */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 block text-center">
                      Adição (+)
                    </span>
                    {PRESETS.filter(p => p.type === "ADD").map(preset => (
                      <div
                        key={preset.id}
                        onClick={() => handleStartPreset(preset)}
                        className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/10 cursor-pointer transition-all flex flex-col justify-between group shadow-sm text-left"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-1">{preset.title}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                              preset.difficulty === "Fácil" ? "bg-green-50 text-green-700 border-green-100" :
                              preset.difficulty === "Médio" ? "bg-amber-50 text-amber-700 border-amber-100" :
                              "bg-red-50 text-red-700 border-red-100"
                            }`}>
                              {preset.difficulty}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-normal">
                            {preset.description}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-600 mt-2 block text-right">
                          {preset.num1} + {preset.num2}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* SUBTRACTION PRESETS */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 block text-center">
                      Subtração (-)
                    </span>
                    {PRESETS.filter(p => p.type === "SUB").map(preset => (
                      <div
                        key={preset.id}
                        onClick={() => handleStartPreset(preset)}
                        className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/10 cursor-pointer transition-all flex flex-col justify-between group shadow-sm text-left"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-1">{preset.title}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                              preset.difficulty === "Fácil" ? "bg-green-50 text-green-700 border-green-100" :
                              preset.difficulty === "Médio" ? "bg-amber-50 text-amber-700 border-amber-100" :
                              "bg-red-50 text-red-700 border-red-100"
                            }`}>
                              {preset.difficulty}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-normal">
                            {preset.description}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-600 mt-2 block text-right">
                          {preset.num1} - {preset.num2}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* MULTIPLICATION PRESETS */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 block text-center">
                      Multiplicação (×)
                    </span>
                    {PRESETS.filter(p => p.type === "MUL").map(preset => (
                      <div
                        key={preset.id}
                        onClick={() => handleStartPreset(preset)}
                        className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/10 cursor-pointer transition-all flex flex-col justify-between group shadow-sm text-left"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-1">{preset.title}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                              preset.difficulty === "Fácil" ? "bg-green-50 text-green-700 border-green-100" :
                              preset.difficulty === "Médio" ? "bg-amber-50 text-amber-700 border-amber-100" :
                              "bg-red-50 text-red-700 border-red-100"
                            }`}>
                              {preset.difficulty}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-normal">
                            {preset.description}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-600 mt-2 block text-right">
                          {preset.num1} × {preset.num2}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* DIVISION PRESETS */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 block text-center">
                      Divisão (÷)
                    </span>
                    {PRESETS.filter(p => p.type === "DIV").map(preset => (
                      <div
                        key={preset.id}
                        onClick={() => handleStartPreset(preset)}
                        className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/10 cursor-pointer transition-all flex flex-col justify-between group shadow-sm text-left"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-1">{preset.title}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                              preset.difficulty === "Fácil" ? "bg-green-50 text-green-700 border-green-100" :
                              preset.difficulty === "Médio" ? "bg-amber-50 text-amber-700 border-amber-100" :
                              "bg-red-50 text-red-700 border-red-100"
                            }`}>
                              {preset.difficulty}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-normal">
                            {preset.description}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-600 mt-2 block text-right">
                          {preset.num1} ÷ {preset.num2}
                        </span>
                      </div>
                    ))}

                    {/* Inline Custom Division Option */}
                    <div className="p-3.5 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/45 text-left space-y-3 shadow-inner">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></span>
                        <span className="text-xs font-bold text-indigo-900 font-mono uppercase tracking-wide">
                          Inserir Outros Números
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Dividendo (10-999)</span>
                          <input
                            type="number"
                            min={10}
                            max={999}
                            value={divCustomNum1}
                            onChange={(e) => setDivCustomNum1(Math.max(10, Math.min(999, parseInt(e.target.value) || 10)))}
                            className="w-full text-center text-xs font-extrabold bg-white border border-slate-200 rounded-xl py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                            placeholder="Ex: 246"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Divisor (2-9)</span>
                          <input
                            type="number"
                            min={2}
                            max={9}
                            value={divCustomNum2}
                            onChange={(e) => setDivCustomNum2(Math.max(2, Math.min(9, parseInt(e.target.value) || 2)))}
                            className="w-full text-center text-xs font-extrabold bg-white border border-slate-200 rounded-xl py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                            placeholder="Ex: 6"
                          />
                        </div>
                      </div>

                      {divCustomNum1 < divCustomNum2 && (
                        <p className="text-[9px] text-red-500 font-bold leading-tight">
                          ⚠️ O dividendo deve ser maior que o divisor!
                        </p>
                      )}

                      <button
                        onClick={() => {
                          if (divCustomNum1 < divCustomNum2) return;
                          setNum1(divCustomNum1);
                          setNum2(divCustomNum2);
                          setOpType("DIV");
                          initGameGrid(divCustomNum1, divCustomNum2, "DIV");
                        }}
                        disabled={divCustomNum1 < divCustomNum2}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded-xl text-[11px] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Iniciar Divisão
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="gameplay-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid lg:grid-cols-12 gap-8 items-stretch"
          >
            {/* Left Column: Tutor guidance bubble */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              
              {/* Pedagogy tutor chat-like display */}
              <div className="bg-white border border-indigo-50 rounded-3xl p-6 shadow-xl shadow-indigo-100/10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 border-b border-indigo-50 pb-4 mb-4 select-none">
                    <span className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-700">
                      👨‍🏫
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">Tutor Capitão Matemática</h3>
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        Analisando seus movimentos
                      </p>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line space-y-4 font-sans bg-indigo-50/20 p-4 rounded-2xl border border-indigo-50/30">
                    {tutorMessage.split("\n\n").map((para, pIdx) => {
                      if (para.startsWith("**") && para.endsWith("**")) {
                        return (
                          <p key={pIdx} className="font-bold text-slate-900 border-l-4 border-indigo-500 pl-3">
                            {para.replace(/\*\*/g, "")}
                          </p>
                        );
                      }
                      
                      // Highlight markdown inside paragraph
                      let formatted = para;
                      // simple replacement for bold
                      const boldRegex = /\*\*([^*]+)\*\*/g;
                      let match;
                      const parts: React.ReactNode[] = [];
                      let lastIndex = 0;
                      
                      while ((match = boldRegex.exec(para)) !== null) {
                        parts.push(para.substring(lastIndex, match.index));
                        parts.push(<strong key={match.index} className="font-bold text-indigo-900 bg-indigo-50/50 px-1 rounded">{match[1]}</strong>);
                        lastIndex = boldRegex.lastIndex;
                      }
                      parts.push(para.substring(lastIndex));

                      return (
                        <p key={pIdx} className="text-slate-600 leading-relaxed text-xs">
                          {parts.length > 1 ? parts : para}
                        </p>
                      );
                    })}
                  </div>


                </div>

              </div>

              {/* DIVISIBILITY / PEDAGOGICAL CHEATSHEET FOR OPERATIONS */}
              <div className="p-5 rounded-3xl bg-indigo-50/50 border border-indigo-100/40 shadow-sm space-y-3 select-none">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Quadro de Colunas Decimais
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="p-2 bg-white border border-indigo-100/50 rounded-xl">
                    <strong className="block text-indigo-700 text-xs font-mono">M</strong>
                    <span className="text-slate-400 font-semibold uppercase">Milhar</span>
                  </div>
                  <div className="p-2 bg-white border border-indigo-100/50 rounded-xl">
                    <strong className="block text-indigo-700 text-xs font-mono">C</strong>
                    <span className="text-slate-400 font-semibold uppercase">Centena</span>
                  </div>
                  <div className="p-2 bg-white border border-indigo-100/50 rounded-xl">
                    <strong className="block text-indigo-700 text-xs font-mono">D</strong>
                    <span className="text-slate-400 font-semibold uppercase">Dezena</span>
                  </div>
                  <div className="p-2 bg-white border border-indigo-100/50 rounded-xl">
                    <strong className="block text-indigo-700 text-xs font-mono">U</strong>
                    <span className="text-slate-400 font-semibold uppercase">Unidade</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Virtual School Notebook Page ("Folha Quadriculada") */}
            <div className="lg:col-span-7 flex flex-col space-y-6">
              
              {/* Visual notebook card */}
              <div className="bg-[#f0f9ff] border-2 border-indigo-100 rounded-3xl shadow-xl p-6 relative overflow-hidden select-none">
                
                {/* Visual grid lines background representing quadriculado school notebook */}
                <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                  backgroundImage: 'linear-gradient(to right, #0284c7 1px, transparent 1px), linear-gradient(to bottom, #0284c7 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }}></div>

                <div className="relative flex flex-col h-full justify-between">
                  {/* Title banner */}
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-3 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <h3 className="text-xs font-bold font-mono text-indigo-800 uppercase tracking-widest">
                        CADERNO DE MATEMÁTICA - ATIVIDADE
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      Operação: {opType === "ADD" ? "ADIÇÃO" : opType === "SUB" ? "SUBTRAÇÃO" : opType === "MUL" ? "MULTIPLICAÇÃO" : "DIVISÃO"}
                    </span>
                  </div>

                  {/* Math Grid Workspace */}
                  {opType === "DIV" ? (
                    <div className="flex flex-col items-center justify-center pt-2 pb-4 space-y-6 w-full">
                      
                      {/* DIVISOR INFO CARD (Point 1) */}
                      <div className="w-full max-w-md bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-indigo-950 font-sans shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-mono font-bold text-sm">
                            d
                          </span>
                          <div>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Identificação do Divisor</span>
                            <span className="text-sm font-bold">O divisor é <strong className="text-indigo-600 text-base font-mono bg-white px-2 py-0.5 rounded-lg border border-indigo-100 shadow-sm">{num2}</strong></span>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 bg-indigo-100/60 border border-indigo-200/50 rounded-xl text-xs font-semibold text-indigo-800">
                          {num2.toString().length === 1 ? "1 algarismo" : `${num2.toString().length} algarismos`}
                        </div>
                      </div>

                      {/* ALIGNED DIVIDEND BOXES (Point 2) */}
                      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-2 font-sans shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dividendo por Algarismo</span>
                        <div className="flex items-center gap-2">
                          {num1.toString().split("").map((digit, idx) => (
                            <div key={`aligned-dividend-digit-${idx}`} className="flex flex-col items-center gap-1">
                              <div className="w-10 h-10 rounded-xl border-2 border-indigo-100 bg-indigo-50/20 text-indigo-950 font-mono font-extrabold text-lg flex items-center justify-center shadow-sm">
                                {digit}
                              </div>
                              <span className="text-[9px] text-indigo-500/80 font-bold font-mono">Dígito {idx + 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* MAIN DIVISION BRACKET GRID */}
                      <div className="relative grid grid-cols-6 gap-y-3 gap-x-2 items-center max-w-sm w-full font-mono bg-white/40 border border-indigo-50/30 p-4 rounded-3xl shadow-inner">
                        
                        {/* Grouping Arc */}
                        {(() => {
                          const model = getDivisionBoardModel();
                          if (!model || model.stages.length === 0) return null;
                          return (
                            <div
                              className="h-2 border-t-2 border-x-2 border-indigo-500 rounded-t-full pointer-events-none"
                              style={{
                                gridColumnStart: model.isFirstGrouped ? 2 : 3,
                                gridColumnEnd: 4,
                                gridRowStart: 1,
                                marginTop: "-8px"
                              }}
                            />
                          );
                        })()}

                        {/* Arrows drawing */}
                        {getDivisionGridCells().filter(cell => cell.showArrow).map((cell, idx) => (
                          <div
                            key={`div-arrow-${idx}`}
                            className="flex flex-col items-center justify-between pointer-events-none select-none"
                            style={{
                              gridColumnStart: cell.col + 1,
                              gridRowStart: cell.arrowStartRow! + 1,
                              gridRowEnd: cell.arrowEndRow! + 1,
                              marginTop: "16px",
                              marginBottom: "16px",
                              zIndex: 10
                            }}
                          >
                            <div className="w-0.5 flex-1 border-l-2 border-dashed border-amber-500"></div>
                            <span className="text-amber-500 text-[10px] leading-none">▼</span>
                          </div>
                        ))}

                        {/* Rendering cells */}
                        {getDivisionGridCells().map((cell, idx) => {
                          const isBlinking = cell.content === "?";
                          return (
                            <div
                              key={`div-cell-${idx}`}
                              className={`relative font-mono font-bold text-center flex items-center justify-center transition-all ${cell.className || ""} ${
                                cell.isHighlighted 
                                  ? "bg-indigo-50 border-indigo-400 text-indigo-950 ring-2 ring-indigo-300 shadow-sm" 
                                  : ""
                              }`}
                              style={{
                                gridColumnStart: cell.col + 1,
                                gridRowStart: cell.row + 1,
                              }}
                            >
                              <span className={isBlinking ? "animate-pulse text-indigo-600 font-extrabold" : ""}>
                                {cell.content}
                              </span>
                            </div>
                          );
                        })}

                      </div>

                      {/* STAGES SPECIFIC CARDS (Point 6) */}
                      <div className="w-full max-w-md bg-slate-50/50 border border-slate-100 rounded-3xl p-4 flex flex-col font-sans text-left shadow-inner">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 px-1 mb-3">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Passos de Resolução Detalhados
                        </h4>

                        <div className="max-h-[300px] overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin scrollbar-thumb-indigo-100 scrollbar-track-transparent">
                          {(() => {
                            const model = getDivisionBoardModel();
                            if (!model || model.stages.length === 0) {
                              return <p className="text-xs text-slate-400 italic px-1">Nenhum passo iniciado.</p>;
                            }

                            const digits = num1.toString().split("");

                            return model.stages.map((stage, idx) => {
                              if (!stage.showTop) return null;

                              const topValNum = parseInt(stage.topValue);
                              const partialQuotient = Math.floor(topValNum / num2);
                              const subtractedValue = partialQuotient * num2;
                              const remainderValue = topValNum - subtractedValue;

                              const stageDivideStepIdx = idx === 0 
                                ? (model.isFirstGrouped ? 1 : 0)
                                : (model.isFirstGrouped ? 1 : 0) + idx * 3;
                              
                              const isQuotientRevealed = gameStage === "COMPLETED" || divStepIndex > stageDivideStepIdx;
                              const isCurrentActiveStage = divStepIndex >= stageDivideStepIdx && divStepIndex < stageDivideStepIdx + 3;

                              const broughtDownDigit = digits[model.groupSize + idx - 1];

                              return (
                                <div 
                                  key={`stage-card-${idx}`} 
                                  className={`border rounded-2xl p-3.5 transition-all shadow-sm ${
                                    isCurrentActiveStage 
                                      ? "bg-amber-50/75 border-amber-300 ring-1 ring-amber-200" 
                                      : "bg-white border-slate-100/80"
                                  }`}
                                >
                                  <div className="flex items-center justify-between border-b border-slate-100/80 pb-2 mb-3">
                                    <span className="text-xs font-extrabold text-slate-700">
                                      Etapa {idx + 1}: Dividindo o bloco
                                    </span>
                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                      isCurrentActiveStage 
                                        ? "bg-amber-100 text-amber-800 animate-pulse" 
                                        : isQuotientRevealed 
                                          ? "bg-emerald-100 text-emerald-800" 
                                          : "bg-slate-100 text-slate-400"
                                    }`}>
                                      {isCurrentActiveStage ? "Em Andamento" : isQuotientRevealed ? "Resolvido" : "Pendente"}
                                    </span>
                                  </div>

                                  <div className="space-y-3.5 text-xs text-slate-600">
                                    
                                    {/* BLOCK FORMATION (Point 3: Unindo resto e dígito descido) */}
                                    {idx === 0 ? (
                                      /* First block is just the initial dividend group */
                                      <div className="flex items-center justify-between bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100/30">
                                        <div>
                                          <span className="text-[10px] text-indigo-500 font-bold block uppercase tracking-wider">Dividendo Inicial</span>
                                          <span className="text-xs text-slate-500">Agrupamos o começo do número:</span>
                                        </div>
                                        <div className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-mono font-extrabold text-sm shadow-sm">
                                          {stage.topValue}
                                        </div>
                                      </div>
                                    ) : (
                                      /* Subsequent blocks show the beautiful unification formula */
                                      <div className="bg-slate-50/80 border border-slate-100 p-2.5 rounded-xl space-y-2">
                                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                                          Formação do Novo Dividendo
                                        </span>
                                        <div className="flex items-center justify-center gap-1.5 font-sans py-0.5">
                                          {/* Resto anterior */}
                                          <div className="flex flex-col items-center">
                                            <div className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-extrabold text-xs shadow-sm">
                                              {model.stages[idx - 1]?.remainder}
                                            </div>
                                            <span className="text-[8px] text-emerald-600 font-bold mt-0.5 leading-none">Resto</span>
                                          </div>

                                          <span className="text-slate-400 font-bold text-xs">＋</span>

                                          {/* Dígito que desceu */}
                                          <div className="flex flex-col items-center">
                                            <div className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-mono font-extrabold text-xs shadow-sm">
                                              {broughtDownDigit || "?"}
                                            </div>
                                            <span className="text-[8px] text-amber-600 font-bold mt-0.5 leading-none">Desceu</span>
                                          </div>

                                          <span className="text-slate-400 font-bold text-xs">➔</span>

                                          {/* Novo bloco formado */}
                                          <div className="flex flex-col items-center">
                                            <div className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-mono font-extrabold text-xs shadow-sm">
                                              {stage.topValue}
                                            </div>
                                            <span className="text-[8px] text-indigo-600 font-bold mt-0.5 leading-none">Unido</span>
                                          </div>
                                        </div>
                                        <p className="text-[10px] text-slate-500 text-center leading-snug">
                                          O resto <strong className="text-emerald-700 font-extrabold">{model.stages[idx - 1]?.remainder}</strong> juntou-se ao dígito baixado <strong className="text-amber-700 font-extrabold">{broughtDownDigit}</strong>, formando <strong className="text-indigo-600 font-extrabold">{stage.topValue}</strong>!
                                        </p>
                                      </div>
                                    )}

                                    {/* Point 4: Quociente Parcial */}
                                    <div className="flex items-center justify-between bg-emerald-50/20 p-2.5 rounded-xl border border-emerald-100/30">
                                      <div>
                                        <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">Quociente Parcial</span>
                                        <span className="text-[11px] text-slate-500 block leading-tight">Quantas vezes o {num2} cabe em {stage.topValue}?</span>
                                      </div>
                                      <div className="flex items-center justify-center min-w-10 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-extrabold text-sm shadow-sm">
                                        {isQuotientRevealed ? partialQuotient : "?"}
                                      </div>
                                    </div>

                                    {/* Point 5: Resto e Descer Próximo Dígito */}
                                    {stage.showSub && (
                                      <div className="bg-red-50/20 border border-red-100/30 p-2.5 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <span className="text-[10px] text-red-700 font-bold block uppercase tracking-wider">Subtração do Resto</span>
                                            <span className="text-[11px] text-slate-500 font-mono">{stage.topValue} − {isQuotientRevealed ? subtractedValue : `(${partialQuotient} × ${num2})`}</span>
                                          </div>
                                          <div className="flex items-center justify-center min-w-10 h-9 rounded-lg bg-red-50 border border-red-100 text-red-700 font-mono font-extrabold text-sm shadow-sm">
                                            {stage.showRemainder ? stage.remainder : "?"}
                                          </div>
                                        </div>

                                        {stage.showBringDown && stage.bringDownDigit && (
                                          <div className="flex items-center justify-between border-t border-dashed border-slate-100 pt-2 mt-1 text-[11px] text-amber-800 font-medium">
                                            <span className="flex items-center gap-1">
                                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                              Próximo passo: descer o dígito:
                                            </span>
                                            <strong className="font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-700 font-extrabold text-xs">
                                              {stage.bringDownDigit}
                                            </strong>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>

                      {/* Point 7: FINAL RESULT CARD */}
                      {(gameStage === "COMPLETED" || divStepIndex >= divSteps.length) && (
                        <div className="w-full max-w-md bg-gradient-to-br from-emerald-50 to-teal-50/50 border-2 border-emerald-200 rounded-3xl p-5 shadow-lg shadow-emerald-100/20 font-sans space-y-4 animate-scale-up text-left">
                          <div className="text-center border-b border-emerald-100/80 pb-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                              🎉 Divisão Concluída!
                            </span>
                            <h4 className="text-sm font-bold text-emerald-950 mt-2">
                              Parabéns! Você resolveu com maestria!
                            </h4>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {/* Quotient Box */}
                            <div className="bg-white border border-emerald-100 rounded-2xl p-3 text-center shadow-sm">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quociente Completo</span>
                              <div className="mt-1 flex items-center justify-center mx-auto w-14 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-extrabold text-lg shadow-sm">
                                {Math.floor(num1 / num2)}
                              </div>
                            </div>

                            {/* Remainder Box */}
                            <div className="bg-white border border-emerald-100 rounded-2xl p-3 text-center shadow-sm">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resto Final</span>
                              <div className="mt-1 flex items-center justify-center mx-auto w-14 h-12 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 font-mono font-extrabold text-lg shadow-sm">
                                {num1 % num2}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/80 border border-emerald-100/50 rounded-xl p-2.5 text-center text-xs text-emerald-900 font-medium">
                            Resultado: <span className="font-mono font-extrabold text-sm">{num1} ÷ {num2} = {Math.floor(num1 / num2)}</span> {num1 % num2 > 0 ? `com resto ${num1 % num2}` : "(exata)"}
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-2 pb-4">
                      <div className="grid grid-cols-6 gap-y-3 gap-x-2 items-center max-w-sm w-full">
                        
                        {/* Grid Header labels: empty, empty, M, C, D, U */}
                        <div className="col-span-2"></div>
                        <div className="text-center font-mono text-xs font-extrabold text-indigo-800 bg-indigo-50 border border-indigo-100 rounded-lg py-1">M</div>
                        <div className="text-center font-mono text-xs font-extrabold text-indigo-800 bg-indigo-50 border border-indigo-100 rounded-lg py-1">C</div>
                        <div className="text-center font-mono text-xs font-extrabold text-indigo-800 bg-indigo-50 border border-indigo-100 rounded-lg py-1">D</div>
                        <div className="text-center font-mono text-xs font-extrabold text-indigo-800 bg-indigo-50 border border-indigo-100 rounded-lg py-1">U</div>

                        {/* ROW 0: Carry-overs ("Vai Um" / "Transporte") - only active during SOLVING for ADD/MUL */}
                        <div className="col-span-2 text-right text-[10px] font-bold text-slate-400 pr-2">
                          {(opType === "ADD" || opType === "MUL") && gameStage === "SOLVING" && "Vai um/sobe:"}
                        </div>
                        {[0, 1, 2, 3].map((idx) => {
                          const isCarryAvailable = (opType === "ADD" || opType === "MUL") && idx < 3;
                          const carryVal = gridCarries[idx];
                          const isActive = gameStage === "SOLVING" && activeColumn - 1 === idx;
                          const isError = solvingErrors.carries?.[idx];

                          return (
                            <div key={`carry-${idx}`} className="flex justify-center">
                              {isCarryAvailable ? (
                                <input
                                  type="text"
                                  maxLength={1}
                                  disabled={gameStage !== "SOLVING"}
                                  value={carryVal}
                                  onChange={(e) => {
                                    const updatedCarries = [...gridCarries];
                                    updatedCarries[idx] = e.target.value.replace(/[^0-9]/g, "");
                                    setGridCarries(updatedCarries);
                                  }}
                                  className={`w-8 h-8 rounded-full text-center text-xs font-bold border transition-all ${
                                    isActive 
                                      ? "bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-300 font-mono animate-pulse" 
                                      : carryVal 
                                        ? "bg-slate-200 border-slate-300 text-slate-800" 
                                        : "bg-slate-50 border-slate-200 text-slate-300"
                                  } ${isError ? "border-red-500 bg-red-100 text-red-700" : ""}`}
                                  placeholder="0"
                                />
                              ) : (
                                <div className="w-8 h-8"></div>
                              )}
                            </div>
                          );
                        })}

                        {/* ROW 1: Top Number (Num1) */}
                        <div className="col-span-2 text-right text-xs font-bold text-indigo-900 pr-2">
                          {gameStage === "SETUP" ? "Número de cima:" : "1ª Linha:"}
                        </div>
                        {[0, 1, 2, 3].map((idx) => {
                          const cellVal = gridRow1[idx];
                          const isError = setupErrors.row1?.[idx];
                          const wasBorrowedFrom = borrowedFrom[idx];
                          const borrowVal = borrowedValue[idx];

                          return (
                            <div key={`row1-${idx}`} className="relative flex justify-center">
                              {wasBorrowedFrom && (
                                <div className="absolute -top-4 text-[10px] font-bold font-mono text-red-600 bg-white px-1 border border-red-200 rounded-md shadow-sm z-10 animate-bounce">
                                  {borrowVal}
                                </div>
                              )}

                              {hasExtraTen[idx] && opType === "SUB" && (
                                <div className="absolute left-1 top-2.5 text-xs font-mono font-extrabold text-red-500 animate-pulse">
                                  1
                                </div>
                              )}

                              <input
                                type="text"
                                maxLength={1}
                                disabled={gameStage !== "SETUP"}
                                value={cellVal}
                                onChange={(e) => {
                                  const copy = [...gridRow1];
                                  copy[idx] = e.target.value.replace(/[^0-9]/g, "");
                                  setGridRow1(copy);
                                }}
                                className={`w-10 h-10 text-center text-lg font-bold border rounded-xl shadow-sm transition-all font-mono uppercase bg-white ${
                                  isError 
                                    ? "border-red-500 bg-red-50 text-red-700" 
                                    : wasBorrowedFrom 
                                      ? "border-slate-300 text-slate-400 line-through decoration-red-500 decoration-2" 
                                      : "border-indigo-100 text-indigo-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                }`}
                              />
                            </div>
                          );
                        })}

                        {/* ROW 2: Bottom Number (Num2) + Operator (Op) */}
                        <div className="col-span-1 text-center flex justify-center">
                          <input
                            type="text"
                            maxLength={1}
                            disabled={gameStage !== "SETUP"}
                            value={gridOperator}
                            onChange={(e) => setGridOperator(e.target.value)}
                            className={`w-10 h-10 text-center text-lg font-extrabold border rounded-xl shadow-sm transition-all font-mono bg-white ${
                              setupErrors.operator 
                                ? "border-red-500 bg-red-50 text-red-700" 
                                : "border-indigo-100 text-indigo-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            }`}
                            placeholder="op"
                          />
                        </div>
                        <div className="col-span-1 text-right text-xs font-bold text-indigo-900 pr-2">
                          {gameStage === "SETUP" ? "Número de baixo:" : "2ª Linha:"}
                        </div>
                        {[0, 1, 2, 3].map((idx) => {
                          const cellVal = gridRow2[idx];
                          const isError = setupErrors.row2?.[idx];

                          return (
                            <div key={`row2-${idx}`} className="flex justify-center">
                              <input
                                type="text"
                                maxLength={1}
                                disabled={gameStage !== "SETUP"}
                                value={cellVal}
                                onChange={(e) => {
                                  const copy = [...gridRow2];
                                  copy[idx] = e.target.value.replace(/[^0-9]/g, "");
                                  setGridRow2(copy);
                                }}
                                className={`w-10 h-10 text-center text-lg font-bold border rounded-xl shadow-sm transition-all font-mono bg-white ${
                                  isError 
                                    ? "border-red-500 bg-red-50 text-red-700" 
                                    : "border-indigo-100 text-indigo-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                }`}
                              />
                            </div>
                          );
                        })}

                        {/* Intermediate rows for 2-digit multiplication, or regular layout */}
                        {opType === "MUL" && num2 >= 10 ? (
                          <>
                            {/* Thick Divider line */}
                            <div className="col-span-6 border-t-4 border-slate-700/85 my-2"></div>

                            {/* ROW 3: 1st Partial Product (multiplied by units) */}
                            <div className="col-span-2 text-right text-xs font-bold text-indigo-900 pr-2">
                              {gameStage === "SOLVING" && mulStep === "PARTIAL1" ? "👉 Parcela Unid.:" : "Parcela Unid.:"}
                            </div>
                            {[0, 1, 2, 3].map((idx) => {
                              const cellVal = gridMulRow1[idx];
                              const isActive = gameStage === "SOLVING" && mulStep === "PARTIAL1" && activeColumn === idx;
                              const isError = solvingErrors.result?.[idx];

                              return (
                                <div key={`mul-p1-row-${idx}`} className="flex justify-center">
                                  <input
                                    type="text"
                                    maxLength={1}
                                    disabled={gameStage !== "SOLVING" || mulStep !== "PARTIAL1"}
                                    value={cellVal}
                                    onChange={(e) => {
                                      const copy = [...gridMulRow1];
                                      copy[idx] = e.target.value.replace(/[^0-9]/g, "");
                                      setGridMulRow1(copy);
                                    }}
                                    className={`w-10 h-10 text-center text-lg font-bold border rounded-xl shadow-md transition-all font-mono ${
                                      isActive 
                                        ? "bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-300 animate-pulse font-extrabold" 
                                        : isError 
                                          ? "border-red-500 bg-red-50 text-red-700" 
                                          : cellVal 
                                            ? "bg-indigo-50 border-indigo-200 text-indigo-950" 
                                            : "bg-white border-indigo-50 text-indigo-950"
                                    }`}
                                    placeholder={isActive ? "?" : ""}
                                  />
                                </div>
                              );
                            })}

                            {/* ROW 4: 2nd Partial Product (multiplied by tens, shifted) */}
                            <div className="col-span-2 text-right text-xs font-bold text-indigo-900 pr-2">
                              {gameStage === "SOLVING" && mulStep === "PARTIAL2" ? "👉 Parcela Dez.:" : "Parcela Dez.:"}
                            </div>
                            {[0, 1, 2, 3].map((idx) => {
                              const cellVal = gridMulRow2[idx];
                              const isActive = gameStage === "SOLVING" && mulStep === "PARTIAL2" && activeColumn === idx;
                              const isError = solvingErrors.result?.[idx];
                              const isShiftCell = idx === 3;

                              return (
                                <div key={`mul-p2-row-${idx}`} className="flex justify-center">
                                  <input
                                    type="text"
                                    maxLength={1}
                                    disabled={gameStage !== "SOLVING" || mulStep !== "PARTIAL2" || isShiftCell}
                                    value={cellVal}
                                    onChange={(e) => {
                                      const copy = [...gridMulRow2];
                                      copy[idx] = e.target.value.replace(/[^0-9]/g, "");
                                      setGridMulRow2(copy);
                                    }}
                                    className={`w-10 h-10 text-center text-lg font-bold border rounded-xl shadow-md transition-all font-mono ${
                                      isShiftCell
                                        ? "bg-indigo-100/70 border-indigo-300 text-indigo-800 font-extrabold cursor-not-allowed"
                                        : isActive 
                                          ? "bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-300 animate-pulse font-extrabold" 
                                          : isError 
                                            ? "border-red-500 bg-red-50 text-red-700" 
                                            : cellVal 
                                              ? "bg-indigo-50 border-indigo-200 text-indigo-950" 
                                              : "bg-white border-indigo-50 text-indigo-950"
                                    }`}
                                    placeholder={isActive ? "?" : ""}
                                  />
                                </div>
                              );
                            })}

                            {/* Extra Divider line for additions */}
                            <div className="col-span-6 border-t-4 border-slate-700/85 my-2"></div>

                            {/* ROW 5: Final sum of partial products */}
                            <div className="col-span-2 text-right text-xs font-bold text-emerald-800 pr-2">
                              {gameStage === "SOLVING" && mulStep === "ADDITION" ? "👉 Soma Final:" : "Soma Final:"}
                            </div>
                            {[0, 1, 2, 3].map((idx) => {
                              const cellVal = gridResult[idx];
                              const isActive = gameStage === "SOLVING" && mulStep === "ADDITION" && activeColumn === idx;
                              const isError = solvingErrors.result?.[idx];

                              return (
                                <div key={`mul-add-row-${idx}`} className="flex justify-center">
                                  <input
                                    type="text"
                                    maxLength={1}
                                    disabled={gameStage !== "SOLVING" || mulStep !== "ADDITION"}
                                    value={cellVal}
                                    onChange={(e) => {
                                      const copy = [...gridResult];
                                      copy[idx] = e.target.value.replace(/[^0-9]/g, "");
                                      setGridResult(copy);
                                    }}
                                    className={`w-10 h-10 text-center text-lg font-bold border rounded-xl shadow-md transition-all font-mono ${
                                      isActive 
                                        ? "bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-300 animate-pulse font-extrabold" 
                                        : isError 
                                          ? "border-red-500 bg-red-50 text-red-700" 
                                          : cellVal 
                                            ? "bg-emerald-50 border-emerald-300 text-emerald-950" 
                                            : "bg-white border-indigo-50 text-indigo-950"
                                    }`}
                                    placeholder={isActive ? "?" : ""}
                                  />
                                </div>
                              );
                            })}
                          </>
                        ) : (
                          <>
                            {/* Thick Divider line */}
                            <div className="col-span-6 border-t-4 border-slate-700/85 my-2"></div>

                            {/* ROW 3: Result row */}
                            {opType === "SUB" && gameStage === "SOLVING" && (
                              <>
                                <div className="col-span-2 text-right text-[10px] font-bold text-red-600 pr-2">Emprestar:</div>
                                {[0, 1, 2, 3].map((idx) => {
                                  const canBorrowFrom = idx < 3 && gridRow1[idx] && gridRow1[idx] !== "0" && !borrowedFrom[idx];
                                  
                                  return (
                                    <div key={`borrow-btn-${idx}`} className="flex justify-center">
                                      {canBorrowFrom ? (
                                        <button
                                          onClick={() => handleBorrow(idx)}
                                          title={`Pegar emprestado da coluna das ${idx === 2 ? "Dezenas" : idx === 1 ? "Centenas" : "Milhares"}`}
                                          className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg border border-red-200 shadow-sm flex items-center justify-center transition-all cursor-pointer"
                                        >
                                          ✂️
                                        </button>
                                      ) : (
                                        <div className="w-7 h-7"></div>
                                      )}
                                    </div>
                                  );
                                })}
                                <div className="col-span-6 h-1 bg-transparent"></div>
                              </>
                            )}

                            {/* Result input cells */}
                            <div className="col-span-2 text-right text-xs font-bold text-emerald-800 pr-2">
                              {gameStage === "SOLVING" ? "Resultado total:" : "Resultado:"}
                            </div>
                            {[0, 1, 2, 3].map((idx) => {
                              const cellVal = gridResult[idx];
                              const isActive = gameStage === "SOLVING" && activeColumn === idx;
                              const isError = solvingErrors.result?.[idx];

                              return (
                                <div key={`result-${idx}`} className="flex justify-center">
                                  <input
                                    type="text"
                                    maxLength={1}
                                    disabled={gameStage !== "SOLVING" && gameStage !== "COMPLETED"}
                                    value={cellVal}
                                    onChange={(e) => {
                                      const copy = [...gridResult];
                                      copy[idx] = e.target.value.replace(/[^0-9]/g, "");
                                      setGridResult(copy);
                                    }}
                                    className={`w-10 h-10 text-center text-lg font-bold border rounded-xl shadow-md transition-all font-mono ${
                                      isActive 
                                        ? "bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-300 animate-pulse font-extrabold" 
                                        : isError 
                                          ? "border-red-500 bg-red-50 text-red-700" 
                                          : cellVal 
                                            ? "bg-emerald-50 border-emerald-300 text-emerald-950" 
                                            : "bg-white border-indigo-50 text-indigo-950"
                                    }`}
                                    placeholder={isActive ? "?" : ""}
                                  />
                                </div>
                              );
                            })}
                          </>
                        )}

                      </div>
                    </div>
                  )}

                  {/* Multiple Choice Options for solving steps */}
                  {gameStage === "SOLVING" && currentOptions.length > 0 && (
                    <div className="mt-2 mb-4 space-y-2 p-4 bg-amber-50/80 rounded-2xl border border-amber-200 shadow-md animate-fade-in relative z-20 max-w-sm mx-auto w-full">
                      <p className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        Escolha a resposta correta:
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {currentOptions.map((opt) => {
                          const isWrong = wrongOptions.includes(opt.id);
                          const isSelected = selectedOptionId === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              disabled={isWrong || selectedOptionId !== null}
                              onClick={() => handleSelectOption(opt)}
                              className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-500 border-emerald-600 text-white shadow-md scale-[1.02]"
                                  : isWrong
                                    ? "bg-red-50 border-red-200 text-red-400 line-through cursor-not-allowed opacity-60"
                                    : "bg-white border-slate-200 hover:border-indigo-300 text-slate-700 hover:bg-indigo-50/20 shadow-sm hover:shadow"
                              }`}
                            >
                              <span className="line-clamp-1">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Botões de Ação Próximos às Resoluções */}
                  <div className="mt-6 space-y-3 border-t border-indigo-100/50 pt-5">
                    {gameStage === "SETUP" ? (
                      <button
                        onClick={handleVerifySetup}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-100 hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                      >
                        Verificar Montagem no Quadro
                        <Check className="w-4 h-4" />
                      </button>
                    ) : gameStage === "SOLVING" ? (
                      opType !== "DIV" && (
                        <button
                          onClick={handleVerifyColumn}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-100 hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                        >
                          Confirmar Resposta da Coluna
                          <Check className="w-4 h-4" />
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => setGameStage("SELECT")}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-100 hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                      >
                        Praticar Outra Conta
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleRestartSession}
                        className="w-full bg-white hover:bg-slate-50 text-slate-600 font-bold py-2.5 px-3 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-sm"
                      >
                        Recomeçar Desafio
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (opType === "DIV") {
                            setDivCustomNum1(num1);
                            setDivCustomNum2(num2);
                          } else {
                            setCustomNum1(num1);
                            setCustomNum2(num2);
                            setCustomType(opType);
                          }
                          setShowChangeNumbersModal(!showChangeNumbersModal);
                        }}
                        className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2.5 px-3 rounded-xl border border-indigo-200/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-sm"
                      >
                        Mudar Números
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {showChangeNumbersModal && (
                      <div className="p-4 bg-white/95 rounded-2xl border border-indigo-100 space-y-3 mt-3 shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider font-mono">Inserir Novos Números</span>
                          <button 
                            onClick={() => setShowChangeNumbersModal(false)}
                            className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">1º Número / Dividendo</span>
                            <input
                              type="number"
                              min={10}
                              max={999}
                              value={opType === "DIV" ? divCustomNum1 : customNum1}
                              onChange={(e) => {
                                const val = Math.max(10, Math.min(999, parseInt(e.target.value) || 10));
                                if (opType === "DIV") {
                                  setDivCustomNum1(val);
                                } else {
                                  setCustomNum1(val);
                                }
                              }}
                              className="w-full text-center text-xs font-extrabold bg-white border border-slate-200 rounded-lg py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">2º Número / Divisor</span>
                            <input
                              type="number"
                              min={opType === "DIV" ? 2 : opType === "MUL" ? 2 : 10}
                              max={opType === "DIV" ? 99 : opType === "MUL" ? 99 : 999}
                              value={opType === "DIV" ? divCustomNum2 : customNum2}
                              onChange={(e) => {
                                const minVal = opType === "DIV" ? 2 : opType === "MUL" ? 2 : 10;
                                const maxVal = opType === "DIV" ? 99 : opType === "MUL" ? 99 : 999;
                                const val = Math.max(minVal, Math.min(maxVal, parseInt(e.target.value) || minVal));
                                if (opType === "DIV") {
                                  setDivCustomNum2(val);
                                } else {
                                  setCustomNum2(val);
                                }
                              }}
                              className="w-full text-center text-xs font-extrabold bg-white border border-slate-200 rounded-lg py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                            />
                          </div>
                        </div>
                        
                        {opType === "SUB" && customNum1 < customNum2 && (
                          <p className="text-[9px] text-red-600 font-bold">⚠️ O primeiro número deve ser maior!</p>
                        )}
                        {opType === "DIV" && divCustomNum1 < divCustomNum2 && (
                          <p className="text-[9px] text-red-600 font-bold">⚠️ O dividendo deve ser maior!</p>
                        )}

                        <button
                          onClick={() => {
                            const n1 = opType === "DIV" ? divCustomNum1 : customNum1;
                            const n2 = opType === "DIV" ? divCustomNum2 : customNum2;
                            if (opType === "SUB" && n1 < n2) return;
                            if (opType === "DIV" && n1 < n2) return;
                            
                            setNum1(n1);
                            setNum2(n2);
                            initGameGrid(n1, n2, opType);
                            setShowChangeNumbersModal(false);
                          }}
                          disabled={
                            (opType === "SUB" && customNum1 < customNum2) ||
                            (opType === "DIV" && divCustomNum1 < divCustomNum2)
                          }
                          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-[11px] font-bold py-2 rounded-xl transition-all shadow-md"
                        >
                          Salvar e Reiniciar Conta
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Aesthetic indicators */}
                  <div className="mt-4 pt-4 border-t border-indigo-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                      <span>Caderno Quadriculado Escolar</span>
                    </div>
                    {selectedPreset && (
                      <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                        Nível: {selectedPreset.difficulty}
                      </span>
                    )}
                  </div>

                </div>
              </div>

              {/* Progress Tracker Cards */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xl shadow-indigo-100/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-amber-50 rounded-2xl text-amber-600">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-500 animate-spin-slow" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-none">Status do Treino</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {opType === "DIV" ? (
                        gameStage === "SOLVING" ? (
                          `Passo ${divStepIndex + 1} de ${divSteps.length}: ${
                            divSteps[divStepIndex]?.type === "GROUP" ? "Agrupar Algarismos" :
                            divSteps[divStepIndex]?.type === "DIVIDE" ? "Dividir Números" :
                            divSteps[divStepIndex]?.type === "SUBTRACT" ? "Subtrair e Calcular Resto" :
                            "Baixar Próximo Algarismo"
                          }`
                        ) : "Etapa Final: Divisão Concluída com Sucesso!"
                      ) : (
                        gameStage === "SETUP" ? "Etapa 1: Organizar e Armar os algarismos" : 
                        gameStage === "SOLVING" ? `Etapa 2: Resolver Coluna por Coluna (${activeColumn === 3 ? "Unidades" : activeColumn === 2 ? "Dezenas" : activeColumn === 1 ? "Centenas" : "Milhares"})` : 
                        "Etapa Final: Sucesso Completo!"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Progresso</span>
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100/50">
                      {opType === "DIV" ? (
                        gameStage === "SOLVING" ? `${Math.round(((divStepIndex + 1) / Math.max(1, divSteps.length)) * 100)}%` : "100%"
                      ) : (
                        gameStage === "SETUP" ? "15%" : gameStage === "SOLVING" ? `${40 + (3 - activeColumn) * 20}%` : "100%"
                      )}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
