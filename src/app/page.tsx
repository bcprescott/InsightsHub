import type { Trend, LearningResource } from '@/types';
import type { GenerateAiTrendsInput } from '@/ai/flows/generate-ai-trends-flow';
import type { SuggestCapitalizationOpportunitiesOutput } from '@/ai/flows/suggest-opportunities';

import { primeAiDataCache, generateAiTrendsCached, suggestCapitalizationOpportunitiesCached } from '@/ai/cached-flows'; 
import { mockResources } from '@/lib/data'; 

import { SectionHeader } from '@/components/shared/SectionHeader';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
// LoadingOverlay is now managed by Suspense in RootLayout for initial page load.
// import { LoadingOverlay } from '@/components/shared/LoadingOverlay'; 
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Lightbulb, Target, BookOpen, Terminal, AlertTriangle, ListChecks, Briefcase } from 'lucide-react';
import { DEFAULT_NUMBER_OF_TRENDS_TO_FETCH } from '@/lib/constants';
import React from 'react';


export default async function DashboardPage() {
  let trends: Trend[] = [];
  let allOpportunities: { trendId: string; data: SuggestCapitalizationOpportunitiesOutput | null }[] = [];
  let featuredResources: LearningResource[] = [];
  let error: string | null = null;

  try {
    // Define input for fetching trends
    const trendInputParams: GenerateAiTrendsInput = {
      timePeriod: "past week",
      numberOfTrends: DEFAULT_NUMBER_OF_TRENDS_TO_FETCH,
    };

    // Prime the cache and get initial data. This will make the AI calls.
    // Subsequent calls to generateAiTrendsCached and suggestCapitalizationOpportunitiesCached 
    // on other pages should hit the cache if inputs are the same and cache is not stale.
    console.log("DashboardPage: Calling primeAiDataCache");
    const primedData = await primeAiDataCache(trendInputParams);
    trends = primedData.trends;
    allOpportunities = primedData.opportunities;
    console.log(`DashboardPage: Received ${trends.length} trends and ${allOpportunities.length} opportunity sets after priming.`);


    // If, for some reason, priming didn't yield data (e.g. error during priming not caught by primeAiDataCache's internal try-catch for opportunities)
    // or if you want to ensure data is present even if priming partially fails:
    if (!trends || trends.length === 0) {
        console.log("DashboardPage: Priming returned no trends, attempting direct fetch.");
        trends = await generateAiTrendsCached(trendInputParams); // Fallback or ensure data
        if (trends.length > 0 && allOpportunities.length === 0) {
             const opportunityPromises = trends.map(async (trend) => {
                const aiTrendsSummary = `Trend Title: ${trend.title}\nSummary: ${trend.summary}\nCategory: ${trend.category}\nCustomer Impact Highlights: ${trend.customerImpact.slice(0,1).map(ci => `${ci.industry}: ${ci.impactAnalysis}`).join(', ')}`;
                try {
                const opportunityData = await suggestCapitalizationOpportunitiesCached({ aiTrends: aiTrendsSummary });
                return { trendId: trend.id, data: opportunityData };
                } catch (e) {
                console.warn(`DashboardPage: Fallback - Failed to generate opportunities for trend ${trend.id}:`, e);
                return { trendId: trend.id, data: null };
                }
            });
            allOpportunities = await Promise.all(opportunityPromises);
        }
    }


    featuredResources = mockResources.slice(0, 3);

  } catch (e) {
    console.error("DashboardPage: Failed to load dashboard data:", e);
    error = e instanceof Error ? e.message : "An unknown error occurred while fetching dashboard data.";
  }

  const displayOpportunities = allOpportunities.find(op => op.data !== null)?.data ?? null;
  const displayTrends = trends.slice(0, DEFAULT_NUMBER_OF_TRENDS_TO_FETCH); // Ensure we only display the requested number

  return (
    <div className="container mx-auto pt-0 pb-8 px-4 md:px-0">
      {/* LoadingOverlay is triggered via Suspense in layout for the initial data fetch */}

      <SectionHeader
        title="AI Insights Hub Dashboard"
        description="Your central overview of the latest AI intelligence, strategic recommendations, and learning resources."
      />

      {error && (
        <Alert variant="destructive" className="my-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>
            Could not load all dashboard data at this time. Some sections may be unavailable. Please try again later.
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
          title="Key AI Trends"
          icon={<Lightbulb className="h-5 w-5 text-primary" />}
          viewAllLink="/trends"
          isLoading={false} // Data is pre-loaded or error handled above
        >
          {displayTrends.length > 0 ? (
            <ul className="space-y-3">
              {displayTrends.map(trend => (
                <li key={trend.id}>
                  <Link href={`/trends?query=${encodeURIComponent(trend.title)}`} title={trend.summary} className="block font-medium text-foreground hover:text-primary transition-colors">
                    {trend.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {trend.summary.substring(0, 150)}{trend.summary.length > 150 ? '...' : ''}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No key AI trends identified for the past week.</p>
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
            <p className="text-sm text-muted-foreground">No strategic recommendations available currently.</p>
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
            <p className="text-sm text-muted-foreground">No featured learning resources to display.</p>
          )}
        </DashboardSection>
      </div>
    </div>
  );
}
