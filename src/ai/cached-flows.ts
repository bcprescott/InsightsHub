// src/ai/cached-flows.ts
'use server';

import { cache } from 'react';
import {
  generateAiTrends as originalGenerateAiTrends,
  type GenerateAiTrendsInput,
  type GenerateAiTrendsOutput,
} from '@/ai/flows/generate-ai-trends-flow';
import {
  suggestCapitalizationOpportunities as originalSuggestCapitalizationOpportunities,
  type SuggestCapitalizationOpportunitiesInput,
  type SuggestCapitalizationOpportunitiesOutput,
} from '@/ai/flows/suggest-opportunities';

// Simple in-memory cache store
interface CacheStore {
  trends?: { input: GenerateAiTrendsInput; output: GenerateAiTrendsOutput; timestamp: number };
  opportunities?: Map<string, { input: SuggestCapitalizationOpportunitiesInput; output: SuggestCapitalizationOpportunitiesOutput; timestamp: number }>;
}

const globalCache: CacheStore = {
  opportunities: new Map(),
};
// Cache duration: 1 hour. For weekly trends, this could be longer.
const CACHE_DURATION_MS = 60 * 60 * 1000; 

/**
 * Cached version of the generateAiTrends flow.
 * Uses a simple in-memory cache that persists across requests on the same server instance.
 * React.cache is still used for deduplication within a single render pass.
 */
export const generateAiTrendsCached = cache(
  async (input: GenerateAiTrendsInput): Promise<GenerateAiTrendsOutput> => {
    const now = Date.now();
    if (
      globalCache.trends &&
      JSON.stringify(globalCache.trends.input) === JSON.stringify(input) &&
      (now - globalCache.trends.timestamp) < CACHE_DURATION_MS
    ) {
      console.log('Serving trends from global cache');
      return globalCache.trends.output;
    }

    console.log('Fetching new trends from AI for generateAiTrendsCached');
    const output = await originalGenerateAiTrends(input);
    globalCache.trends = { input, output, timestamp: now };
    // Clear opportunities cache as trends have been updated
    globalCache.opportunities = new Map(); 
    console.log('Trends fetched and opportunities cache cleared.');
    return output;
  }
);

/**
 * Cached version of the suggestCapitalizationOpportunities flow.
 * Uses a simple in-memory cache that persists across requests on the same server instance.
 * React.cache is still used for deduplication within a single render pass.
 */
export const suggestCapitalizationOpportunitiesCached = cache(
  async (input: SuggestCapitalizationOpportunitiesInput): Promise<SuggestCapitalizationOpportunitiesOutput> => {
    const now = Date.now();
    // Create a stable cache key. Consider hashing if input gets very large or complex.
    const cacheKey = JSON.stringify(input.aiTrends); 

    const cachedEntry = globalCache.opportunities?.get(cacheKey);
    if (
      cachedEntry &&
      JSON.stringify(cachedEntry.input) === JSON.stringify(input) &&
      (now - cachedEntry.timestamp) < CACHE_DURATION_MS
    ) {
      console.log(`Serving opportunities for trend summary (first 30 chars): '${input.aiTrends.substring(0, 30)}...' from global cache`);
      return cachedEntry.output;
    }

    console.log(`Fetching new opportunities from AI for trend summary (first 30 chars): '${input.aiTrends.substring(0, 30)}...'`);
    const output = await originalSuggestCapitalizationOpportunities(input);
    globalCache.opportunities?.set(cacheKey, { input, output, timestamp: now });
    return output;
  }
);


/**
 * Primes the AI data cache by fetching trends and their corresponding opportunities.
 * This function is intended to be called once on initial application load (e.g., from the dashboard page).
 */
export async function primeAiDataCache(
  trendsInput: GenerateAiTrendsInput
): Promise<{ trends: GenerateAiTrendsOutput; opportunities: Array<{ trendId: string; data: SuggestCapitalizationOpportunitiesOutput | null }> }> {
  console.log('Attempting to prime AI Data Cache...');
  
  // Fetch trends. This will use generateAiTrendsCached, which checks/updates the global cache.
  const trends = await generateAiTrendsCached(trendsInput);
  let allOpportunities: Array<{ trendId: string; data: SuggestCapitalizationOpportunitiesOutput | null }> = [];

  if (trends && trends.length > 0) {
    console.log(`Cache primed with ${trends.length} trends. Now fetching opportunities...`);
    const opportunityPromises = trends.map(async (trend) => {
      // Construct a consistent summary for caching and fetching.
      const aiTrendsSummary = `Trend Title: ${trend.title}\nSummary: ${trend.summary}\nCategory: ${trend.category}\nCustomer Impact Highlights: ${trend.customerImpact.slice(0,1).map(ci => `${ci.industry}: ${ci.impactAnalysis}`).join(', ')}`;
      try {
        // Fetch opportunities. This uses suggestCapitalizationOpportunitiesCached.
        const opportunityData = await suggestCapitalizationOpportunitiesCached({ aiTrends: aiTrendsSummary });
        return { trendId: trend.id, data: opportunityData };
      } catch (e) {
        console.warn(`Failed to generate opportunities for trend ${trend.id} during cache priming:`, e);
        return { trendId: trend.id, data: null }; // Store null if an error occurs for a specific trend
      }
    });
    allOpportunities = await Promise.all(opportunityPromises);
    console.log(`Opportunities fetched for ${allOpportunities.filter(op => op.data !== null).length} trends.`);
  } else {
    console.log('No trends found to prime opportunities cache.');
  }
  
  console.log('AI Data Cache priming process complete.');
  return { trends, opportunities: allOpportunities };
}
