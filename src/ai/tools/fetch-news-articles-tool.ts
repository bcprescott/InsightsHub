/**
 * @fileOverview A Genkit tool to fetch AI-related news articles.
 *
 * - fetchNewsArticlesTool - A tool that simulates fetching news articles based on a time period.
 * - FetchNewsArticlesInput - The input type for the tool.
 * - Article - The type for a single news article.
 * - FetchNewsArticlesOutput - The output type for the tool, returning a list of articles.
 *
 * Note: This tool currently returns mock data for demonstration purposes.
 */
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FetchNewsArticlesInputSchema = z.object({
  timePeriod: z.string().describe("The time period for which to fetch news, e.g., 'past 24 hours', 'today'.").default('past 24 hours'),
});
export type FetchNewsArticlesInput = z.infer<typeof FetchNewsArticlesInputSchema>;

const ArticleSchema = z.object({
  title: z.string().describe('The title of the news article.'),
  url: z.string().url().describe('The URL of the news article.'),
  snippet: z.string().describe('A short snippet or summary of the article.'),
  publishedDate: z.string().describe('The publication date of the article (ISO 8601 format).'),
  source: z.string().describe('The source or publisher of the news article.'),
});
export type Article = z.infer<typeof ArticleSchema>;

const FetchNewsArticlesOutputSchema = z.object({
  articles: z.array(ArticleSchema).describe('A list of fetched news articles.'),
});
export type FetchNewsArticlesOutput = z.infer<typeof FetchNewsArticlesOutputSchema>;

export const fetchNewsArticlesTool = ai.defineTool(
  {
    name: 'fetchNewsArticlesTool',
    description: 'Fetches recent AI-related news articles from various sources for a given time period. Useful for understanding current AI trends.',
    inputSchema: FetchNewsArticlesInputSchema,
    outputSchema: FetchNewsArticlesOutputSchema,
  },
  async (input: FetchNewsArticlesInput): Promise<FetchNewsArticlesOutput> => {
    // In a real application, this would involve calling a news API (e.g., NewsAPI, Google News API)
    // and filtering for AI-related content within the specified timePeriod.
    // For now, we return mock data.
    console.log(`Fetching news for period: ${input.timePeriod}`);

    const currentDate = new Date();
    
    // Helper function to get a date N days ago from current date
    // For daily trends, we'll make these very recent.
    const getDateHoursAgo = (hours: number): Date => {
      const date = new Date();
      date.setHours(currentDate.getHours() - hours);
      return date;
    };

    const mockArticles: Article[] = [
      {
        title: 'New AI Model Achieves State-of-the-Art Results in Image Recognition',
        url: 'https://example.com/news/ai-image-recognition-sota',
        snippet: 'A research lab today unveiled an AI model that surpasses previous benchmarks in complex image recognition tasks, promising advancements in medical imaging and autonomous systems.',
        publishedDate: getDateHoursAgo(3).toISOString(), // Published 3 hours ago
        source: 'AI Research Daily',
      },
      {
        title: 'Generative AI Creates Hyper-Realistic Avatars in Real-Time',
        url: 'https://example.com/news/gen-ai-realtime-avatars',
        snippet: 'A startup demonstrated a generative AI system capable of creating and animating lifelike digital avatars in real-time, with potential applications in virtual communication and entertainment.',
        publishedDate: getDateHoursAgo(8).toISOString(), // Published 8 hours ago
        source: 'Emerging Tech Today',
      },
      {
        title: 'Debate on AI Job Displacement Intensifies After New Automation Report',
        url: 'https://example.com/news/ai-job-displacement-debate',
        snippet: 'A report released this morning forecasts significant job market shifts due to AI-driven automation, sparking renewed debate among economists and policymakers on mitigation strategies.',
        publishedDate: getDateHoursAgo(1).toISOString(), // Published 1 hour ago
        source: 'Economic Policy Journal',
      },
       {
        title: 'AI in Drug Discovery: Accelerating Timelines for New Medications',
        url: 'https://example.com/news/ai-drug-discovery-acceleration',
        snippet: 'Pharmaceutical companies are increasingly leveraging AI to shorten drug discovery timelines, from identifying potential compounds to predicting trial outcomes, as highlighted in a conference today.',
        publishedDate: getDateHoursAgo(12).toISOString(), // Published 12 hours ago
        source: 'PharmaTech News',
      },
    ];

    // If input.timePeriod is specific, e.g., "past 24 hours", filter accordingly.
    // For this mock, we'll assume all generated articles are within "past 24 hours".
    return { articles: mockArticles };
  }
);
