
'use server';
/**
 * @fileOverview A Genkit flow to generate relevant learning resources for given AI trends.
 *
 * - generateLearningResources - A function that uses an LLM to find and structure learning resources
 *   based on the `LearningResourceSchema`.
 * - GenerateLearningResourcesInput - The input type for the generateLearningResources function.
 * - GenerateLearningResourcesOutput - The return type for the generateLearningResources function (an array of LearningResources).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { LearningResourceSchema, type LearningResource } from '@/types/zodSchemas'; // Assuming LearningResourceSchema is in zodSchemas

const GenerateLearningResourcesInputSchema = z.object({
  trendTitle: z.string().describe("The title of the AI trend for which to find learning resources."),
  trendSummary: z.string().describe("The summary of the AI trend."),
  trendCategory: z.string().describe("The category of the AI trend."),
  numberOfResources: z.number().int().min(1).max(5).default(3).describe("The desired number of learning resources to generate."),
});
export type GenerateLearningResourcesInput = z.infer<typeof GenerateLearningResourcesInputSchema>;

// The output is an array of LearningResource objects
const GenerateLearningResourcesOutputSchema = z.array(LearningResourceSchema);
export type GenerateLearningResourcesOutput = z.infer<typeof GenerateLearningResourcesOutputSchema>;

export async function generateLearningResources(input: GenerateLearningResourcesInput): Promise<GenerateLearningResourcesOutput> {
  return generateLearningResourcesFlow(input);
}

const learningResourcesPrompt = ai.definePrompt({
  name: 'learningResourcesPrompt',
  input: { schema: GenerateLearningResourcesInputSchema },
  output: { schema: GenerateLearningResourcesOutputSchema },
  prompt: `
You are an expert AI research assistant. Your task is to find and suggest up to {{numberOfResources}} relevant and high-quality learning resources for the provided AI trend.
For each resource, you need to provide comprehensive details structured according to the output schema.
Prioritize resources that are current, authoritative, and directly related to the practical application or understanding of the trend.
Ensure all URLs are valid and directly link to the resource.
For the 'id' field of each resource, generate a unique, human-readable slug based on its title (e.g., "understanding-generative-ai-course").
For the 'tags' field, provide a list of 2-4 relevant keywords.

AI Trend Information:
Title: {{{trendTitle}}}
Summary: {{{trendSummary}}}
Category: {{{trendCategory}}}

Based on this AI trend, identify and describe up to {{numberOfResources}} learning resources.
If you can identify fewer than {{numberOfResources}} significant resources, please provide those you can identify.
Ensure each resource is distinct and directly helps in understanding or applying the trend.

Generate the output as a JSON array conforming to the provided schema. If no relevant resources can be identified, return an empty JSON array.
`,
  config: {
    temperature: 0.4, // Slightly higher temp for creative suggestions but still grounded
  },
});

const generateLearningResourcesFlow = ai.defineFlow(
  {
    name: 'generateLearningResourcesFlow',
    inputSchema: GenerateLearningResourcesInputSchema,
    outputSchema: GenerateLearningResourcesOutputSchema,
  },
  async (input) => {
    const { output } = await learningResourcesPrompt(input);

    if (!output) {
      console.error("Learning resource generation failed or returned undefined/null output from LLM.");
      return [];
    }

    // Post-process to ensure IDs are unique and well-formed, and associate with trendId if needed.
    return output.map(resource => ({
      ...resource,
      id: resource.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''), // Ensure a valid slug-like ID
      // trendId could be passed in the input and added here if linking is desired at this stage
    }));
  }
);
