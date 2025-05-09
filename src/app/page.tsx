import type { Trend, LearningResource } from '@/types';
import type { GenerateAiTrendsInput } from '@/ai/flows/generate-ai-trends-flow';
import type { SuggestCapitalizationOpportunitiesOutput } from '@/ai/flows/suggest-opportunities';

import { generateAiTrends } from '@/ai/flows/generate-ai-trends-flow';
import { suggestCapitalizationOpportunities } from '@/ai/flows/suggest-opportunities';
import { mockResources } from '@/lib/data'; // Using mock resources for now

import { SectionHeader } from '@/components/shared/SectionHeader';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lightbulb, Target, BookOpen, Terminal, AlertTriangle, ListChecks, Briefcase } from 'lucide-react';

export default async function DashboardPage() {
  let trends: Trend[] = [];
  let opportunities: SuggestCapitalizationOpportunitiesOutput | null = null;
  let featuredResources: LearningResource[] = [];
  let error: string | null = null;
  let isLoading = true;

  try {
    // Fetch trends
    const trendInput: GenerateAiTrendsInput = {
      timePeriod: "past week",
      numberOfTrends: 3, // Fetch top 3 trends for the dashboard
    };
    trends = await generateAiTrends(trendInput);

    if (trends.length > 0) {
      // Generate summary for opportunities flow
      const aiTrendsSummary = trends
        .map(t => `Trend Title: ${t.title}\nSummary: ${t.summary}\nCategory: ${t.category}\nCustomer Impact Highlights: ${t.customerImpact.slice(0,1).map(ci => `${ci.industry}: ${ci.impactAnalysis}`).join(', ')}`)
        .join('\n\n---\n\n');
      
      opportunities = await suggestCapitalizationOpportunities({ aiTrends: aiTrendsSummary });
    }

    // Fetch featured resources (e.g., top 3 by rating or newest)
    // For now, just taking the first 3 mock resources.
    featuredResources = mockResources.slice(0, 3);

  } catch (e) {
    console.error("Failed to load dashboard data:", e);
    error = e instanceof Error ? e.message : "An unknown error occurred while fetching dashboard data.";
  } finally {
    isLoading = false;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <SectionHeader
        title="AI Insights Hub Dashboard"
        description="Your central overview of the latest AI intelligence, strategic recommendations, and learning resources."
      />

      {isLoading && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading dashboard insights...</p>
        </div>
      )}

      {!isLoading && error && (
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

      {!isLoading && !error && trends.length === 0 && !opportunities && featuredResources.length === 0 && (
         <Alert variant="default" className="my-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            Currently, there is no data to display on the dashboard. This could be due to no recent trends being generated or other system activities. Please check back later.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3">
        {/* Key AI Trends Section */}
        <DashboardSection
          title="Key AI Trends"
          icon={<Lightbulb className="h-5 w-5 text-primary" />}
          viewAllLink="/trends"
          isLoading={isLoading && trends.length === 0}
        >
          {trends.length > 0 ? (
            <ul className="space-y-2">
              {trends.map(trend => (
                <li key={trend.id} className="text-sm text-foreground hover:text-primary transition-colors">
                  <Link href={`/trends?query=${encodeURIComponent(trend.title)}`} title={trend.summary}>
                    {trend.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            !isLoading && <p className="text-sm text-muted-foreground">No key AI trends identified for the past week.</p>
          )}
        </DashboardSection>

        {/* Strategic Recommendations Section */}
        <DashboardSection
          title="Strategic Recommendations"
          icon={<Target className="h-5 w-5 text-primary" />}
          viewAllLink="/strategies"
          isLoading={isLoading && !opportunities}
        >
          {opportunities ? (
            <div className="space-y-4">
              {opportunities.serviceOfferings && opportunities.serviceOfferings.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center">
                    <Briefcase className="h-3 w-3 mr-1.5" /> New Service Offerings
                  </h4>
                  <ul className="space-y-1 list-disc list-inside pl-1">
                    {opportunities.serviceOfferings.slice(0, 3).map((offering, index) => (
                      <li key={`so-${index}`} className="text-sm text-foreground">{offering}</li>
                    ))}
                  </ul>
                </div>
              )}
              {opportunities.actionableSteps && opportunities.actionableSteps.length > 0 && (
                 <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center">
                    <ListChecks className="h-3 w-3 mr-1.5" /> Key Actionable Steps
                  </h4>
                  <ul className="space-y-1 list-disc list-inside pl-1">
                    {opportunities.actionableSteps.slice(0, 3).map((step, index) => (
                      <li key={`as-${index}`} className="text-sm text-foreground">{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(!opportunities.serviceOfferings || opportunities.serviceOfferings.length === 0) && 
               (!opportunities.actionableSteps || opportunities.actionableSteps.length === 0) && (
                <p className="text-sm text-muted-foreground">No specific strategic recommendations generated at this time.</p>
              )}
            </div>
          ) : (
            !isLoading && <p className="text-sm text-muted-foreground">No strategic recommendations available currently.</p>
          )}
        </DashboardSection>

        {/* Featured Learning Resources Section */}
        <DashboardSection
          title="Featured Learning Resources"
          icon={<BookOpen className="h-5 w-5 text-primary" />}
          viewAllLink="/resources"
          isLoading={isLoading && featuredResources.length === 0}
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
            !isLoading && <p className="text-sm text-muted-foreground">No featured learning resources to display.</p>
          )}
        </DashboardSection>
      </div>
    </div>
  );
}
