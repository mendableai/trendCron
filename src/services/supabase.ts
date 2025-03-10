import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

// Define a type for our mock Supabase client
interface SupabaseLike {
  from: (table: string) => {
    insert: (data: any) => Promise<{ error: null | Error }>;
  };
}

let supabase: SupabaseClient | SupabaseLike;

if (isDevelopment && (!supabaseUrl || !supabaseKey)) {
  console.warn('Running in development mode with mock Supabase client');
  // Create mock Supabase client for development
  supabase = {
    from: () => ({
      insert: async () => {
        console.log('Mock Supabase: Data would be inserted here in production');
        return { error: null };
      }
    })
  };
} else {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in environment variables');
  }
  supabase = createClient(supabaseUrl, supabaseKey);
}

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
  
  if (isDevelopment) {
    console.log('Development mode: Trend would be inserted into Supabase');
    return;
  }
  
  const { error } = await supabase
    .from('trends')
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
  
  if (isDevelopment) {
    console.log('Development mode: Trends would be inserted into Supabase');
    trends.forEach((trend, i) => {
      console.log(`Trend ${i+1}:`, trend);
    });
    return;
  }
  
  const trendsWithDate = trends.map(trend => ({
    date: new Date().toISOString(),
    topic_title: trend.topic_title,
    topic_desc: trend.topic_desc,
    trend_score: trend.trend_score
  }));

  const { error } = await supabase
    .from('trends')
    .insert(trendsWithDate);

  if (error) {
    throw new Error(`Failed to insert trends: ${error.message}`);
  }
}

export default supabase; 