import { SectionHeader } from '@/components/shared/SectionHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { TrendCard } from '@/components/trends/TrendCard';
import { mockTrends } from '@/lib/data';
import type { Trend } from '@/types';
// Import AI flow if we want to fetch real data
// import { summarizeTrends, type TrendInput } from '@/ai/flows/summarize-trends';

export default async function TrendsPage({ searchParams }: { searchParams?: { query?: string }}) {
  // For now, use mock data.
  // In a real app, you might fetch this data or generate it.
  // const newsSummary = "Example weekly AI news summary..."; // This would come from an API or CMS
  // const aiGeneratedTrends: Trend[] = await summarizeTrends({ newsSummary });
  
  let trends: Trend[] = mockTrends;

  if (searchParams?.query) {
    const query = searchParams.query.toLowerCase();
    trends = trends.filter(trend => 
      trend.title.toLowerCase().includes(query) ||
      trend.summary.toLowerCase().includes(query) ||
      trend.category.toLowerCase().includes(query) ||
      trend.customerImpact.some(ci => ci.industry.toLowerCase().includes(query) || ci.impactAnalysis.toLowerCase().includes(query))
    );
  }

  // This is a server component, so onSearch in SearchBar needs to trigger navigation or be handled differently.
  // For simplicity, we'll rely on query params from form submission. The SearchBar component will need to be a form.
  // Or, we make this component a client component to handle stateful search.
  // For a prototype, query param based search is fine.

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <SectionHeader
        title="Weekly AI Trend Analysis"
        description="Stay ahead with the latest insights into AI market trends, customer impact, and strategic positioning."
      />
      {/* The SearchBar needs to navigate with query params or this page becomes a client component */}
      {/* For now, SearchBar will be illustrative of where search would go. Actual filtering above is based on URL query params. */}
      <SearchBar placeholder="Search trends by keyword, industry..." initialQuery={searchParams?.query || ''} />
      
      {trends.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No trends found matching your criteria.</p>
          <p className="text-sm text-muted-foreground">Please try different keywords or clear the search.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          {trends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} />
          ))}
        </div>
      )}
    </div>
  );
}
