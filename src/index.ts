import cron from 'node-cron';
import { scrapeSources } from './services/scraper';
import { analyzeTrends } from './services/trendAnalyzer';
import { insertTrends } from './services/supabase';
import { config, validateConfig } from './utils/config';

/**
 * Main function to execute the trend scraping and analysis
 */
async function runTrendScraper(): Promise<void> {
  console.log('Starting trend scraping process...');
  
  try {
    // 1. Scrape sources for stories
    console.log(`Scraping ${config.sources.length} sources...`);
    const stories = await scrapeSources(config.sources);
    console.log(`Found ${stories.length} stories from all sources`);
    
    // 2. Analyze scraped stories to find trends
    console.log('Analyzing stories for trends...');
    const trends = analyzeTrends(stories);
    console.log(`Identified ${trends.length} trends`);
    
    // 3. Insert trends into Supabase
    if (trends.length > 0) {
      console.log('Inserting trends into database...');
      await insertTrends(trends);
      console.log('Trends successfully inserted');
    } else {
      console.log('No trends to insert');
    }
    
    console.log('Trend scraping process completed successfully');
  } catch (error) {
    console.error('Error in trend scraping process:', error);
  }
}

/**
 * Initialize the application and schedule the cron job
 */
async function init(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();
    
    console.log(`Setting up cron job with schedule: ${config.cronSchedule}`);
    
    // Schedule the cron job to run at the specified interval
    cron.schedule(config.cronSchedule, () => {
      console.log(`Cron job triggered at ${new Date().toISOString()}`);
      runTrendScraper().catch(error => {
        console.error('Error in cron job execution:', error);
      });
    });
    
    console.log('Cron job scheduled successfully');
    
    // Run the trend scraper immediately on startup
    console.log('Running initial trend scraping process...');
    await runTrendScraper();
    
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
}

// Start the application
init().catch(error => {
  console.error('Fatal error during initialization:', error);
  process.exit(1);
}); 