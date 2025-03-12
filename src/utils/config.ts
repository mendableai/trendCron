import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment configuration with defaults
 */
export const config = {
  // API Keys
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY || '',
  xApiBearer: process.env.X_API_BEARER_TOKEN || '',
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_KEY || '',
  
  // Cron schedule (default: every 3 hours)
  cronSchedule: process.env.CRON_SCHEDULE || '0 */3 * * *',
  
  // Sources to scrape
  sources: process.env.SOURCES ? 
    process.env.SOURCES.split(',').filter(Boolean).map(s => ({ identifier: s.trim() })) :
    [
      { identifier: "https://x.com/OpenAIDevs" },
      { identifier: "https://x.com/OpenAI" },
      { identifier: "https://x.com/AnthropicAI" },
      { identifier: "https://x.com/AIatMeta" },
      { identifier: "https://x.com/skirano" },
      { identifier: "https://x.com/xai" },
      { identifier: "https://x.com/alexalbert__"},
      { identifier: "https://x.com/rauchg"},
      { identifier: "https://x.com/amasad"},
      { identifier: "https://x.com/leeerob"},
      { identifier: "https://x.com/nutlope"},
      { identifier: "https://x.com/akshay_pachaar"},
      { identifier: "https://x.com/firecrawl_dev"},
      { identifier: "https://x.com/googleaidevs"},
      { identifier: "https://x.com/karpathy" },
      { identifier: "https://x.com/ylecun" },
      { identifier: "https://x.com/DrJimFan" },
      { identifier: "https://x.com/ExaAILabs" },
      { identifier: "https://x.com/LangChainAI" },
      { identifier: "https://x.com/Sumanth_077" },
      { identifier: "https://x.com/Saboo_Shubham_" },
      { identifier: "https://www.firecrawl.dev/blog" },
      { identifier: "https://openai.com/news/" },
      { identifier: "https://www.anthropic.com/news" },
      { identifier: "https://news.ycombinator.com/" },
      { identifier: "https://www.reuters.com/technology/artificial-intelligence/" },
      { identifier: "https://simonwillison.net/" },
      { identifier: "https://buttondown.com/ainews/archive/" }
    ]
};

/**
 * Validate that the required configuration is present
 */
export function validateConfig(): void {
  const requiredVars = [
    { name: 'FIRECRAWL_API_KEY', value: config.firecrawlApiKey },
    { name: 'X_API_BEARER_TOKEN', value: config.xApiBearer },
    { name: 'SUPABASE_URL', value: config.supabaseUrl },
    { name: 'SUPABASE_KEY', value: config.supabaseKey }
  ];
  
  const missingVars = requiredVars.filter(v => !v.value);
  
  if (missingVars.length > 0) {
    const missingNames = missingVars.map(v => v.name).join(', ');
    throw new Error(`Missing required environment variables: ${missingNames}`);
  }
} 