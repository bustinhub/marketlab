# MarketLab

Classroom paper trading built with Next.js, Supabase, TradingView Lightweight Charts, and Twelve Data.

## What works

- Email/password student and teacher accounts
- Teacher class creation
- Shareable class codes
- Student class enrollment
- Saved classroom portfolios
- Server-verified paper trades
- Fractional-share controls
- Teacher trading pause/resume
- Teacher roster management
- Class portfolio resets
- Live class leaderboard
- Account-synced watchlists
- U.S. stock and ETF search
- Live quotes
- Real historical candlestick charts
- Portfolio holdings and trade history

No sample students or fabricated leaderboard entries are used.

## Required services

### 1. Supabase

Create a Supabase project and run the complete contents of:

`supabase-schema.sql`

in the Supabase SQL Editor.

Then add these environment variables to Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

The service-role key is server-only. Never expose it as a `NEXT_PUBLIC_` variable.

### 2. Twelve Data

Create a Twelve Data API key and add:

```
TWELVE_DATA_API_KEY=
```

MarketLab does not fall back to invented stock prices. If market data is not configured, the UI reports that live data is unavailable.

For a small development test, a low-limit plan may work. A real classroom with many concurrent students needs enough API capacity for quote/search/chart traffic and the appropriate market-data display/redistribution rights for your use case.

## Local development

```bash
npm install
npm run dev
```

## Vercel

Import this GitHub repository into Vercel. The app uses standard Next.js App Router routes, so no custom output directory is required.

After adding or changing environment variables in Vercel, redeploy the project.

## Security

- Student cash and holdings are never trusted from the browser.
- Trade execution happens server-side.
- The server obtains the current market quote before executing an order.
- Supabase service credentials stay server-side.
- Supabase Row Level Security is enabled on the classroom tables.
- Classroom mutations verify teacher/student membership server-side.

## Data note

MarketLab is a paper-trading simulator. It does not execute real securities transactions or provide brokerage services.
