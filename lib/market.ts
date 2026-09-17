export type MarketSymbol = {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  price: number;
  changePercent: number;
  marketCap: string;
  pe: string;
  volume: string;
  high52: number;
  low52: number;
  color: string;
};

export const MARKET_SYMBOLS: MarketSymbol[] = [
  { symbol:"AAPL", name:"Apple Inc.", exchange:"NASDAQ", sector:"Technology", price:248.31, changePercent:1.30, marketCap:"$3.69T", pe:"37.9", volume:"42.8M", high52:260.10, low52:164.08, color:"#a3adb8" },
  { symbol:"NVDA", name:"NVIDIA Corporation", exchange:"NASDAQ", sector:"Technology", price:181.42, changePercent:1.72, marketCap:"$4.41T", pe:"58.2", volume:"171.4M", high52:184.48, low52:86.62, color:"#7dd36f" },
  { symbol:"TSLA", name:"Tesla, Inc.", exchange:"NASDAQ", sector:"Consumer Cyclical", price:432.08, changePercent:-0.48, marketCap:"$1.38T", pe:"119.4", volume:"78.2M", high52:488.54, low52:212.11, color:"#ef596f" },
  { symbol:"AMZN", name:"Amazon.com, Inc.", exchange:"NASDAQ", sector:"Consumer Cyclical", price:231.70, changePercent:0.16, marketCap:"$2.48T", pe:"36.5", volume:"35.1M", high52:242.52, low52:151.61, color:"#f2a93b" },
  { symbol:"MSFT", name:"Microsoft Corporation", exchange:"NASDAQ", sector:"Technology", price:514.22, changePercent:-0.21, marketCap:"$3.82T", pe:"38.1", volume:"19.6M", high52:555.45, low52:344.77, color:"#5cb9eb" },
  { symbol:"GOOGL", name:"Alphabet Inc.", exchange:"NASDAQ", sector:"Communication Services", price:246.88, changePercent:0.64, marketCap:"$2.99T", pe:"27.6", volume:"27.5M", high52:256.12, low52:140.53, color:"#6f8df5" },
  { symbol:"META", name:"Meta Platforms, Inc.", exchange:"NASDAQ", sector:"Communication Services", price:778.36, changePercent:0.91, marketCap:"$1.96T", pe:"31.2", volume:"15.8M", high52:796.25, low52:479.80, color:"#659cff" },
  { symbol:"AMD", name:"Advanced Micro Devices, Inc.", exchange:"NASDAQ", sector:"Technology", price:164.73, changePercent:1.14, marketCap:"$267.1B", pe:"43.7", volume:"46.7M", high52:186.65, low52:76.48, color:"#e85b63" },
  { symbol:"NFLX", name:"Netflix, Inc.", exchange:"NASDAQ", sector:"Communication Services", price:75.31, changePercent:-1.44, marketCap:"$318.8B", pe:"32.8", volume:"44.2M", high52:97.25, low52:55.18, color:"#e50914" },
  { symbol:"JPM", name:"JPMorgan Chase & Co.", exchange:"NYSE", sector:"Financial Services", price:314.92, changePercent:0.37, marketCap:"$866.3B", pe:"15.8", volume:"8.7M", high52:318.01, low52:191.43, color:"#90a9c4" },
  { symbol:"WMT", name:"Walmart Inc.", exchange:"NYSE", sector:"Consumer Defensive", price:108.41, changePercent:0.25, marketCap:"$865.7B", pe:"41.4", volume:"15.2M", high52:110.14, low52:77.47, color:"#4fa4ea" },
  { symbol:"KO", name:"The Coca-Cola Company", exchange:"NYSE", sector:"Consumer Defensive", price:78.17, changePercent:-0.12, marketCap:"$336.5B", pe:"26.9", volume:"13.1M", high52:79.02, low52:60.62, color:"#ef4b4b" },
];

export const MARKET_INDEXES = [
  { symbol:"SPX", name:"S&P 500", value:"6,814.31", change:0.52 },
  { symbol:"NDX", name:"NASDAQ 100", value:"25,188.42", change:0.81 },
  { symbol:"DJI", name:"Dow Jones", value:"46,018.21", change:-0.14 },
  { symbol:"VIX", name:"VIX", value:"15.84", change:-2.18 },
];

export const CLASSMATES = [
  { name:"Mason R.", value:108420.32, returnPct:8.42, today:1.12, trades:18, badge:"MR" },
  { name:"Jordan P.", value:106774.18, returnPct:6.77, today:0.64, trades:31, badge:"JP" },
  { name:"Caleb G.", value:104228.09, returnPct:4.23, today:-0.18, trades:14, badge:"CG" },
  { name:"Avery L.", value:102941.41, returnPct:2.94, today:0.34, trades:9, badge:"AL" },
  { name:"Noah B.", value:101886.72, returnPct:1.89, today:0.12, trades:22, badge:"NB" },
  { name:"Emma K.", value:100731.05, returnPct:0.73, today:-0.42, trades:12, badge:"EK" },
];

export function money(n:number) {
  return n.toLocaleString("en-US",{style:"currency",currency:"USD"});
}

export function pct(n:number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function findSymbol(symbol:string) {
  return MARKET_SYMBOLS.find(s => s.symbol === symbol.toUpperCase()) ?? MARKET_SYMBOLS[0];
}
