'use server';

/**
 * @fileOverview Manages the raffle process using a secure, server-side shuffling algorithm.
 *
 * - conductRaffle - A function that takes a list of coupons and the number of winners to select, returning a list of winning coupons.
 * - ConductRaffleInput - The input type for the conductRaffle function.
 * - ConductRaffleOutput - The return type for the conductRaffle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { webcrypto } from 'crypto'; // Use Node.js built-in crypto module

const ConductRaffleInputSchema = z.object({
  coupons: z.array(z.string()).describe('An array of coupon codes to choose winners from.'),
  numberOfWinners: z
    .number()
    .int()
    .min(1)
    .describe('The number of winners to select from the coupons.'),
});
export type ConductRaffleInput = z.infer<typeof ConductRaffleInputSchema>;

const ConductRaffleOutputSchema = z.object({
  winningCoupons: z
    .array(z.string())
    .describe('An array of randomly selected winning coupon codes.'),
});
export type ConductRaffleOutput = z.infer<typeof ConductRaffleOutputSchema>;

export async function conductRaffle(input: ConductRaffleInput): Promise<ConductRaffleOutput> {
  return conductRaffleFlow(input);
}

/**
 * Generates a cryptographically secure random integer between 0 (inclusive) and max (exclusive).
 * @param max The upper bound for the random number (exclusive).
 * @returns A secure random integer.
 */
function secureRandomInt(max: number): number {
  const array = new Uint32Array(1);
  // Use webcrypto which is available in Node.js and browsers
  webcrypto.getRandomValues(array);
  // This is a common way to get a uniform distribution within a range.
  return Math.floor((array[0] / (0xffffffff + 1)) * max);
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm with a secure random number generator.
 * @param array The array to shuffle.
 * @returns The shuffled array.
 */
function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}


const conductRaffleFlow = ai.defineFlow(
  {
    name: 'conductRaffleFlow',
    inputSchema: ConductRaffleInputSchema,
    outputSchema: ConductRaffleOutputSchema,
  },
  async ({ coupons, numberOfWinners }) => {
    // We are no longer using the LLM to pick winners.
    // Instead, we use a cryptographically secure shuffle to ensure fairness.
    const shuffledCoupons = secureShuffle(coupons);
    const winningCoupons = shuffledCoupons.slice(0, numberOfWinners);
    
    return { winningCoupons };
  }
);
