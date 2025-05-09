// This is an AI-powered summarization tool that provides consultants with weekly AI trend analysis.

'use server';

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

const TrendInputSchema = z.object({
  newsSummary: z
    .string()
    .describe(
      'A summary of the week\'s AI news, research breakthroughs, product launches, and shifts in market sentiment.'
    ),
});
export type TrendInput = z.infer<typeof TrendInputSchema>;

const TrendOutputSchema = z.object({
  topTrends: z
    .array(z.string())
    .describe('The top 3-5 most impactful AI trends of the week.'),
  customerImpact: z
    .array(z.string())
    .describe(
      'A concise analysis of each trend\'s potential impact on enterprise customers.'
    ),
  consultingPositioning:
    z.array(z.string()).describe(
      'Recommendations for how the consulting team should strategically position itself for each trend.'
    ),
});
export type TrendOutput = z.infer<typeof TrendOutputSchema>;

export async function summarizeTrends(input: TrendInput): Promise<TrendOutput> {
  return summarizeTrendsFlow(input);
}

const trendPrompt = ai.definePrompt({
  name: 'trendPrompt',
  input: {schema: TrendInputSchema},
  output: {schema: TrendOutputSchema},
  prompt: `Here is a summary of the week's AI news and events:

{{newsSummary}}

Analyze this summary and identify the top 3-5 most impactful AI trends. For each trend, assess its potential impact on enterprise customers and recommend how our consulting team should strategically position itself. Return the trends, customer impacts, and consulting positioning as arrays of strings.`,
});

const summarizeTrendsFlow = ai.defineFlow(
  {
    name: 'summarizeTrendsFlow',
    inputSchema: TrendInputSchema,
    outputSchema: TrendOutputSchema,
  },
  async input => {
    const {output} = await trendPrompt(input);
    return output!;
  }
);