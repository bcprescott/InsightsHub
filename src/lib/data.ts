import type { Trend, CapitalizationStrategy, LearningResource } from '@/types';

export const mockTrends: Trend[] = [
  {
    id: 'trend-1',
    title: 'Rise of Specialized Small Language Models (SLMs)',
    summary: 'This week saw a significant increase in research and development of smaller, highly specialized language models. These SLMs are designed for specific tasks or industries, offering greater efficiency and cost-effectiveness compared to large general-purpose models.',
    category: 'Language Models',
    date: '2025-W28', // Updated year
    customerImpact: [
      { industry: 'Finance', impactAnalysis: 'SLMs can be trained on proprietary financial data for tasks like fraud detection, sentiment analysis of market news, and regulatory compliance checks with lower inference costs.' },
      { industry: 'Healthcare', impactAnalysis: 'Custom SLMs can assist in medical report summarization, analysis of patient feedback, and powering specialized medical chatbots, potentially improving diagnostic speed and patient care.' },
      { industry: 'Manufacturing', impactAnalysis: 'SLMs can optimize supply chain communication, analyze machine sensor data for predictive maintenance, and generate technical documentation more efficiently.' },
    ],
    consultingPositioning: {
      strategicAdvice: 'Advise clients on identifying high-impact use cases for SLMs within their operations. Emphasize the balance between customization, cost, and performance.',
      newServices: ['SLM Feasibility Assessment & ROI Analysis', 'Custom SLM Development & Fine-tuning Services'],
      adaptedServices: ['Augment existing data analytics services with SLM-powered insights.'],
      talkingPoints: ['Achieve targeted AI capabilities without the overhead of massive models.', 'Unlock value from domain-specific data with tailored AI solutions.'],
      risksOrLimitations: ['Data availability and quality for training SLMs can be a bottleneck.', 'Potential for narrow expertise; SLMs may not generalize well outside their trained domain.'],
    },
    momentum: 75,
    marketSize: '$5B (projected 2026)', // Adjusted projection year
  },
  {
    id: 'trend-2',
    title: 'AI-Powered Code Generation Matures',
    summary: 'AI code generation tools are becoming increasingly sophisticated, moving beyond simple autocompletion to generating complex code blocks and even entire applications. GitHub Copilot and similar tools are seeing wider adoption.',
    category: 'Developer Tools',
    date: '2025-W28', // Updated year
    customerImpact: [
      { industry: 'Software Development', impactAnalysis: 'Significant productivity gains for development teams, faster prototyping, and potentially lower development costs. May also lead to challenges in code quality assurance and security if not managed well.' },
      { industry: 'IT Departments (All Sectors)', impactAnalysis: 'Enables faster creation of internal tools and automation scripts. Requires upskilling of IT staff to leverage these tools effectively and manage associated risks.' },
    ],
    consultingPositioning: {
      strategicAdvice: 'Help clients integrate AI code generation into their SDLC, focusing on best practices for quality, security, and IP management.',
      newServices: ['AI Code Generation Strategy & Implementation', 'Developer Training for AI-Assisted Coding'],
      talkingPoints: ['Accelerate software development cycles.', 'Empower developers to focus on higher-value tasks.'],
      risksOrLimitations: ['Generated code may contain bugs or security vulnerabilities.', 'Over-reliance can stifle junior developer learning.', 'IP and licensing concerns with generated code.'],
    },
    momentum: 90,
  },
];

export const mockStrategies: CapitalizationStrategy[] = [
  {
    id: 'strategy-1',
    trendId: 'trend-1',
    title: 'SLM Adoption Workshop for Mid-Market Enterprises',
    description: 'A targeted workshop to educate mid-market enterprises on the benefits and practical applications of Specialized Language Models (SLMs).',
    date: '2025-W28', // Updated year
    newServiceOffering: {
      name: 'SLM Adoption & Strategy Workshop',
      scope: 'A 1-day interactive workshop covering SLM fundamentals, use case identification, data requirements, and a roadmap for pilot project implementation.',
      valueProposition: 'Equip mid-market businesses with the knowledge to leverage SLMs for competitive advantage and operational efficiency.',
    },
    partnershipOpportunities: [
      { partnerType: 'Cloud Providers', rationale: 'Bundle workshop with cloud credits for SLM experimentation.', potentialPartners: ['AWS, Azure, GCP'] },
      { partnerType: 'Data Annotation Services', rationale: 'Collaborate to offer end-to-end SLM solutions, including data preparation.', potentialPartners: ['Scale AI, Appen'] }
    ],
    targetClients: [
      { industry: 'Retail', profile: 'Companies looking to personalize customer experiences or optimize inventory management.' },
      { industry: 'Legal Tech', profile: 'Firms needing to process and analyze large volumes of legal documents efficiently.' },
    ],
    actionableSteps: [
      { step: 'Develop workshop curriculum and materials.', priority: 'High' },
      { step: 'Identify and train 2-3 consultants to deliver the workshop.', priority: 'High' },
      { step: 'Create marketing collateral for the workshop.', priority: 'Medium' },
      { step: 'Pilot the workshop with a friendly client.', priority: 'Medium' },
    ],
  },
];

export const mockResources: LearningResource[] = [
  {
    id: 'resource-1',
    trendId: 'trend-1',
    title: 'On the Dangers of Stochastic Parrots: Can Language Models Be Too Big?',
    type: 'Paper',
    url: 'https://dl.acm.org/doi/10.1145/3442188.3445922',
    authors: ['Emily M. Bender', 'Timnit Gebru', 'Angelina McMillan-Major', 'Shmargaret Shmitchell'],
    publicationDate: '2021-03-01',
    summary: 'A critical perspective on the risks and ethical considerations associated with large language models, relevant for understanding the motivations behind SLMs.',
    source: 'FAccT \'21',
    isFree: true,
    skillLevel: 'Intermediate',
    rating: 5,
    tags: ['LLM', 'AI Ethics', 'NLP'],
  },
  {
    id: 'resource-2',
    trendId: 'trend-2',
    title: 'GitHub Copilot Documentation',
    type: 'Tool',
    url: 'https://docs.github.com/en/copilot',
    summary: 'Official documentation for GitHub Copilot, a leading AI code generation tool. Essential for understanding its features and best practices.',
    source: 'GitHub',
    isFree: true, // to access docs, tool itself is subscription
    skillLevel: 'Beginner',
    rating: 4,
    tags: ['AI Coding', 'Developer Tools', 'Productivity'],
  },
  {
    id: 'resource-3',
    title: 'AI For Everyone by Andrew Ng',
    type: 'Course',
    url: 'https://www.coursera.org/learn/ai-for-everyone',
    authors: ['Andrew Ng'],
    summary: 'A non-technical introduction to AI, its capabilities, and its impact on society. Great foundational knowledge.',
    source: 'Coursera (DeepLearning.AI)',
    isFree: false, // Audit might be free
    timeCommitment: 'Approx. 9 hours',
    skillLevel: 'Beginner',
    rating: 5,
    tags: ['AI Fundamentals', 'Machine Learning', 'Business Impact'],
  },
];

