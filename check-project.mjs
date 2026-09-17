import { existsSync, readdirSync } from "node:fs";

const required=[
  "app/page.tsx",
  "app/layout.tsx",
  "app/trade/page.tsx",
  "app/login/page.tsx",
  "app/classes/page.tsx",
  "components/TradingProvider.tsx",
  "components/AuthProvider.tsx",
  "components/ClassroomProvider.tsx",
  "components/MarketChart.tsx",
  "lib/market-data.ts",
  "package.json",
];

console.log("MarketLab prebuild verification");
console.log("cwd:",process.cwd());
console.log("root files:",readdirSync(".").sort().join(", "));

const missing=required.filter(file=>!existsSync(file));
if(missing.length){
  console.error("Missing required files:");
  for(const file of missing)console.error("-",file);
  process.exit(1);
}
console.log("MarketLab project structure verified.");
