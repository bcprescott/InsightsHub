
import type { Trend, LearningResource } from '@/types/zodSchemas'; 
import type { GenerateAiTrendsInput } from '@/ai/flows/generate-ai-trends-flow';
import type { SuggestCapitalizationOpportunitiesOutput } from '@/ai/flows/suggest-opportunities';

import { primeAiDataCache, generateAiTrendsCached, suggestCapitalizationOpportunitiesCached, generateLearningResourcesCached } from '@/ai/cached-flows'; 

import { SectionHeader } from '@/components/shared/SectionHeader';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Lightbulb, Target, BookOpen, Terminal, AlertTriangle, ListChecks, Briefcase } from 'lucide-react';
import { DEFAULT_NUMBER_OF_TRENDS_TO_FETCH } from '@/lib/constants';
import React from 'react';


export default async function DashboardPage() {
  let error: string | null = null;

  const trendInputParams: GenerateAiTrendsInput = {
    timePeriod: "past 24 hours", 
    numberOfTrends: DEFAULT_NUMBER_OF_TRENDS_TO_FETCH,
  };

  // Attempt to get all data from primeAiDataCache
  let { 
    trends, 
    opportunities: allOpportunities, 
    resources: dynamicallyGeneratedResources 
  } = await primeAiDataCache(trendInputParams).catch(e => {
    console.error("DashboardPage: Error during primeAiDataCache:", e);
    error = e instanceof Error ? e.message : "An unknown error occurred during initial data priming.";
    return { trends: [], opportunities: [], resources: [] }; // Return empty structure on error
  });

  // Fallback strategy: If priming got trends, but other specific data is missing, try to fetch just that.
  if (trends && trends.length > 0) {
    // Check and fetch opportunities if missing or all are null
    const opportunitiesAreEffectivelyMissing = !allOpportunities || allOpportunities.length === 0 || allOpportunities.every(op => op.data === null);
    if (opportunitiesAreEffectivelyMissing) {
      console.log("DashboardPage: Opportunities missing or empty after priming, attempting direct fetch for opportunities.");
      try {
        const opportunityPromises = trends.map(async (trend) => {
          const aiTrendsSummary = `Trend Title: ${trend.title}\nSummary: ${trend.summary}\nCategory: ${trend.category}\nCustomer Impact Highlights: ${trend.customerImpact.slice(0,1).map(ci => `${ci.industry}: ${ci.impactAnalysis}`).join(', ')}`;
          const opportunityData = await suggestCapitalizationOpportunitiesCached({ aiTrends: aiTrendsSummary });
          return { trendId: trend.id, data: opportunityData };
        });
        allOpportunities = await Promise.all(opportunityPromises);
      } catch (e) {
        console.warn(`DashboardPage: Fallback - Failed to generate opportunities:`, e);
        if (!error) error = e instanceof Error ? e.message : "Failed to fetch opportunities in fallback.";
        // allOpportunities might remain as initially set or partially filled
      }
    }

    // Check and fetch resources if missing
    const resourcesAreMissing = !dynamicallyGeneratedResources || dynamicallyGeneratedResources.length === 0;
    if (resourcesAreMissing) {
      console.log("DashboardPage: Resources missing after priming, attempting direct fetch for resources.");
      try {
        const resourcePromises = trends.map(async (trend) => {
          const resourcesOutput = await generateLearningResourcesCached({
            trendTitle: trend.title,
            trendSummary: trend.summary,
            trendCategory: trend.category,
            numberOfResources: 3, // Fetch 3 resources per trend for dashboard display
          });
          return resourcesOutput.map(res => ({ ...res, trendId: trend.id }));
        });
        dynamicallyGeneratedResources = (await Promise.all(resourcePromises)).flat();
        console.log(`DashboardPage: Fallback fetched ${dynamicallyGeneratedResources.length} resources.`);
      } catch (e) {
         console.warn(`DashboardPage: Fallback - Failed to generate learning resources:`, e);
         if (!error) error = e instanceof Error ? e.message : "Failed to fetch learning resources in fallback.";
         // dynamicallyGeneratedResources will remain as it was (likely empty)
      }
    }
  } else if (!error) { 
    // This case means primeAiDataCache returned no trends, and no prior error was set.
    console.log("DashboardPage: primeAiDataCache returned no trends. Dashboard will be sparse or show no data messages.");
    // No further fallbacks here if trends themselves are missing from the primary source.
    // The `trends`, `allOpportunities`, `dynamicallyGeneratedResources` will be empty arrays from initial destructuring default.
  }


  const displayOpportunities = allOpportunities.find(op => op.data !== null)?.data ?? null;
  const displayTrends = trends.slice(0, DEFAULT_NUMBER_OF_TRENDS_TO_FETCH);
  // Ensure dynamicallyGeneratedResources is an array before slicing
  const featuredResources = Array.isArray(dynamicallyGeneratedResources) ? dynamicallyGeneratedResources.slice(0, 3) : [];


  return (
    <div className="w-full max-w-screen-xl pt-0 pb-8">
      <SectionHeader
        title="AI Insights Hub Dashboard"
        description="Your central overview of the latest AI intelligence, strategic recommendations, and learning resources for today."
      />

      {error && (
        <Alert variant="destructive" className="my-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>
            Could not load all dashboard data at this time. Some sections may be unavailable. Please try refreshing.
            <br />
            <span className="text-xs">Details: {error}</span>
          </AlertDescription>
        </Alert>
      )}

      {!error && displayTrends.length === 0 && !displayOpportunities && featuredResources.length === 0 && (
         <Alert variant="default" className="my-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            Currently, there is no data to display on the dashboard. This could be due to no recent trends being generated or other system activities. Please check back later. If this persists, AI trend generation might be encountering issues.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3">
        <DashboardSection
          title="Key AI Trends Today"
          icon={<Lightbulb className="h-5 w-5 text-primary" />}
          viewAllLink="/trends"
          isLoading={false} 
        >
          {displayTrends.length > 0 ? (
            <ul className="space-y-3">
              {displayTrends.map(trend => (
                <li key={trend.id}>
                  <Link href={`/trends?trendId=${encodeURIComponent(trend.id)}`} title={trend.summary} className="block font-medium text-foreground hover:text-primary transition-colors">
                    {trend.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {trend.summary.substring(0, 150)}{trend.summary.length > 150 ? '...' : ''}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            !error && <p className="text-sm text-muted-foreground">No key AI trends identified for today.</p>
          )}
        </DashboardSection>

        <DashboardSection
          title="Strategic Recommendations"
          icon={<Target className="h-5 w-5 text-primary" />}
          viewAllLink="/strategies"
          isLoading={false} 
        >
          {displayOpportunities ? (
            <div className="space-y-4">
              {displayOpportunities.serviceOfferings && displayOpportunities.serviceOfferings.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center">
                    <Briefcase className="h-3 w-3 mr-1.5" /> New Service Offerings
                  </h4>
                  <ul className="space-y-1 list-disc list-inside pl-1">
                    {displayOpportunities.serviceOfferings.slice(0, 2).map((offering, index) => (
                      <li key={`so-${index}`} className="text-sm text-foreground">{offering}</li>
                    ))}
                  </ul>
                </div>
              )}
              {displayOpportunities.actionableSteps && displayOpportunities.actionableSteps.length > 0 && (
                 <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center">
                    <ListChecks className="h-3 w-3 mr-1.5" /> Key Actionable Steps
                  </h4>
                  <ul className="space-y-1 list-disc list-inside pl-1">
                    {displayOpportunities.actionableSteps.slice(0, 2).map((step, index) => (
                      <li key={`as-${index}`} className="text-sm text-foreground">{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(!displayOpportunities.serviceOfferings || displayOpportunities.serviceOfferings.length === 0) && 
               (!displayOpportunities.actionableSteps || displayOpportunities.actionableSteps.length === 0) && (
                <p className="text-sm text-muted-foreground">No specific strategic recommendations generated at this time.</p>
              )}
            </div>
          ) : (
            !error && <p className="text-sm text-muted-foreground">No strategic recommendations available currently.</p>
          )}
        </DashboardSection>

        <DashboardSection
          title="Featured Learning Resources"
          icon={<BookOpen className="h-5 w-5 text-primary" />}
          viewAllLink="/resources"
          isLoading={false} 
        >
          {featuredResources.length > 0 ? (
            <ul className="space-y-2">
              {featuredResources.map(resource => (
                <li key={resource.id} className="text-sm text-foreground hover:text-primary transition-colors">
                   <Link href={resource.url} target="_blank" rel="noopener noreferrer" title={resource.summary || resource.title}>
                    {resource.title} <span className="text-xs text-muted-foreground">({resource.type})</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
             !error && <p className="text-sm text-muted-foreground">No featured learning resources generated for today's trends.</p>
          )}
        </DashboardSection>
      </div>
    </div>
  );
}
