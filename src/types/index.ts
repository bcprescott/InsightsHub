
export interface Trend {
  id: string;
  title: string;
  summary: string;
  category: string; // e.g., "Generative AI", "LLM Optimization", "AI Ethics"
  date: string; // Week of YYYY-MM-DD or YYYY-Www
  customerImpact: {
    industry: string;
    impactAnalysis: string;
  }[];
  consultingPositioning: {
    strategicAdvice: string;
    newServices?: string[];
    adaptedServices?: string[];
    talkingPoints?: string[];
    risksOrLimitations?: string[];
  };
  momentum?: number; // Optional: for charts, e.g., 0-100. Made explicitly optional.
  marketSize?: string; // Optional: for charts, e.g., "$10B". Made explicitly optional.
}

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
  date: string;
}

export interface LearningResource {
  id: string;
  trendId?: string; // Optional: links to a specific trend
  title: string;
  type: 'Paper' | 'Article' | 'Course' | 'Tool' | 'Thought Leader' | 'Video';
  url: string;
  authors?: string[];
  publicationDate?: string;
  summary?: string;
  source?: string; // e.g., "arXiv", "Harvard Business Review", "Coursera"
  isFree?: boolean;
  timeCommitment?: string; // e.g., "2 hours read", "10-week course"
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  rating?: number; // 1-5 stars (display only)
  tags: string[]; // e.g., "Generative AI", "NLP", "Deep Learning"
}
