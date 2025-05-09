
import { SectionHeader } from '@/components/shared/SectionHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { mockResources as fallbackMockResources } from '@/lib/data'; // Keep as fallback
import type { LearningResource, Trend } from '@/types/zodSchemas';
import { generateLearningResourcesCached, generateAiTrendsCached } from '@/ai/cached-flows'; // To fetch dynamic resources
import type { GenerateAiTrendsInput } from '@/ai/flows/generate-ai-trends-flow';
import { DEFAULT_NUMBER_OF_TRENDS_TO_FETCH } from '@/lib/constants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';


export default async function ResourcesPage({ searchParams }: { searchParams?: { trendId?: string, type?: string, tag?: string, query?: string }}) {
  let resources: LearningResource[] = [];
  let error: string | null = null;
  let isLoading = true;

  try {
    // Fetch current trends to get context for resource generation
    const trendInput: GenerateAiTrendsInput = {
        timePeriod: "past 24 hours",
        numberOfTrends: DEFAULT_NUMBER_OF_TRENDS_TO_FETCH, // Fetch a few trends for context
    };
    const currentTrends: Trend[] = await generateAiTrendsCached(trendInput);

    if (currentTrends && currentTrends.length > 0) {
        const resourcePromises = currentTrends.map(async (trend) => {
            try {
                const generated = await generateLearningResourcesCached({
                    trendTitle: trend.title,
                    trendSummary: trend.summary,
                    trendCategory: trend.category,
                    numberOfResources: 3, // Fetch up to 3 resources per trend for this page
                });
                // Attach trendId to each resource for potential filtering
                return generated.map(res => ({ ...res, trendId: trend.id }));
            } catch (e) {
                console.warn(`ResourcesPage: Failed to generate resources for trend ${trend.id}:`, e);
                return []; // Return empty array on error for this trend
            }
        });
        const nestedResources = await Promise.all(resourcePromises);
        resources = nestedResources.flat();
    }

    if (resources.length === 0) {
      console.log("ResourcesPage: No dynamic resources generated, using fallback mock resources.");
      resources = fallbackMockResources; // Use mock if no dynamic ones are fetched
    }

  } catch (e) {
    console.error("ResourcesPage: Failed to load learning resources:", e);
    error = e instanceof Error ? e.message : "An unknown error occurred while fetching learning resources.";
    resources = fallbackMockResources; // Fallback to mock on major error
  } finally {
    isLoading = false;
  }


  // Filtering logic (applied to dynamically generated or mock resources)
  if (searchParams?.trendId) {
    resources = resources.filter(r => r.trendId === searchParams.trendId);
  }
  if (searchParams?.type) {
    resources = resources.filter(r => r.type.toLowerCase() === searchParams.type?.toLowerCase());
  }
  if (searchParams?.tag) {
    resources = resources.filter(r => r.tags.map(t => t.toLowerCase()).includes(searchParams.tag?.toLowerCase() || ''));
  }

  if (searchParams?.query) {
    const query = searchParams.query.toLowerCase();
    resources = resources.filter(resource => 
      resource.title.toLowerCase().includes(query) ||
      (resource.summary && resource.summary.toLowerCase().includes(query)) ||
      (resource.source && resource.source.toLowerCase().includes(query)) ||
      resource.type.toLowerCase().includes(query) ||
      resource.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  return (
    <div className="w-full max-w-screen-xl pt-0 pb-8">
      <SectionHeader
        title="Learning & Resource Curation"
        description="Curated learning paths and resources to help you stay updated on key AI trends. (Ratings are illustrative)."
      />
      <SearchBar placeholder="Search resources by title, tag, type..." initialQuery={searchParams?.query || ''}/>
      
      {isLoading && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading learning resources...</p>
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="destructive" className="my-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Resources</AlertTitle>
          <AlertDescription>
            Could not load all learning resources at this time. Displaying fallback data if available.
            <br />
            <span className="text-xs">Details: {error}</span>
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && resources.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No learning resources found matching your criteria.</p>
          <p className="text-sm text-muted-foreground">Try different search terms or filters, or check back later as new resources are generated based on daily trends.</p>
        </div>
      )}
      
      {!isLoading && resources.length > 0 && (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}
