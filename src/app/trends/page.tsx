import { SectionHeader } from '@/components/shared/SectionHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { TrendCard } from '@/components/trends/TrendCard';
import type { Trend } from '@/types';
import { generateAiTrends, type GenerateAiTrendsInput } from '@/ai/flows/generate-ai-trends-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default async function TrendsPage({ searchParams }: { searchParams?: { query?: string }}) {
  let trends: Trend[] = [];
  let error: string | null = null;
  let isLoading = true; // Start with loading true

  try {
    // Define input for the trend generation flow
    const trendInput: GenerateAiTrendsInput = {
      timePeriod: "past week", // Or make this configurable
      numberOfTrends: 3, // Or make this configurable
    };
    // Fetch trends using the Genkit flow
    const generatedTrends = await generateAiTrends(trendInput);
    
    // The flow now directly returns Trend[] compatible with Trend type from @/types
    // but ensure all fields are correctly populated or handled if optional.
    // For this example, we assume generateAiTrends returns data largely compatible with our Trend type.
    // The zod schema in the flow ensures the structure.
    trends = generatedTrends as Trend[]; // Type assertion, ensure compatibility

  } catch (e) {
    console.error("Failed to fetch AI trends:", e);
    error = e instanceof Error ? e.message : "An unknown error occurred while fetching trends.";
    trends = []; // Ensure trends is an empty array on error
  } finally {
    isLoading = false; // Set loading to false after attempt
  }
  

  if (searchParams?.query) {
    const query = searchParams.query.toLowerCase();
    trends = trends.filter(trend => 
      trend.title.toLowerCase().includes(query) ||
      trend.summary.toLowerCase().includes(query) ||
      trend.category.toLowerCase().includes(query) ||
      (trend.customerImpact && trend.customerImpact.some(ci => ci.industry.toLowerCase().includes(query) || ci.impactAnalysis.toLowerCase().includes(query)))
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
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

      {!isLoading && !error && trends.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No AI trends found matching your criteria or generated for the past week.</p>
          <p className="text-sm text-muted-foreground">Please try different keywords, clear the search, or check back later.</p>
        </div>
      )}

      {!isLoading && !error && trends.length > 0 && (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          {trends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} />
          ))}
        </div>
      )}
    </div>
  );
}
