/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  text: string;
  timestamp: Date;
  isTyping?: boolean;
}

export type StepState = 
  | "INTRO"              // Student enters initial numbers
  | "ASK_PRIME"          // Student is asked for the next prime divisor
  | "ASK_DIVISION"       // Student is asked to divide each number by the prime
  | "ASK_MULTIPLY_MMC"   // All numbers are 1s, student is asked to calculate final product
  | "CONGRATULATIONS";   // Student completed the exercise successfully!

export interface GameSession {
  numbers: number[];            // E.g., [12, 15, 20]
  steps: FactorizationStep[];   // Full path pre-computed
  currentStepIndex: number;     // Index of current row in steps
  state: StepState;
  
  // Accumulated history of correct prime factors used
  primesUsed: number[];
  
  // Grid of results representing rows in the chalkboard
  // Each entry represents a row: { numbers: number[], divisor?: number }
  gridRows: {
    numbers: number[];
    divisor?: number;
  }[];
}

import { FactorizationStep } from "./utils/mathUtils";
