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
import {
  generateLearningResources as originalGenerateLearningResources,
  type GenerateLearningResourcesInput,
  type GenerateLearningResourcesOutput,
} from '@/ai/flows/generate-learning-resources-flow';
import type { LearningResource } from '@/types/zodSchemas';


// Simple in-memory cache store
interface CacheStore {
  trends?: { input: GenerateAiTrendsInput; output: GenerateAiTrendsOutput; timestamp: number };
  opportunities?: Map<string, { input: SuggestCapitalizationOpportunitiesInput; output: SuggestCapitalizationOpportunitiesOutput; timestamp: number }>;
  resources?: Map<string, { input: GenerateLearningResourcesInput; output: GenerateLearningResourcesOutput; timestamp: number }>;
}

const globalCache: CacheStore = {
  opportunities: new Map(),
  resources: new Map(),
};
// Cache duration: 1 hour. For daily trends, this could be shorter for frequent updates or longer if daily generation is sufficient.
const CACHE_DURATION_MS = 60 * 60 * 1000; 

/**
 * Cached version of the generateAiTrends flow.
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
    // Clear opportunities and resources cache as trends have been updated
    globalCache.opportunities = new Map(); 
    globalCache.resources = new Map();
    console.log('Trends fetched. Opportunities and resources cache cleared.');
    return output;
  }
);

/**
 * Cached version of the suggestCapitalizationOpportunities flow.
 */
export const suggestCapitalizationOpportunitiesCached = cache(
  async (input: SuggestCapitalizationOpportunitiesInput): Promise<SuggestCapitalizationOpportunitiesOutput> => {
    const now = Date.now();
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
 * Cached version of the generateLearningResources flow.
 */
export const generateLearningResourcesCached = cache(
  async (input: GenerateLearningResourcesInput): Promise<GenerateLearningResourcesOutput> => {
    const now = Date.now();
    const cacheKey = JSON.stringify({ trendTitle: input.trendTitle, trendSummary: input.trendSummary }); // Cache based on trend content

    const cachedEntry = globalCache.resources?.get(cacheKey);
    if (
      cachedEntry &&
      JSON.stringify(cachedEntry.input.trendTitle) === JSON.stringify(input.trendTitle) && // Be more specific with comparison
      JSON.stringify(cachedEntry.input.trendSummary) === JSON.stringify(input.trendSummary) &&
      (now - cachedEntry.timestamp) < CACHE_DURATION_MS
    ) {
      console.log(`Serving learning resources for trend '${input.trendTitle}' from global cache`);
      return cachedEntry.output;
    }

    console.log(`Fetching new learning resources from AI for trend '${input.trendTitle}'`);
    const output = await originalGenerateLearningResources(input);
    globalCache.resources?.set(cacheKey, { input, output, timestamp: now });
    return output;
  }
);


/**
 * Primes the AI data cache by fetching trends, their corresponding opportunities, and relevant learning resources.
 * This function is intended to be called once on initial application load (e.g., from the dashboard page).
 */
export async function primeAiDataCache(
  trendsInput: GenerateAiTrendsInput
): Promise<{ 
  trends: GenerateAiTrendsOutput; 
  opportunities: Array<{ trendId: string; data: SuggestCapitalizationOpportunitiesOutput | null }>;
  resources: LearningResource[]; // Changed to be a flat array of all resources
}> {
  console.log('Attempting to prime AI Data Cache...');
  
  const trends = await generateAiTrendsCached(trendsInput);
  let allOpportunities: Array<{ trendId: string; data: SuggestCapitalizationOpportunitiesOutput | null }> = [];
  let allLearningResources: LearningResource[] = [];

  if (trends && trends.length > 0) {
    console.log(`Cache primed with ${trends.length} trends. Now fetching opportunities and resources...`);
    
    const processingPromises = trends.map(async (trend) => {
      // Prepare inputs for opportunities and resources
      const aiTrendsSummaryForOpportunities = `Trend Title: ${trend.title}\nSummary: ${trend.summary}\nCategory: ${trend.category}\nCustomer Impact Highlights: ${trend.customerImpact.slice(0,1).map(ci => `${ci.industry}: ${ci.impactAnalysis}`).join(', ')}`;
      const learningResourcesInput: GenerateLearningResourcesInput = {
        trendTitle: trend.title,
        trendSummary: trend.summary,
        trendCategory: trend.category,
        numberOfResources: 2, // Fetch 2 resources per trend for the dashboard display
      };

      let opportunityData: SuggestCapitalizationOpportunitiesOutput | null = null;
      let resourcesData: LearningResource[] | null = null;

      try {
        opportunityData = await suggestCapitalizationOpportunitiesCached({ aiTrends: aiTrendsSummaryForOpportunities });
      } catch (e) {
        console.warn(`Failed to generate opportunities for trend ${trend.id} during cache priming:`, e);
      }

      try {
        const generatedResources = await generateLearningResourcesCached(learningResourcesInput);
        // Add trendId to each resource
        resourcesData = generatedResources.map(res => ({ ...res, trendId: trend.id }));
      } catch (e) {
        console.warn(`Failed to generate learning resources for trend ${trend.id} during cache priming:`, e);
      }
      
      return { 
        opportunity: { trendId: trend.id, data: opportunityData }, 
        resources: resourcesData 
      };
    });

    const results = await Promise.all(processingPromises);

    allOpportunities = results.map(r => r.opportunity);
    results.forEach(r => {
      if (r.resources) {
        allLearningResources.push(...r.resources);
      }
    });
    
    console.log(`Opportunities fetched for ${allOpportunities.filter(op => op.data !== null).length} trends.`);
    console.log(`Learning resources fetched: ${allLearningResources.length} total resources.`);

  } else {
    console.log('No trends found to prime opportunities and resources cache.');
  }
  
  console.log('AI Data Cache priming process complete.');
  return { trends, opportunities: allOpportunities, resources: allLearningResources };
}
