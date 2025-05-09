/**
 * @fileOverview Zod schemas for data types used in AI trend analysis.
 *
 * Defines Zod schemas for:
 * - CustomerImpactSchema
 * - ConsultingPositioningSchema
 * - TrendSchema
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
  date: z.string().describe('The date of analysis for this trend, formatted as YYYY-MM-DD (e.g., "2024-07-15"). Use the current date of analysis.'),
  customerImpact: z.array(CustomerImpactSchema).describe('An array of objects detailing the trend\'s impact on various customer industries.'),
  consultingPositioning: ConsultingPositioningSchema.describe('Recommendations for how the consulting team should strategically position itself for this trend.'),
  momentum: z.number().optional().describe('An optional score (0-100) indicating the trend\'s current momentum or buzz. Estimate if not directly available.'),
  marketSize: z.string().optional().describe('An optional estimated market size related to the trend (e.g., "$10B by 2025"). Estimate if not directly available.'),
});

export type Trend = z.infer<typeof TrendSchema>;
export type CustomerImpact = z.infer<typeof CustomerImpactSchema>;
export type ConsultingPositioning = z.infer<typeof ConsultingPositioningSchema>;
