import { existsSync, readFileSync } from 'node:fs';

const required = [
  'app/page.tsx',
  'app/layout.tsx',
  'app/globals.css',
  'components/TradingApp.tsx',
  'components/MarketChart.tsx',
  'package.json',
  'next.config.mjs',
];

const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('MarketLab project check failed. Missing:');
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
if (!String(pkg.scripts?.build || '').includes('--webpack')) {
  console.error('MarketLab project check failed: build script should use next build --webpack.');
  process.exit(1);
}

console.log('MarketLab project structure looks correct.');
