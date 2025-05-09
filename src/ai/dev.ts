import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-opportunities.ts';
import '@/ai/flows/summarize-trends.ts';
import '@/ai/tools/fetch-news-articles-tool.ts'; 
import '@/ai/flows/generate-ai-trends-flow.ts'; 
import '@/ai/flows/generate-learning-resources-flow.ts'; // Added new flow
