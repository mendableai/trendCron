import FirecrawlApp from '@mendable/firecrawl-js';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Initialize Firecrawl
const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

// Define the schema for our expected JSON
const StorySchema = z.object({
  headline: z.string().describe('Story or post headline'),
  link: z.string().describe('A link to the post or story'),
  date_posted: z.string().describe('The date the story or post was published'),
});

const StoriesSchema = z.object({
  stories: z
    .array(StorySchema)
    .describe("A list of today's AI or LLM-related stories"),
});

// Define the TypeScript type for a story using the schema
export type Story = z.infer<typeof StorySchema>;

// Define the interface for Twitter API response
interface TwitterResponse {
  data?: {
    id: string;
    text: string;
    [key: string]: any;
  }[];
  meta?: {
    result_count: number;
    [key: string]: any;
  };
}

/**
 * Scrape sources using Firecrawl (for non-Twitter URLs) and the Twitter API.
 * Returns a combined array of story objects.
 */
export async function scrapeSources(
  sources: { identifier: string }[],
): Promise<Story[]> {
  // Explicitly type the stories array so it is Story[]
  const combinedText: { stories: Story[] } = { stories: [] };

  // Configure toggles for scrapers
  const useScrape = true;
  const useTwitter = true;
  const tweetStartTime = new Date(
    Date.now() - 24 * 60 * 60 * 1000,
  ).toISOString();

  for (const sourceObj of sources) {
    const source = sourceObj.identifier;

    // --- 1) Handle Twitter/X sources ---
    if (source.includes('x.com')) {
      if (useTwitter) {
        const usernameMatch = source.match(/x\.com\/([^\/]+)/);
        if (!usernameMatch) continue;
        const username = usernameMatch[1];

        // Construct the query and API URL
        const query = `from:${username} has:media -is:retweet -is:reply`;
        const encodedQuery = encodeURIComponent(query);
        const encodedStartTime = encodeURIComponent(tweetStartTime);
        const apiUrl = `https://api.x.com/2/tweets/search/recent?query=${encodedQuery}&max_results=10&start_time=${encodedStartTime}`;

        try {
          const response = await fetch(apiUrl, {
            headers: {
              Authorization: `Bearer ${process.env.X_API_BEARER_TOKEN}`,
            },
          });
          if (!response.ok) {
            throw new Error(
              `Failed to fetch tweets for ${username}: ${response.statusText}`,
            );
          }
          const tweetsResponse = await response.json() as TwitterResponse;

          if (tweetsResponse.meta?.result_count === 0) {
            console.log(`No tweets found for username ${username}.`);
          } else if (Array.isArray(tweetsResponse.data)) {
            console.log(`Tweets found from username ${username}`);
            const stories = tweetsResponse.data.map(
              (tweet): Story => ({
                headline: tweet.text,
                link: `https://x.com/i/status/${tweet.id}`,
                date_posted: tweetStartTime,
              }),
            );
            combinedText.stories.push(...stories);
          } else {
            console.error('Expected tweets.data to be an array:', tweetsResponse.data);
          }
        } catch (error: any) {
          console.error(`Error fetching tweets for ${username}:`, error);
        }
      }
    }
    // --- 2) Handle all other sources with Firecrawl ---
    else {
      if (useScrape) {
        const currentDate = new Date().toLocaleDateString();
        const promptForFirecrawl = `
Return only today's AI or LLM related story or post headlines and links in JSON format from the page content. 
They must be posted today, ${currentDate}. The format should be:
{
  "stories": [
    {
      "headline": "headline1",
      "link": "link1",
      "date_posted": "YYYY-MM-DD"
    },
    ...
  ]
}
If there are no AI or LLM stories from today, return {"stories": []}.

The source link is ${source}. 
If a story link is not absolute, prepend ${source} to make it absolute. 
Return only pure JSON in the specified format (no extra text, no markdown, no \`\`\`).
        `;
        try {
          const scrapeResult = await app.extract([source], {
            prompt: promptForFirecrawl,
            schema: StoriesSchema,
          });
          if (!scrapeResult.success) {
            throw new Error(`Failed to scrape: ${scrapeResult.error}`);
          }
          // Cast the result to our expected type
          const todayStories = scrapeResult.data as { stories: Story[] };
          if (!todayStories || !todayStories.stories) {
            console.error(
              `Scraped data from ${source} does not have a "stories" key.`,
              todayStories,
            );
            continue;
          }
          console.log(
            `Found ${todayStories.stories.length} stories from ${source}`,
          );
          combinedText.stories.push(...todayStories.stories);
        } catch (error: any) {
          if (error.statusCode === 429) {
            console.error(
              `Rate limit exceeded for ${source}. Skipping this source.`,
            );
          } else {
            console.error(`Error scraping source ${source}:`, error);
          }
        }
      }
    }
  }

  console.log('Combined Stories:', combinedText.stories);
  return combinedText.stories;
} 