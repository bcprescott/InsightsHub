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
  timePeriod: z.string().describe("The time period for which to fetch news, e.g., 'past week', 'last 7 days'.").default('past week'),
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
    const getDateDaysAgo = (days: number): Date => {
      const date = new Date();
      date.setDate(currentDate.getDate() - days);
      return date;
    };

    const mockArticles: Article[] = [
      {
        title: 'Breakthrough in Efficient AI Model Training Techniques',
        url: 'https://example.com/news/ai-training-breakthrough',
        snippet: 'Researchers have announced a new method that significantly reduces the computational cost and time required to train large language models, potentially democratizing access to powerful AI.',
        publishedDate: getDateDaysAgo(7).toISOString(),
        source: 'AI News Today',
      },
      {
        title: 'Generative AI Adoption Skyrockets in Creative Industries',
        url: 'https://example.com/news/gen-ai-creative-boom',
        snippet: 'A new report indicates a massive surge in the use of generative AI tools for image, video, and music creation across advertising, media, and entertainment sectors.',
        publishedDate: getDateDaysAgo(3).toISOString(),
        source: 'Tech Chronicle',
      },
      {
        title: 'Ethical AI Frameworks: Call for Standardization Intensifies',
        url: 'https://example.com/news/ethical-ai-standards',
        snippet: 'Policy makers and industry leaders are increasingly calling for standardized ethical frameworks to govern the development and deployment of artificial intelligence, citing concerns over bias and misuse.',
        publishedDate: getDateDaysAgo(1).toISOString(),
        source: 'Global Policy Review',
      },
       {
        title: 'Small Language Models (SLMs) Gaining Traction in Edge Computing',
        url: 'https://example.com/news/slms-edge-computing',
        snippet: 'The development of highly efficient Small Language Models is paving the way for sophisticated AI applications directly on edge devices, reducing latency and improving privacy.',
        publishedDate: getDateDaysAgo(5).toISOString(),
        source: 'Future Tech Insights',
      },
    ];

    return { articles: mockArticles };
  }
);