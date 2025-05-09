
// This file can be deprecated or used for non-Zod types if all primary data types are defined in zodSchemas.ts
// For now, let's ensure it re-exports types from zodSchemas.ts or aligns with them.

// Re-exporting from zodSchemas to maintain a single source of truth for these types
export type { 
    Trend, 
    CustomerImpact, 
    ConsultingPositioning, 
    LearningResource // Ensure LearningResource is exported
} from './zodSchemas';


// If you had other types here not covered by Zod schemas, they would remain.
// For example:
// export interface UserProfile { ... }

// CapitalizationStrategy is not in Zod currently, so it remains here.
// Consider moving to Zod if it's used in Genkit flows or needs stricter validation.
export interface CapitalizationStrategy {
  id: string;
  trendId: string; // Links to a specific trend
  title: string;
  description: string;
  newServiceOffering?: {
    name: string;
    scope: string;
    valueProposition: string;
  };
  partnershipOpportunities?: {
    partnerType: string; // e.g., "AI Vendor", "Service Provider"
    rationale: string;
    potentialPartners?: string[];
  }[];
  targetClients?: {
    industry: string;
    profile: string;
  }[];
  actionableSteps: {
    step: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
  date: string; // Date of strategy generation, YYYY-MM-DD
}
