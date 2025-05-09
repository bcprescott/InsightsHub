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
  timePeriod: z.string().describe("The time period for which to fetch news and generate trends, e.g., 'past 24 hours'.").default('past 24 hours'),
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
  input: { schema: z.object({ newsSummary: z.string(), numberOfTrends: z.number(), currentDateFormatted: z.string() }) },
  output: { schema: GenerateAiTrendsOutputSchema },
  tools: [fetchNewsArticlesTool], // Make the tool available if needed, though the flow calls it separately first
  prompt: `
You are an expert AI market analyst. Your task is to identify up to {{numberOfTrends}} most impactful AI trends from the provided news summary from the {{input.timePeriod}}.
For each trend, you need to provide a comprehensive analysis structured according to the output schema.
The current date is {{currentDateFormatted}}. Ensure the 'date' field for each trend reflects the current date of analysis.

News Summary:
{{{newsSummary}}}

Based on this news summary, identify and describe up to {{numberOfTrends}} AI trends. If you can identify fewer than {{numberOfTrends}} significant trends from the summary, please provide those you can identify. Ensure each trend is distinct.
For each trend, ensure you provide:
- id: A unique, human-readable slug for the trend (e.g., "ai-in-healthcare-advances").
- title: A concise and impactful title.
- summary: A detailed summary explaining the trend.
- category: A relevant category (e.g., "Generative AI", "Robotics", "AI Ethics", "Language Models").
- date: The current date of analysis in "YYYY-MM-DD" format (e.g., if today is 2024-07-15, the date is "2024-07-15"). This should be the value of 'currentDateFormatted'.
- customerImpact: An array of impacts on different industries. For each, specify the industry and the impact analysis.
- consultingPositioning: Detailed advice including strategicAdvice, newServices (optional), adaptedServices (optional), talkingPoints (optional), and risksOrLimitations (optional).
- momentum: An estimated score (0-100) of the trend's current momentum.
- marketSize: An estimated market size (e.g., "$X Billion by YYYY").

Generate the output as a JSON array conforming to the provided schema. If no trends can be identified from the summary, return an empty JSON array.
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
    let newsSummary = "No articles found for the specified period.";
    if (newsOutput.articles && newsOutput.articles.length > 0) {
      newsSummary = newsOutput.articles
        .map(article => `Title: ${article.title}\nSource: ${article.source}\nDate: ${article.publishedDate}\nSnippet: ${article.snippet}\n---\n`)
        .join('\n');
    }

    // Step 3: Get current date for the prompt in YYYY-MM-DD format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const currentDayFormatted = `${year}-${month}-${day}`;

    // Step 4: Call the LLM to generate trends
    const { output } = await trendGenerationPrompt({ 
      newsSummary, 
      numberOfTrends: input.numberOfTrends,
      currentDateFormatted: currentDayFormatted
    });

    if (!output) {
      console.error("Trend generation failed or returned undefined/null output from LLM.");
      return []; 
    }
    
    // Ensure date is correctly formatted and ID is generated for each trend.
    return output.map(trend => ({
      ...trend,
      id: trend.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''), // Ensure a valid slug-like ID
      date: currentDayFormatted, // Override or set the date to current day.
    }));
  }
);
