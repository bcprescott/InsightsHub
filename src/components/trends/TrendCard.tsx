import type { Trend } from '@/types';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, BarChart2, Briefcase, Users, MessageCircle } from 'lucide-react';

interface TrendCardProps {
  trend: Trend;
}

const TrendCardComponent = ({ trend }: TrendCardProps) => {
  const trendDataForUrl = {
    id: trend.id,
    title: trend.title,
    summary: trend.summary,
    category: trend.category,
  };
  const strategyLink = `/strategies?trendData=${encodeURIComponent(JSON.stringify(trendDataForUrl))}`;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold text-primary">{trend.title}</CardTitle>
          <Badge variant="outline" className="text-sm">{trend.category}</Badge>
        </div>
        <CardDescription>{trend.date} - Date of Analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{trend.summary}</p>
        
        <Tabs defaultValue="customerImpact" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="customerImpact">
              <Users className="mr-2 h-4 w-4" /> Customer Impact
            </TabsTrigger>
            <TabsTrigger value="consultingPositioning">
              <Briefcase className="mr-2 h-4 w-4" /> Consulting Positioning
            </TabsTrigger>
          </TabsList>
          <TabsContent value="customerImpact">
            <div className="space-y-3">
              {trend.customerImpact.map((ci, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-md">
                  <h4 className="font-medium text-foreground">{ci.industry}</h4>
                  <p className="text-sm text-muted-foreground">{ci.impactAnalysis}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="consultingPositioning">
            <div className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-md">
                <h4 className="font-medium text-foreground">Strategic Advice</h4>
                <p className="text-sm text-muted-foreground">{trend.consultingPositioning.strategicAdvice}</p>
              </div>
              {trend.consultingPositioning.newServices && trend.consultingPositioning.newServices.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-md">
                  <h4 className="font-medium text-foreground">New Service Opportunities</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {trend.consultingPositioning.newServices.map((service, i) => <li key={i}>{service}</li>)}
                  </ul>
                </div>
              )}
              {trend.consultingPositioning.talkingPoints && trend.consultingPositioning.talkingPoints.length > 0 && (
                 <div className="p-3 bg-muted/50 rounded-md">
                  <h4 className="font-medium text-foreground"><MessageCircle className="inline mr-2 h-4 w-4" />Key Talking Points</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {trend.consultingPositioning.talkingPoints.map((point, i) => <li key={i}>{point}</li>)}
                  </ul>
                </div>
              )}
              {trend.consultingPositioning.risksOrLimitations && trend.consultingPositioning.risksOrLimitations.length > 0 && (
                <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
                  <h4 className="font-medium text-destructive">Risks & Limitations</h4>
                  <ul className="list-disc list-inside text-sm text-destructive/80">
                    {trend.consultingPositioning.risksOrLimitations.map((risk, i) => <li key={i}>{risk}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {(trend.momentum || trend.marketSize) && <Separator className="my-4" />}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {trend.momentum && (
            <div className="flex items-center">
              <BarChart2 className="h-4 w-4 mr-1 text-primary" /> Momentum: {trend.momentum}/100
            </div>
          )}
          {trend.marketSize && (
            <div>Market Size (Est.): <span className="font-semibold text-foreground">{trend.marketSize}</span></div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Link href={strategyLink} passHref legacyBehavior>
          <Button variant="outline" className="w-full">
            View Capitalization Strategies <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export const TrendCard = React.memo(TrendCardComponent);
TrendCard.displayName = 'TrendCard';
