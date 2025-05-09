/**
 * @fileOverview A Genkit flow to generate AI trend analysis from fetched news articles.
 *
 * - generateAiTrends - A function that fetches news articles using a tool and then uses an LLM
 *   to identify and structure AI trends based on the `TrendSchema`.
 * - GenerateAiTrendsInput - The input type for the generateAiTrends function.
 * - GenerateAiTrendsOutput - The return type for the generateAiTrends function (an array of Trends).
 */
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchNewsArticlesTool } from '@/ai/tools/fetch-news-articles-tool';
import { TrendSchema, type Trend } from '@/types/zodSchemas';

const GenerateAiTrendsInputSchema = z.object({
  timePeriod: z.string().describe("The time period for which to fetch news and generate trends, e.g., 'past week'.").default('past week'),
  numberOfTrends: z.number().int().min(1).max(5).default(3).describe("The desired number of top trends to generate."),
});
export type GenerateAiTrendsInput = z.infer<typeof GenerateAiTrendsInputSchema>;

// The output is an array of Trend objects
const GenerateAiTrendsOutputSchema = z.array(TrendSchema);
export type GenerateAiTrendsOutput = z.infer<typeof GenerateAiTrendsOutputSchema>;


export async function generateAiTrends(input: GenerateAiTrendsInput): Promise<GenerateAiTrendsOutput> {
  return generateAiTrendsFlow(input);
}

const trendGenerationPrompt = ai.definePrompt({
  name: 'trendGenerationPrompt',
  input: { schema: z.object({ newsSummary: z.string(), numberOfTrends: z.number(), currentDate: z.string() }) },
  output: { schema: GenerateAiTrendsOutputSchema },
  tools: [fetchNewsArticlesTool], // Make the tool available if needed, though the flow calls it separately first
  prompt: `
You are an expert AI market analyst. Your task is to identify the top {{numberOfTrends}} most impactful AI trends from the provided news summary from the past week.
For each trend, you need to provide a comprehensive analysis structured according to the output schema.
The current date is {{currentDate}}. Ensure the 'date' field for each trend reflects the current week of analysis (e.g., YYYY-Www).

News Summary:
{{{newsSummary}}}

Based on this news summary, generate {{numberOfTrends}} distinct AI trends.
For each trend, ensure you provide:
- id: A unique, human-readable slug for the trend (e.g., "ai-in-healthcare-advances").
- title: A concise and impactful title.
- summary: A detailed summary explaining the trend.
- category: A relevant category (e.g., "Generative AI", "Robotics", "AI Ethics", "Language Models").
- date: The current week of analysis in "YYYY-Www" format (e.g., if today is 2024-07-15, the week is 2024-W29).
- customerImpact: An array of impacts on different industries. For each, specify the industry and the impact analysis.
- consultingPositioning: Detailed advice including strategicAdvice, newServices (optional), adaptedServices (optional), talkingPoints (optional), and risksOrLimitations (optional).
- momentum: An estimated score (0-100) of the trend's current momentum.
- marketSize: An estimated market size (e.g., "$X Billion by YYYY").

Generate the output as a JSON array conforming to the provided schema.
`,
  config: {
    temperature: 0.3, // Lower temperature for more factual and structured output
  },
});


const generateAiTrendsFlow = ai.defineFlow(
  {
    name: 'generateAiTrendsFlow',
    inputSchema: GenerateAiTrendsInputSchema,
    outputSchema: GenerateAiTrendsOutputSchema,
  },
  async (input) => {
    // Step 1: Fetch news articles using the tool
    const newsOutput = await fetchNewsArticlesTool({ timePeriod: input.timePeriod });
    
    // Step 2: Prepare the news summary for the prompt
    let newsSummary = "No articles found.";
    if (newsOutput.articles && newsOutput.articles.length > 0) {
      newsSummary = newsOutput.articles
        .map(article => `Title: ${article.title}\nSource: ${article.source}\nDate: ${article.publishedDate}\nSnippet: ${article.snippet}\n---\n`)
        .join('\n');
    }

    // Step 3: Get current date and week for the prompt
    const now = new Date();
    const year = now.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    const currentWeekFormatted = `${year}-W${String(weekNumber).padStart(2, '0')}`;


    // Step 4: Call the LLM to generate trends
    const { output } = await trendGenerationPrompt({ 
      newsSummary, 
      numberOfTrends: input.numberOfTrends,
      currentDate: now.toISOString().split('T')[0] // YYYY-MM-DD format
    });

    if (!output) {
      // Handle cases where the LLM might not return valid output,
      // though Zod validation in the prompt should catch schema mismatches.
      console.error("Trend generation failed or returned empty output.");
      return [];
    }
    
    // Ensure date is correctly formatted for each trend if LLM doesn't do it perfectly.
    // The prompt asks for YYYY-Www, so this should ideally be handled by the LLM.
    // However, as a fallback or primary setter:
    return output.map(trend => ({
      ...trend,
      id: trend.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''), // Ensure a valid slug-like ID
      date: currentWeekFormatted, // Override or set the date to current week.
    }));
  }
);