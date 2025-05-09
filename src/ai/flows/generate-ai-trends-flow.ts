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
You are an expert AI market analyst. Your task is to identify up to {{numberOfTrends}} most impactful AI trends from the provided news summary from the past week.
For each trend, you need to provide a comprehensive analysis structured according to the output schema.
The current date is {{currentDate}}. Ensure the 'date' field for each trend reflects the current week of analysis (e.g., YYYY-Www).

News Summary:
{{{newsSummary}}}

Based on this news summary, identify and describe up to {{numberOfTrends}} AI trends. If you can identify fewer than {{numberOfTrends}} significant trends from the summary, please provide those you can identify. Ensure each trend is distinct.
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
    } else {
      // If no articles are found, it's unlikely trends can be generated.
      // We can return early, or let the LLM decide based on "No articles found."
      // console.log("No news articles found, trend generation might yield no results.");
    }

    // Step 3: Get current date and week for the prompt
    const now = new Date();
    const year = now.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    // Adjust day calculation for startOfYear.getDay() which is 0 for Sunday.
    // ISO 8601 week date: Monday is the first day of the week.
    const dayOfWeek = (startOfYear.getDay() + 6) % 7; // 0 for Monday, 1 for Tuesday .. 6 for Sunday
    const weekNumber = Math.ceil((days + dayOfWeek + 1) / 7);
    const currentWeekFormatted = `${year}-W${String(weekNumber).padStart(2, '0')}`;


    // Step 4: Call the LLM to generate trends
    const { output } = await trendGenerationPrompt({ 
      newsSummary, 
      numberOfTrends: input.numberOfTrends,
      currentDate: now.toISOString().split('T')[0] // YYYY-MM-DD format
    });

    if (!output) {
      // This case should ideally be rare if the LLM adheres to the schema or Genkit handles schema validation errors.
      console.error("Trend generation failed or returned undefined/null output from LLM.");
      return []; // Return empty array if LLM output is not as expected (e.g. not an array)
    }
    
    // Ensure date is correctly formatted and ID is generated for each trend.
    return output.map(trend => ({
      ...trend,
      id: trend.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''), // Ensure a valid slug-like ID
      date: currentWeekFormatted, // Override or set the date to current week.
    }));
  }
);