# TrendCron

A Node.js TypeScript application that runs a cron job every 3 hours to track trends by scraping websites using Firecrawl and the X API. The discovered trends are stored in a Supabase database.

## Features

- Scheduled scraping every 3 hours using node-cron
- Web scraping using Firecrawl
- Twitter/X data fetching using X API
- Trend analysis from multiple sources
- Supabase database integration

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the example environment file and fill in your credentials:
   ```
   cp .env.example .env
   ```
4. Build the project:
   ```
   npm run build
   ```
5. Start the application:
   ```
   npm start
   ```

## Environment Variables

- `FIRECRAWL_API_KEY`: Your Firecrawl API key
- `X_API_BEARER_TOKEN`: Your X (Twitter) API bearer token
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase service role key
- `CRON_SCHEDULE`: Cron schedule expression (default: every 3 hours)
- `SOURCES`: Comma-separated list of sources to scrape

## Development

Run in development mode with hot reloading:

```
npm run dev
```

## License

ISC
