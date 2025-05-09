import { SectionHeader } from '@/components/shared/SectionHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { TrendCard } from '@/components/trends/TrendCard';
import type { Trend } from '@/types';
import type { GenerateAiTrendsInput } from '@/ai/flows/generate-ai-trends-flow';
import { generateAiTrendsCached } from '@/ai/cached-flows'; // Updated import
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { DEFAULT_NUMBER_OF_TRENDS_TO_FETCH } from '@/lib/constants';

export default async function TrendsPage({ searchParams }: { searchParams?: { query?: string }}) {
  let trends: Trend[] = [];
  let error: string | null = null;
  let isLoading = true; 

  try {
    const trendInput: GenerateAiTrendsInput = {
      timePeriod: "past week", 
      numberOfTrends: DEFAULT_NUMBER_OF_TRENDS_TO_FETCH, 
    };
    const generatedTrends = await generateAiTrendsCached(trendInput);
    trends = generatedTrends as Trend[]; 
  } catch (e) {
    console.error("Failed to fetch AI trends:", e);
    error = e instanceof Error ? e.message : "An unknown error occurred while fetching trends.";
    trends = []; 
  } finally {
    isLoading = false; 
  }
  
  let displayedTrends = trends;
  if (searchParams?.query) {
    const query = searchParams.query.toLowerCase();
    displayedTrends = trends.filter(trend => 
      trend.title.toLowerCase().includes(query) ||
      trend.summary.toLowerCase().includes(query) ||
      trend.category.toLowerCase().includes(query) ||
      (trend.customerImpact && trend.customerImpact.some(ci => ci.industry.toLowerCase().includes(query) || ci.impactAnalysis.toLowerCase().includes(query)))
    );
  }

  return (
    <div className="container mx-auto pt-0 pb-8 px-4 md:px-0">
      <SectionHeader
        title="Weekly AI Trend Analysis"
        description="Stay ahead with the latest AI-generated insights into market trends, customer impact, and strategic positioning for the past week."
      />
      <SearchBar placeholder="Search trends by keyword, industry..." initialQuery={searchParams?.query || ''} />
      
      {isLoading && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading latest AI trends...</p>
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="destructive" className="my-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Trends</AlertTitle>
          <AlertDescription>
            Could not load AI trends at this time. Please try again later.
            <br />
            <span className="text-xs">Details: {error}</span>
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && displayedTrends.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No AI trends found matching your criteria or generated for the past week.</p>
          <p className="text-sm text-muted-foreground">Please try different keywords, clear the search, or check back later.</p>
        </div>
      )}

      {!isLoading && !error && displayedTrends.length > 0 && (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          {displayedTrends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} />
          ))}
        </div>
      )}
    </div>
  );
}
