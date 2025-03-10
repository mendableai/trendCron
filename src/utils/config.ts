import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Are we in development mode?
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

/**
 * Environment configuration with defaults
 */
export const config = {
  // API Keys
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY || (isDevelopment ? 'dummy_key' : ''),
  xApiBearer: process.env.X_API_BEARER_TOKEN || (isDevelopment ? 'dummy_token' : ''),
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || (isDevelopment ? 'https://example.supabase.co' : ''),
  supabaseKey: process.env.SUPABASE_KEY || (isDevelopment ? 'dummy_key' : ''),
  
  // Cron schedule (default: every 3 hours)
  cronSchedule: process.env.CRON_SCHEDULE || '0 */3 * * *',
  
  // Sources to scrape (comma-separated list)
  sources: (process.env.SOURCES || '').split(',').filter(Boolean).map(s => ({ identifier: s.trim() }))
};

/**
 * Validate that the required configuration is present
 */
export function validateConfig(): void {
  // In development mode, we're more lenient with validation
  if (isDevelopment) {
    console.warn('Running in development mode with dummy credentials');
    
    if (config.sources.length === 0) {
      console.warn('No sources defined in SOURCES environment variable. Falling back to default sources.');
      config.sources = [
        { identifier: 'https://news.ycombinator.com' },
        { identifier: 'https://x.com/ylecun' },
        { identifier: 'https://x.com/AndrewYNg' },
        { identifier: 'https://techcrunch.com/category/artificial-intelligence' }
      ];
    }
    return;
  }
  
  // In production, we require all variables
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
  
  if (config.sources.length === 0) {
    console.warn('No sources defined in SOURCES environment variable. Falling back to default sources.');
    config.sources = [
      { identifier: 'https://news.ycombinator.com' },
      { identifier: 'https://x.com/ylecun' },
      { identifier: 'https://x.com/AndrewYNg' },
      { identifier: 'https://techcrunch.com/category/artificial-intelligence' }
    ];
  }
} 