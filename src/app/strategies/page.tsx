import type { CapitalizationStrategy, Trend } from '@/types';
import type { SuggestCapitalizationOpportunitiesOutput } from '@/ai/flows/suggest-opportunities';

import { SectionHeader } from '@/components/shared/SectionHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { StrategyCard } from '@/components/strategies/StrategyCard';
import { generateAiTrends, type GenerateAiTrendsInput } from '@/ai/flows/generate-ai-trends-flow';
import { suggestCapitalizationOpportunities } from '@/ai/flows/suggest-opportunities';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

// Helper function to map SuggestCapitalizationOpportunitiesOutput to CapitalizationStrategy
const mapOpportunitiesToStrategy = (
  opportunities: SuggestCapitalizationOpportunitiesOutput,
  trend: Trend
): CapitalizationStrategy => {
  return {
    id: `strategy-${trend.id}`,
    trendId: trend.id,
    title: `Capitalization Strategy for: ${trend.title}`,
    description: `Strategic recommendations to capitalize on the AI trend titled "${trend.title}". This strategy explores potential new services, partnerships, target clients, and actionable steps.`,
    date: trend.date,
    newServiceOffering: opportunities.serviceOfferings.length > 0
      ? {
          name: opportunities.serviceOfferings[0], // Take the first suggested offering
          scope: 'To be defined based on detailed analysis.', // Generic scope
          valueProposition: 'Leverages insights from the AI trend to deliver value.', // Generic VP
        }
      : undefined,
    partnershipOpportunities: opportunities.partnershipOpportunities.map(opp => ({
      partnerType: 'AI/Tech Partner', // Generic partner type
      rationale: opp,
      potentialPartners: [], // Not provided by current flow
    })),
    targetClients: opportunities.targetClients.map(clientProfile => ({
      industry: 'Various', // Generic industry
      profile: clientProfile,
    })),
    actionableSteps: opportunities.actionableSteps.map(step => ({
      step: step,
      priority: 'Medium', // Default priority
    })),
  };
};

export default async function StrategiesPage({ searchParams }: { searchParams?: { trendId?: string, query?: string } }) {
  let strategies: CapitalizationStrategy[] = [];
  let error: string | null = null;
  let isLoading = true;

  try {
    // Step 1: Fetch AI trends
    const trendInput: GenerateAiTrendsInput = {
      timePeriod: "past week",
      numberOfTrends: 5, // Fetch a reasonable number of trends to generate strategies for
    };
    const fetchedTrends = await generateAiTrends(trendInput);

    if (fetchedTrends && fetchedTrends.length > 0) {
      // Step 2: For each trend, generate capitalization opportunities
      for (const trend of fetchedTrends) {
        const opportunitiesInput = {
          aiTrends: `Trend Title: ${trend.title}\nSummary: ${trend.summary}\nCategory: ${trend.category}`, // Focus on a single trend
        };
        try {
          const opportunitiesOutput = await suggestCapitalizationOpportunities(opportunitiesInput);
          if (opportunitiesOutput) {
            const strategy = mapOpportunitiesToStrategy(opportunitiesOutput, trend);
            strategies.push(strategy);
          }
        } catch (oppError) {
          console.warn(`Failed to generate strategy for trend "${trend.title}":`, oppError);
          // Optionally, add a placeholder or error strategy, or just skip
        }
      }
    }
  } catch (e) {
    console.error("Failed to load strategies data:", e);
    error = e instanceof Error ? e.message : "An unknown error occurred while fetching strategies.";
  } finally {
    isLoading = false;
  }

  // Apply filters if searchParams exist
  let displayedStrategies = strategies;
  if (searchParams?.trendId) {
    displayedStrategies = displayedStrategies.filter(s => s.trendId === searchParams.trendId);
  }

  if (searchParams?.query) {
    const query = searchParams.query.toLowerCase();
    displayedStrategies = displayedStrategies.filter(strategy =>
      strategy.title.toLowerCase().includes(query) ||
      strategy.description.toLowerCase().includes(query) ||
      (strategy.newServiceOffering?.name.toLowerCase().includes(query)) ||
      (strategy.targetClients?.some(tc => tc.industry.toLowerCase().includes(query) || tc.profile.toLowerCase().includes(query)))
    );
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
          {searchParams?.trendId && <p className="text-sm text-muted-foreground">Try selecting a different trend or viewing all strategies.</p>}
           {!searchParams?.query && !searchParams?.trendId && <p className="text-sm text-muted-foreground">This may be because no AI trends were identified or strategies could not be generated for them.</p>}
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
