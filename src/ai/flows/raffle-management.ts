'use server';

/**
 * @fileOverview Manages the raffle process using AI to randomly select winners from a pool of coupons.
 *
 * - conductRaffle - A function that takes a list of coupons and the number of winners to select, returning a list of winning coupons.
 * - ConductRaffleInput - The input type for the conductRaffle function.
 * - ConductRaffleOutput - The return type for the conductRaffle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

const prompt = ai.definePrompt({
  name: 'conductRafflePrompt',
  input: {schema: ConductRaffleInputSchema},
  output: {schema: ConductRaffleOutputSchema},
  prompt: `You are a raffle drawing assistant. You are given a list of coupons and the number of winners to select. You must randomly select the specified number of winners from the list of coupons.

Coupons: {{{coupons}}}
Number of winners: {{{numberOfWinners}}}

Please return a JSON array of the winning coupon codes. Make sure to select each coupon only once. Do not include any coupons that are not in the provided coupon list.

Winning Coupons: `,
});

const conductRaffleFlow = ai.defineFlow(
  {
    name: 'conductRaffleFlow',
    inputSchema: ConductRaffleInputSchema,
    outputSchema: ConductRaffleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
