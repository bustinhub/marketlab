import { existsSync, readdirSync } from "node:fs";

console.log("MarketLab prebuild verification");
console.log("cwd:", process.cwd());
console.log("root files:", readdirSync(".").sort().join(", "));

if (existsSync("app")) {
  console.log("app files:", readdirSync("app").sort().join(", "));
} else {
  console.error("ERROR: app directory is missing from the Vercel checkout.");
  process.exit(1);
}

for (const file of ["app/page.tsx", "app/layout.tsx", "app/globals.css"]) {
  if (!existsSync(file)) {
    console.error("ERROR: missing required file:", file);
    process.exit(1);
  }
}

console.log("MarketLab app directory verified.");
