// src/ai/cached-flows.ts
'use server';

import { cache } from 'react';
import { generateAiTrends as originalGenerateAiTrends, type GenerateAiTrendsInput, type GenerateAiTrendsOutput } from '@/ai/flows/generate-ai-trends-flow';
import { suggestCapitalizationOpportunities as originalSuggestCapitalizationOpportunities, type SuggestCapitalizationOpportunitiesInput, type SuggestCapitalizationOpportunitiesOutput } from '@/ai/flows/suggest-opportunities';

/**
 * Cached version of the generateAiTrends flow.
 * Leverages React.cache for memoization within a single server request lifecycle.
 */
export const generateAiTrendsCached = cache(
  async (input: GenerateAiTrendsInput): Promise<GenerateAiTrendsOutput> => {
    return originalGenerateAiTrends(input);
  }
);

/**
 * Cached version of the suggestCapitalizationOpportunities flow.
 * Leverages React.cache for memoization within a single server request lifecycle.
 */
export const suggestCapitalizationOpportunitiesCached = cache(
  async (input: SuggestCapitalizationOpportunitiesInput): Promise<SuggestCapitalizationOpportunitiesOutput> => {
    return originalSuggestCapitalizationOpportunities(input);
  }
);
