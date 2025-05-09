import type { CapitalizationStrategy } from '@/types';
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
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Briefcase, Users, ListChecks, Handshake } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StrategyCardProps {
  strategy: CapitalizationStrategy;
}

const priorityDescriptions: Record<CapitalizationStrategy['actionableSteps'][0]['priority'], string> = {
  High: "Critical task, requires immediate attention to achieve strategic goals.",
  Medium: "Important task, should be addressed in the near term to maintain momentum.",
  Low: "Less critical task, can be addressed when time permits or as a supporting activity.",
};

const StrategyCardComponent = ({ strategy }: StrategyCardProps) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">{strategy.title}</CardTitle>
        <CardDescription>Related Trend ID: {strategy.trendId} | Date: {strategy.date}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground mb-4">{strategy.description}</p>

        {strategy.newServiceOffering && (
          <div className="mb-4 p-3 bg-muted/50 rounded-md">
            <h4 className="font-medium text-foreground flex items-center mb-1"><Briefcase className="h-4 w-4 mr-2 text-primary" /> New Service Offering</h4>
            <p className="text-sm font-semibold">{strategy.newServiceOffering.name}</p>
            <p className="text-xs text-muted-foreground mt-1"><strong>Scope:</strong> {strategy.newServiceOffering.scope}</p>
            <p className="text-xs text-muted-foreground"><strong>Value:</strong> {strategy.newServiceOffering.valueProposition}</p>
          </div>
        )}

        {strategy.partnershipOpportunities && strategy.partnershipOpportunities.length > 0 && (
          <div className="mb-4 p-3 bg-muted/50 rounded-md">
            <h4 className="font-medium text-foreground flex items-center mb-1"><Handshake className="h-4 w-4 mr-2 text-primary" /> Partnership Opportunities</h4>
            <ul className="space-y-1">
              {strategy.partnershipOpportunities.map((opp, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  <strong>{opp.partnerType}:</strong> {opp.rationale}
                  {opp.potentialPartners && opp.potentialPartners.length > 0 && (
                    <span className="text-xs"> (e.g., {opp.potentialPartners.join(', ')})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {strategy.targetClients && strategy.targetClients.length > 0 && (
          <div className="mb-4 p-3 bg-muted/50 rounded-md">
            <h4 className="font-medium text-foreground flex items-center mb-1"><Users className="h-4 w-4 mr-2 text-primary" /> Target Clients</h4>
            <ul className="space-y-1">
              {strategy.targetClients.map((client, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  <strong>{client.industry}:</strong> {client.profile}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {strategy.actionableSteps && strategy.actionableSteps.length > 0 && (
           <div className="p-3 bg-muted/50 rounded-md">
            <h4 className="font-medium text-foreground flex items-center mb-1"><ListChecks className="h-4 w-4 mr-2 text-primary" /> Actionable Steps</h4>
            <TooltipProvider>
              <ul className="space-y-1">
                {strategy.actionableSteps.map((step, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex justify-between items-center">
                    <span>{step.step}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant={step.priority === 'High' ? 'destructive' : step.priority === 'Medium' ? 'secondary' : 'outline'} 
                          className="text-xs cursor-default"
                        >
                          {step.priority}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        <p>{priorityDescriptions[step.priority]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 mt-auto">
         {/* Assuming trends are listed under /trends and individual trend pages might not exist yet.
             This link can be adjusted if individual trend pages are created e.g. /trends/${strategy.trendId} */}
        <Link href={`/trends?query=${encodeURIComponent(strategy.trendId)}`} passHref legacyBehavior>
          <Button variant="outline" className="w-full">
            View Related Trend <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export const StrategyCard = React.memo(StrategyCardComponent);
StrategyCard.displayName = 'StrategyCard';
