// src/ai/flows/suggest-opportunities.ts
'use server';

/**
 * @fileOverview A flow for suggesting capitalization opportunities based on AI trends.
 *
 * - suggestCapitalizationOpportunities - A function that suggests capitalization opportunities.
 * - SuggestCapitalizationOpportunitiesInput - The input type for the suggestCapitalizationOpportunities function.
 * - SuggestCapitalizationOpportunitiesOutput - The return type for the suggestCapitalizationOpportunities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCapitalizationOpportunitiesInputSchema = z.object({
  aiTrends: z
    .string()
    .describe('A summary of the top AI trends of the week.'),
});
export type SuggestCapitalizationOpportunitiesInput = z.infer<typeof SuggestCapitalizationOpportunitiesInputSchema>;

const SuggestCapitalizationOpportunitiesOutputSchema = z.object({
  serviceOfferings: z.array(z.string()).describe('Recommended new service offerings based on the AI trends.'),
  partnershipOpportunities: z
    .array(z.string())
    .describe('Potential partnership opportunities based on the AI trends.'),
  targetClients: z
    .array(z.string())
    .describe('Target client profiles or industries that are most receptive to these new trends.'),
  actionableSteps: z
    .array(z.string())
    .describe('Initial, practical steps the team can take to capitalize on these opportunities. Each step should be a complete sentence.'),
});
export type SuggestCapitalizationOpportunitiesOutput = z.infer<typeof SuggestCapitalizationOpportunitiesOutputSchema>;

export async function suggestCapitalizationOpportunities(
  input: SuggestCapitalizationOpportunitiesInput
): Promise<SuggestCapitalizationOpportunitiesOutput> {
  return suggestCapitalizationOpportunitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCapitalizationOpportunitiesPrompt',
  input: {schema: SuggestCapitalizationOpportunitiesInputSchema},
  output: {schema: SuggestCapitalizationOpportunitiesOutputSchema},
  prompt: `You are a strategy consultant specializing in AI. Based on the following AI trends, suggest concrete recommendations for where and how our consulting company can capitalize.
Include the following sections:
1.  Service Offering Ideas: List specific new services the company could offer.
2.  Potential Partnership Opportunities: Identify types of partners and the rationale for partnering.
3.  Target Client Profiles or Industries: Describe the ideal customers or sectors to focus on.
4.  Actionable Steps: Suggest initial, practical steps the team can take. Ensure each actionable step is a complete, concise, and well-formed sentence providing a clear action.

AI Trends:
{{{aiTrends}}}

Provide the output in the specified JSON format.`,
});

const suggestCapitalizationOpportunitiesFlow = ai.defineFlow(
  {
    name: 'suggestCapitalizationOpportunitiesFlow',
    inputSchema: SuggestCapitalizationOpportunitiesInputSchema,
    outputSchema: SuggestCapitalizationOpportunitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
