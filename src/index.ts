import cron from 'node-cron';
import { scrapeSources } from './services/scraper';
import { insertStories } from './services/supabase';
import { config, validateConfig } from './utils/config';

/**
 * Main function to execute the trend scraping and insertion
 */
async function runTrendScraper(): Promise<void> {
  console.log('Starting trend scraping process...');
  
  try {
    // 1. Scrape sources for stories
    console.log(`Scraping ${config.sources.length} sources...`);
    const stories = await scrapeSources(config.sources);
    console.log(`Found ${stories.length} stories from all sources`);
    
    // 2. Insert stories directly into Supabase
    if (stories.length > 0) {
      console.log('Inserting stories into database...');
      await insertStories(stories);
      console.log('Stories successfully inserted');
    } else {
      console.log('No stories to insert');
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