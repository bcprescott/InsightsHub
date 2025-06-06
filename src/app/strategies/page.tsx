

import type { CapitalizationStrategy, Trend } from '@/types';
import type { SuggestCapitalizationOpportunitiesOutput } from '@/ai/flows/suggest-opportunities';
import type { GenerateAiTrendsInput } from '@/ai/flows/generate-ai-trends-flow';

import { SectionHeader } from '@/components/shared/SectionHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { StrategyCard } from '@/components/strategies/StrategyCard';
import { generateAiTrendsCached, suggestCapitalizationOpportunitiesCached } from '@/ai/cached-flows'; 
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { DEFAULT_NUMBER_OF_TRENDS_TO_FETCH } from '@/lib/constants';

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDayFormatted = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const mapOpportunitiesToStrategy = (
  opportunities: SuggestCapitalizationOpportunitiesOutput | null,
  trend: Trend 
): CapitalizationStrategy => {
  if (!opportunities) {
    return {
      id: `strategy-failed-${trend.id}`,
      trendId: trend.id,
      title: `Strategy Generation Failed for: ${trend.title}`,
      description: `Could not generate a capitalization strategy for the AI trend titled "${trend.title}".`,
      date: trend.date, // This will be YYYY-MM-DD from the trend object
      actionableSteps: [{ step: "Review trend and attempt strategy regeneration if applicable.", priority: 'High' }],
    };
  }

  return {
    id: `strategy-${trend.id}`,
    trendId: trend.id,
    title: `Capitalization Strategy for: ${trend.title}`,
    description: `Strategic recommendations to capitalize on the AI trend titled "${trend.title}".`,
    date: trend.date, // This will be YYYY-MM-DD from the trend object
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
    })) || [{ step: 'Define specific actionable steps.', priority: 'Medium' }],
  };
};

type TrendDataFromUrl = Pick<Trend, 'id' | 'title' | 'summary' | 'category'>;

export default async function StrategiesPage({ searchParams }: { searchParams?: { trendData?: string, query?: string, trendId?: string } }) {
  let strategies: CapitalizationStrategy[] = [];
  let error: string | null = null;
  let isLoading = true;

  try {
    if (searchParams?.trendData) {
      const trendFromParams: TrendDataFromUrl = JSON.parse(decodeURIComponent(searchParams.trendData));
      const trendForStrategy: Trend = {
        ...trendFromParams,
        date: getCurrentDayFormatted(), // Use current day for strategies derived from URL params
        customerImpact: [], 
        consultingPositioning: { strategicAdvice: "Strategy derived from specific trend data." },
        momentum: 0, 
        marketSize: "N/A" 
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
      const trendInput: GenerateAiTrendsInput = {
        timePeriod: "past 24 hours", // Changed from "past week"
        numberOfTrends: DEFAULT_NUMBER_OF_TRENDS_TO_FETCH,
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
          // The 'date' for the strategy will come directly from the 'trend' object,
          // which is already formatted as YYYY-MM-DD by generateAiTrendsFlow
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

  if (searchParams?.query) {
    const query = searchParams.query.toLowerCase();
    displayedStrategies = displayedStrategies.filter(strategy =>
      strategy.title.toLowerCase().includes(query) ||
      strategy.description.toLowerCase().includes(query) ||
      (strategy.newServiceOffering?.name.toLowerCase().includes(query)) ||
      (strategy.targetClients?.some(tc => tc.industry.toLowerCase().includes(query) || tc.profile.toLowerCase().includes(query)))
    );
  }
  
  if (!searchParams?.trendData && searchParams?.trendId) {
     displayedStrategies = displayedStrategies.filter(s => s.trendId === searchParams.trendId);
  }
  
  return (
    <div className="w-full max-w-screen-xl pt-0 pb-8">
      <SectionHeader
        title="Capitalization Strategies"
        description="Discover AI-driven recommendations for new service offerings, partnerships, and actionable steps to capitalize on daily AI trends."
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
            Could not generate all capitalization strategies at this time. Some information may be incomplete.
            <br />
            <span className="text-xs">Details: {error}</span>
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && displayedStrategies.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No capitalization strategies found or generated.</p>
          {searchParams?.query && <p className="text-sm text-muted-foreground">Try different keywords or clear the search.</p>}
          {searchParams?.trendId && !searchParams?.trendData && <p className="text-sm text-muted-foreground">No strategy matched the specified trend ID.</p>}
          {!searchParams?.query && !searchParams?.trendId && !searchParams?.trendData && <p className="text-sm text-muted-foreground">No AI trends identified or strategies could be generated for today.</p>}
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
