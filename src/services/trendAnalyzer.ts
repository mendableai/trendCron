import { Story } from './scraper';
import { Trend } from './supabase';

/**
 * Analyze stories to identify trends based on frequency and recency
 */
export function analyzeTrends(stories: Story[]): Trend[] {
  // Skip analysis if no stories are found
  if (stories.length === 0) {
    console.log('No stories to analyze');
    return [];
  }

  // Extract words and phrases from headlines
  const words = extractWords(stories);
  
  // Count occurrences of each word/phrase
  const wordCounts = countWords(words);
  
  // Filter for significant words (appearing more than once)
  const significantWords = Object.entries(wordCounts)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);
  
  // Convert significant words to trends
  const trends: Trend[] = significantWords.slice(0, 10).map(([word, count]) => {
    // Find the related stories for this trend
    const relatedStories = stories.filter(story => 
      story.headline.toLowerCase().includes(word.toLowerCase())
    );
    
    // Create a brief description from the related stories
    const description = relatedStories.length > 0 
      ? `Based on ${relatedStories.length} mentions across different sources. First mentioned in: "${relatedStories[0].headline.substring(0, 100)}..."`
      : `Mentioned ${count} times in recent stories`;
    
    return {
      topic_title: word,
      topic_desc: description,
      trend_score: count * 10 // Simple scoring based on mention count
    };
  });
  
  return trends;
}

/**
 * Extract meaningful words and phrases from stories
 */
function extractWords(stories: Story[]): string[] {
  const words: string[] = [];
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'for', 'with', 
    'in', 'on', 'at', 'to', 'from', 'by', 'about', 'as', 
    'into', 'like', 'through', 'after', 'over', 'between', 
    'out', 'of', 'is', 'are', 'was', 'were', 'be', 'been',
    'new', 'top', 'best', 'latest', 'today', 'now'
  ]);
  
  // Process each story headline
  for (const story of stories) {
    const headline = story.headline.toLowerCase();
    
    // Extract single words (excluding stop words)
    const singleWords = headline
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    words.push(...singleWords);
    
    // Extract phrases (2-3 word combinations)
    const headlineWords = headline.split(/\s+/);
    for (let i = 0; i < headlineWords.length - 1; i++) {
      // 2-word phrases
      if (i < headlineWords.length - 1) {
        const phrase2 = `${headlineWords[i]} ${headlineWords[i + 1]}`;
        if (phrase2.length > 6) {
          words.push(phrase2);
        }
      }
      
      // 3-word phrases
      if (i < headlineWords.length - 2) {
        const phrase3 = `${headlineWords[i]} ${headlineWords[i + 1]} ${headlineWords[i + 2]}`;
        if (phrase3.length > 10) {
          words.push(phrase3);
        }
      }
    }
  }
  
  return words;
}

/**
 * Count occurrences of each word/phrase
 */
function countWords(words: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  for (const word of words) {
    counts[word] = (counts[word] || 0) + 1;
  }
  
  return counts;
} 