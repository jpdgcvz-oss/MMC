/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FactorizationStep {
  numbersBefore: number[];
  primeChosen: number;
  numbersAfter: number[];
}

/**
 * Checks if a number is prime.
 */
export function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/**
 * Gets the list of prime factors that can divide at least one of the numbers.
 */
export function getPrimesThatDivide(numbers: number[]): number[] {
  const primes: number[] = [];
  const max = Math.max(...numbers);
  for (let i = 2; i <= max; i++) {
    if (isPrime(i)) {
      if (numbers.some(num => num > 1 && num % i === 0)) {
        primes.push(i);
      }
    }
  }
  return primes;
}

/**
 * Gets the absolute smallest prime divisor for the current list of numbers.
 */
export function getSmallestPrimeDivisor(numbers: number[]): number {
  const activeNumbers = numbers.filter(n => n > 1);
  if (activeNumbers.length === 0) return 1;
  
  const primes = getPrimesThatDivide(activeNumbers);
  return primes.length > 0 ? primes[0] : 1;
}

/**
 * Performs division on the numbers. If not divisible, leaves the number unchanged.
 */
export function divideNumbers(numbers: number[], divisor: number): number[] {
  return numbers.map(num => {
    if (num > 1 && num % divisor === 0) {
      return num / divisor;
    }
    return num;
  });
}

/**
 * Generates the full factorization path for the given numbers.
 */
export function generateSteps(numbers: number[]): FactorizationStep[] {
  const steps: FactorizationStep[] = [];
  let current = [...numbers];
  
  while (current.some(num => num > 1)) {
    const prime = getSmallestPrimeDivisor(current);
    if (prime === 1) break; // Security break
    
    const next = divideNumbers(current, prime);
    steps.push({
      numbersBefore: [...current],
      primeChosen: prime,
      numbersAfter: [...next]
    });
    current = next;
  }
  
  return steps;
}

/**
 * Provides a simple divisibility rule explanation.
 */
export function getDivisibilityRuleExplanation(prime: number): string {
  switch (prime) {
    case 2:
      return "Um número é divisível por **2** se ele for **par** (terminar em 0, 2, 4, 6 ou 8).";
    case 3:
      return "Um número é divisível por **3** se a **soma de seus algarismos** for divisível por 3 (ex: 15 -> 1 + 5 = 6, que divide por 3).";
    case 5:
      return "Um número é divisível por **5** se ele **terminar em 0 ou 5**.";
    case 7:
      return "Para o **7**, dividimos o número diretamente para ver se o resto é zero, ou usamos regras de dobro da unidade.";
    default:
      return `Como o número é primo, dividimos diretamente por **${prime}** para verificar se a divisão é exata.`;
  }
}
