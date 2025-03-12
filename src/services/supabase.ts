import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Story } from './scraper';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Interface for trend data
export interface Trend {
  topic_title: string;
  topic_desc: string;
  trend_score: number;
}

/**
 * Insert a new trend into the trends table
 */
export async function insertTrend(trend: Trend): Promise<void> {
  console.log('Inserting trend:', trend);
  
  const { error } = await supabase
    .from('trending_topics')
    .insert({
      date: new Date().toISOString(),
      topic_title: trend.topic_title,
      topic_desc: trend.topic_desc,
      trend_score: trend.trend_score
    });

  if (error) {
    throw new Error(`Failed to insert trend: ${error.message}`);
  }
}

/**
 * Insert multiple trends into the trends table
 */
export async function insertTrends(trends: Trend[]): Promise<void> {
  console.log(`Inserting ${trends.length} trends`);
  
  const trendsWithDate = trends.map(trend => ({
    date: new Date().toISOString(),
    topic_title: trend.topic_title,
    topic_desc: trend.topic_desc,
    trend_score: trend.trend_score
  }));

  const { error } = await supabase
    .from('trending_topics')
    .insert(trendsWithDate);

  if (error) {
    throw new Error(`Failed to insert trends: ${error.message}`);
  }
}

/**
 * Insert stories directly as trends into the trends table
 */
export async function insertStories(stories: Story[]): Promise<void> {
  console.log(`Inserting ${stories.length} stories as trends`);
  
  const storiesAsTrends = stories.map(story => ({
    date: new Date().toISOString(),
    topic_title: story.headline,
    topic_desc: `Source: ${story.link}`,
    trend_score: 1 // Default score since we're not calculating trends
  }));

  const { error } = await supabase
    .from('trending_topics')
    .insert(storiesAsTrends);

  if (error) {
    throw new Error(`Failed to insert stories as trends: ${error.message}`);
  }
}

export default supabase; 