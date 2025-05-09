import type { CapitalizationStrategy, Trend } from '@/types';
import type { SuggestCapitalizationOpportunitiesOutput } from '@/ai/flows/suggest-opportunities';
import type { GenerateAiTrendsInput } from '@/ai/flows/generate-ai-trends-flow';

import { SectionHeader } from '@/components/shared/SectionHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { StrategyCard } from '@/components/strategies/StrategyCard';
import { generateAiTrends } from '@/ai/flows/generate-ai-trends-flow';
import { suggestCapitalizationOpportunities } from '@/ai/flows/suggest-opportunities';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { cache } from 'react';

// Cached versions of AI flow functions
const generateAiTrendsCached = cache(generateAiTrends);
const suggestCapitalizationOpportunitiesCached = cache(suggestCapitalizationOpportunities);


// Helper function to get current week in YYYY-Www format
const getCurrentWeekFormatted = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const dayOfWeek = (startOfYear.getDay() + 6) % 7; // 0 for Monday, 1 for Tuesday .. 6 for Sunday (ISO 8601)
  const weekNumber = Math.ceil((days + dayOfWeek + 1) / 7);
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
};

// Helper function to map SuggestCapitalizationOpportunitiesOutput to CapitalizationStrategy
const mapOpportunitiesToStrategy = (
  opportunities: SuggestCapitalizationOpportunitiesOutput | null,
  trend: Trend 
): CapitalizationStrategy => {
  if (!opportunities) {
    return {
      id: `strategy-failed-${trend.id}`,
      trendId: trend.id,
      title: `Strategy Generation Failed for: ${trend.title}`,
      description: `Could not generate a capitalization strategy for the AI trend titled "${trend.title}". This may be due to an issue with the AI model or the input data.`,
      date: trend.date,
      actionableSteps: [{ step: "Review trend and attempt strategy regeneration if applicable.", priority: 'High' }],
      newServiceOffering: undefined,
      partnershipOpportunities: [],
      targetClients: [],
    };
  }

  return {
    id: `strategy-${trend.id}`,
    trendId: trend.id,
    title: `Capitalization Strategy for: ${trend.title}`,
    description: `Strategic recommendations to capitalize on the AI trend titled "${trend.title}". This strategy explores potential new services, partnerships, target clients, and actionable steps.`,
    date: trend.date,
    newServiceOffering: opportunities.serviceOfferings && opportunities.serviceOfferings.length > 0
      ? {
          name: opportunities.serviceOfferings[0],
          scope: 'To be defined based on detailed analysis.',
          valueProposition: 'Leverages insights from the AI trend to deliver value.',
        }
      : undefined,
    partnershipOpportunities: opportunities.partnershipOpportunities?.map(opp => ({
      partnerType: 'AI/Tech Partner',
      rationale: opp,
      potentialPartners: [],
    })) || [],
    targetClients: opportunities.targetClients?.map(clientProfile => ({
      industry: 'Various',
      profile: clientProfile,
    })) || [],
    actionableSteps: opportunities.actionableSteps?.map(step => ({
      step: step,
      priority: 'Medium',
    })) || [{ step: 'Define specific actionable steps based on the generated opportunities.', priority: 'Medium' }],
  };
};

type TrendDataFromUrl = Pick<Trend, 'id' | 'title' | 'summary' | 'category'>;

