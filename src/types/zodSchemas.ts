/**
 * @fileOverview Zod schemas for data types used in AI trend analysis.
 *
 * Defines Zod schemas for:
 * - CustomerImpactSchema
 * - ConsultingPositioningSchema
 * - TrendSchema
 * - LearningResourceSchema
 * These schemas are used for validating and structuring data in Genkit flows.
 */
import { z } from 'genkit';

export const CustomerImpactSchema = z.object({
  industry: z.string().describe('The industry affected by the trend.'),
  impactAnalysis: z.string().describe('Analysis of how the trend impacts this industry.'),
});

export const ConsultingPositioningSchema = z.object({
  strategicAdvice: z.string().describe('Strategic advice for consultants regarding this trend.'),
  newServices: z.array(z.string()).optional().describe('Potential new service offerings related to the trend.'),
  adaptedServices: z.array(z.string()).optional().describe('Existing services that can be adapted for this trend.'),
  talkingPoints: z.array(z.string()).optional().describe('Key talking points for client discussions.'),
  risksOrLimitations: z.array(z.string()).optional().describe('Potential risks or limitations to consider.'),
});

export const TrendSchema = z.object({
  id: z.string().describe('A unique identifier for the trend, can be a human-readable slug based on the title (e.g., "specialized-slms-rise").'),
  title: z.string().describe('A concise title for the AI trend.'),
  summary: z.string().describe('A detailed summary of the AI trend, explaining what it is and its significance.'),
  category: z.string().describe('The category of the trend (e.g., "Generative AI", "LLM Optimization", "AI Ethics").'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
                 .describe('The date of analysis for this trend, formatted as YYYY-MM-DD. This must be the current date of analysis.'),
  customerImpact: z.array(CustomerImpactSchema).describe('An array of objects detailing the trend\'s impact on various customer industries.'),
  consultingPositioning: ConsultingPositioningSchema.describe('Recommendations for how the consulting team should strategically position itself for this trend.'),
  momentum: z.number().optional().describe('An optional score (0-100) indicating the trend\'s current momentum or buzz. Estimate if not directly available.'),
  marketSize: z.string().optional().describe('An optional estimated market size related to the trend (e.g., "$10B by 2025"). Estimate if not directly available.'),
});


export const LearningResourceSchema = z.object({
  id: z.string().describe("A unique identifier for the learning resource, can be a human-readable slug based on the title."),
  trendId: z.string().optional().describe("Optional ID of the AI trend this resource is related to."),
  title: z.string().describe("The title of the learning resource."),
  type: z.enum(['Paper', 'Article', 'Course', 'Tool', 'Video', 'Thought Leader', 'Documentation', 'Blog Post', 'Tutorial', 'Other'])
          .describe("The type of the learning resource."),
  url: z.string().url().describe("The direct URL to access the resource."),
  authors: z.array(z.string()).optional().describe("A list of authors or creators of the resource, if applicable."),
  publicationDate: z.string().optional().describe("The publication date of the resource, if known (e.g., YYYY-MM-DD or 'Recent')."),
  summary: z.string().optional().describe("A brief summary or description of the learning resource."),
  source: z.string().optional().describe("The source or publisher of the resource (e.g., 'arXiv', 'Medium', 'Coursera', 'GitHub')."),
  isFree: z.boolean().optional().describe("Indicates if the resource is freely accessible."),
  timeCommitment: z.string().optional().describe("Estimated time commitment if applicable (e.g., '2 hours read', '10-week course')."),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional().describe("Recommended skill level for the resource."),
  tags: z.array(z.string()).describe("Relevant tags or keywords for the resource (e.g., 'Generative AI', 'NLP', 'Tutorial').")
});

export type Trend = z.infer<typeof TrendSchema>;
export type CustomerImpact = z.infer<typeof CustomerImpactSchema>;
export type ConsultingPositioning = z.infer<typeof ConsultingPositioningSchema>;
export type LearningResource = z.infer<typeof LearningResourceSchema>;
