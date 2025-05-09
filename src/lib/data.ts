import type { LearningResource } from '@/types/zodSchemas'; // Changed import to zodSchemas

// export const mockTrends: Trend[] = [ ... ]; // Kept commented as trends are dynamic

/*
export const mockStrategies: CapitalizationStrategy[] = [ ... ]; // Kept commented as strategies are dynamic
*/

export const mockResources: LearningResource[] = [
  {
    id: 'stochastic-parrots-critique', // Changed ID to be more descriptive slug
    trendId: 'hypothetical-llm-trend', // Example trendId
    title: 'On the Dangers of Stochastic Parrots: Can Language Models Be Too Big?',
    type: 'Paper',
    url: 'https://dl.acm.org/doi/10.1145/3442188.3445922',
    authors: ['Emily M. Bender', 'Timnit Gebru', 'Angelina McMillan-Major', 'Shmargaret Shmitchell'], // Kept 'Shmargaret Shmitchell' as it was in original
    publicationDate: '2021-03-01',
    summary: 'A critical perspective on the risks and ethical considerations associated with large language models, relevant for understanding the motivations behind SLMs.',
    source: 'FAccT \'21',
    isFree: true,
    skillLevel: 'Intermediate',
    // rating: 5, // Rating is illustrative, not requested from LLM for dynamic resources
    tags: ['LLM', 'AI Ethics', 'NLP', 'Critical AI'],
  },
  {
    id: 'github-copilot-docs',
    trendId: 'hypothetical-devtool-trend',
    title: 'GitHub Copilot Documentation',
    type: 'Documentation', // Changed type to 'Documentation' as it's more accurate
    url: 'https://docs.github.com/en/copilot',
    summary: 'Official documentation for GitHub Copilot, a leading AI code generation tool. Essential for understanding its features and best practices.',
    source: 'GitHub',
    isFree: true, // to access docs, tool itself is subscription
    skillLevel: 'Beginner',
    // rating: 4,
    tags: ['AI Coding', 'Developer Tools', 'Productivity', 'Documentation'],
  },
  {
    id: 'ai-for-everyone-coursera',
    title: 'AI For Everyone by Andrew Ng',
    type: 'Course',
    url: 'https://www.coursera.org/learn/ai-for-everyone',
    authors: ['Andrew Ng'],
    summary: 'A non-technical introduction to AI, its capabilities, and its impact on society. Great foundational knowledge.',
    source: 'Coursera (DeepLearning.AI)',
    isFree: false, // Audit might be free
    timeCommitment: 'Approx. 9 hours',
    skillLevel: 'Beginner',
    // rating: 5,
    tags: ['AI Fundamentals', 'Machine Learning', 'Business Impact', 'Online Course'],
  },
  {
    id: 'visual-guide-transformers',
    title: 'The Illustrated Transformer',
    type: 'Blog Post', // Changed to Blog Post
    url: 'http://jalammar.github.io/illustrated-transformer/',
    authors: ['Jay Alammar'],
    publicationDate: '2018-06-27',
    summary: 'A visual and intuitive explanation of the Transformer architecture, which is foundational to many modern LLMs.',
    source: 'Jay Alammar\'s Blog',
    isFree: true,
    skillLevel: 'Intermediate',
    tags: ['Transformer', 'NLP', 'Deep Learning', 'Attention Mechanism'],
  },
  {
    id: 'huggingface-nlp-course',
    title: 'Hugging Face NLP Course',
    type: 'Course',
    url: 'https://huggingface.co/course/chapter1',
    summary: 'A free online course by Hugging Face covering a wide range of NLP topics using their popular Transformers library.',
    source: 'Hugging Face',
    isFree: true,
    skillLevel: 'Intermediate',
    tags: ['NLP', 'Transformers', 'Hugging Face', 'Python', 'Tutorial'],
  }
];
