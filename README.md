# MarketLab V1 — Vercel Edition

A classroom paper-trading simulator with a dark TradingView-inspired interface, candlestick charts, demo/live market data support, paper buy/sell orders, saved local portfolios, watchlists, leaderboard UI, and optional Supabase class sync.

## Important: repository structure

The **contents of this folder must be at the root of your GitHub repository**.

Your GitHub repo should open to this structure immediately:

```text
app/
components/
lib/
.env.example
.gitignore
.nvmrc
next-env.d.ts
next.config.mjs
package.json
supabase-schema.sql
tsconfig.json
vercel.json
README.md
```

There should **not** be another `marketlab-v1-vercel` folder above `app/`.

## Fastest test deploy

1. Create/open your GitHub repo.
2. Put every file and folder from this package directly in the repo root.
3. Commit/push to `main`.
4. In Vercel, import that GitHub repository.
5. Framework Preset: **Next.js**.
6. Root Directory: leave it **blank / repository root**.
7. Do not add environment variables yet.
8. Deploy.

The app will run in demo mode without any API keys.

## Build configuration

The project intentionally uses Webpack for the production build:

```json
"build": "next build --webpack"
```

Node is pinned to the Vercel-supported Node 22 major:

```json
"engines": {
  "node": "22.x"
}
```

## Optional real market data

Add this Vercel environment variable later:

```text
FINNHUB_API_KEY=your_key_here
```

Without it, the site uses animated demo quotes and candles so the whole interface can be tested safely.

## Optional shared classroom leaderboard

Run `supabase-schema.sql` in your Supabase project, then add:

```text
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Keep the service-role key server-side only. Never put it in a `NEXT_PUBLIC_` variable.

## Vercel WebSocket route

The browser connects to:

```text
/api/ws
```

The route uses Vercel's WebSocket upgrade API and automatically falls back to demo streaming when no market-data key is configured.

## If Vercel says it cannot find `app` or `pages`

That means the repository root is wrong. Either:

- move `app/`, `components/`, `lib/`, and `package.json` to the GitHub repo root, or
- set the Vercel Project **Root Directory** to the folder that contains those files.

This corrected ZIP is already flattened so the files are ready to become the repo root.


<!-- deployment trigger: app directory verified on main -->
