import { SectionHeader } from '@/components/shared/SectionHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { StrategyCard } from '@/components/strategies/StrategyCard';
import { mockStrategies } from '@/lib/data';
import type { CapitalizationStrategy } from '@/types';
// import { suggestCapitalizationOpportunities, type SuggestCapitalizationOpportunitiesInput } from '@/ai/flows/suggest-opportunities';

export default async function StrategiesPage({ searchParams }: { searchParams?: { trendId?: string, query?: string } }) {
  // const aiTrendsSummary = "Summary of current AI trends..."; // This would come from selected trends or overall analysis
  // const aiGeneratedStrategies: CapitalizationStrategy[] = await suggestCapitalizationOpportunities({ aiTrends: aiTrendsSummary });

  let strategies: CapitalizationStrategy[] = mockStrategies;

  if (searchParams?.trendId) {
    strategies = strategies.filter(s => s.trendId === searchParams.trendId);
  }

  if (searchParams?.query) {
    const query = searchParams.query.toLowerCase();
    strategies = strategies.filter(strategy =>
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
      
      {strategies.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No capitalization strategies available for this selection.</p>
          {searchParams?.trendId && <p className="text-sm text-muted-foreground">Try viewing all strategies or selecting a different trend.</p>}
           {searchParams?.query && <p className="text-sm text-muted-foreground">Try different keywords or clear the search.</p>}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {strategies.map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} />
          ))}
        </div>
      )}
    </div>
  );
}
