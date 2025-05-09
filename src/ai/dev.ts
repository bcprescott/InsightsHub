import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-opportunities.ts';
import '@/ai/flows/summarize-trends.ts';
import '@/ai/tools/fetch-news-articles-tool.ts'; // Added tool
import '@/ai/flows/generate-ai-trends-flow.ts'; // Added flow