export default async function StrategiesPage({ searchParams }: { searchParams?: { trendData?: string, query?: string, trendId?: string } }) {
  let strategies: CapitalizationStrategy[] = [];
  let error: string | null = null;
  let isLoading = true;

  try {
    if (searchParams?.trendData) {
      // Generate strategy for a single trend passed in trendData
      const trendFromParams: TrendDataFromUrl = JSON.parse(decodeURIComponent(searchParams.trendData));
      
      const trendForStrategy: Trend = {
        id: trendFromParams.id,
        title: trendFromParams.title,
        summary: trendFromParams.summary,
        category: trendFromParams.category,
        date: getCurrentWeekFormatted(), // Use current week for the strategy based on this trend
        // Fill with minimal valid data for parts not directly used by mapOpportunitiesToStrategy or suggest...
        customerImpact: [], 
        consultingPositioning: { strategicAdvice: "Strategy derived from specific trend data." }, 
      };
      
      const opportunitiesInput = {
        aiTrends: `Trend Title: ${trendForStrategy.title}\nSummary: ${trendForStrategy.summary}\nCategory: ${trendForStrategy.category}`,
      };
      let opportunitiesOutput: SuggestCapitalizationOpportunitiesOutput | null = null;
      try {
        opportunitiesOutput = await suggestCapitalizationOpportunitiesCached(opportunitiesInput);
      } catch (oppError) {
        console.warn(`Failed to generate strategy for specific trend "${trendForStrategy.title}":`, oppError);
      }
      strategies = [mapOpportunitiesToStrategy(opportunitiesOutput, trendForStrategy)];

    } else {
      // Fallback: Generate strategies for top N trends
      const trendInput: GenerateAiTrendsInput = {
        timePeriod: "past week",
        numberOfTrends: 3,
      };
      const fetchedTrends = await generateAiTrendsCached(trendInput);

      if (fetchedTrends && fetchedTrends.length > 0) {
        const opportunityPromises = fetchedTrends.map(async (trend) => {
          const opportunitiesInput = {
            aiTrends: `Trend Title: ${trend.title}\nSummary: ${trend.summary}\nCategory: ${trend.category}`,
          };
          let opportunitiesOutput: SuggestCapitalizationOpportunitiesOutput | null = null;
          try {
            opportunitiesOutput = await suggestCapitalizationOpportunitiesCached(opportunitiesInput);
          } catch (oppError) {
            console.warn(`Failed to generate strategy for trend "${trend.title}":`, oppError);
          }
          return mapOpportunitiesToStrategy(opportunitiesOutput, trend);
        });
        strategies = await Promise.all(opportunityPromises);
      }
    }
  } catch (e) {
    console.error("Failed to load strategies data:", e);
    error = e instanceof Error ? e.message : "An unknown error occurred while fetching strategies.";
  } finally {
    isLoading = false;
  }

  let displayedStrategies = strategies;

  // General text query filtering - applies to either single strategy or list of N strategies
  if (searchParams?.query) {
    const query = searchParams.query.toLowerCase();
    displayedStrategies = displayedStrategies.filter(strategy =>
      strategy.title.toLowerCase().includes(query) ||
      strategy.description.toLowerCase().includes(query) ||
      (strategy.newServiceOffering?.name.toLowerCase().includes(query)) ||
      (strategy.targetClients?.some(tc => tc.industry.toLowerCase().includes(query) || tc.profile.toLowerCase().includes(query)))
    );
  }
  
  // If not coming from a specific trendData, and an old trendId param is present (e.g. manual URL), try to filter the N general strategies
  // This part is less reliable due to potential ID mismatches if trends aren't perfectly stable.
  // The trendData path is preferred for direct navigation.
  if (!searchParams?.trendData && searchParams?.trendId) {
     displayedStrategies = displayedStrategies.filter(s => s.trendId === searchParams.trendId);
  }
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <SectionHeader
        title="Capitalization Strategies"
        description="Discover AI-driven recommendations for new service offerings, partnerships, and actionable steps to capitalize on emerging AI trends."
      />
      <SearchBar placeholder="Search strategies by title, industry..." initialQuery={searchParams?.query || ''}/>
      
      {isLoading && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Generating capitalization strategies...</p>
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="destructive" className="my-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Generating Strategies</AlertTitle>
          <AlertDescription>
            Could not generate all capitalization strategies at this time. Some information may be incomplete. Please try again later.
            <br />
            <span className="text-xs">Details: {error}</span>
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && displayedStrategies.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No capitalization strategies found or generated.</p>
          {searchParams?.query && <p className="text-sm text-muted-foreground">Try different keywords or clear the search.</p>}
          {searchParams?.trendId && !searchParams?.trendData && <p className="text-sm text-muted-foreground">No strategy matched the specified trend ID from the generally generated strategies.</p>}
          {!searchParams?.query && !searchParams?.trendId && !searchParams?.trendData && <p className="text-sm text-muted-foreground">This may be because no AI trends were identified or strategies could not be generated for them.</p>}
        </div>
      )}

      {!isLoading && !error && displayedStrategies.length > 0 && (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {displayedStrategies.map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} />
          ))}
        </div>
      )}
    </div>
  );
}
