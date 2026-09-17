import { BookOpen, CandlestickChart, CircleDollarSign, Gauge, PieChart, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const lessons=[
  {icon:CandlestickChart,title:"Candlesticks",text:"Learn how open, high, low, and close prices create a candle — and what each part means.",tag:"Charts · 6 min"},
  {icon:TrendingUp,title:"Returns & cost basis",text:"Understand gains, losses, average purchase price, and why percentage return matters.",tag:"Portfolio · 5 min"},
  {icon:PieChart,title:"Diversification",text:"See why spreading investments across companies and sectors can change portfolio risk.",tag:"Risk · 7 min"},
  {icon:CircleDollarSign,title:"Market capitalization",text:"Compare small, mid, and large-cap companies and learn what market cap actually measures.",tag:"Fundamentals · 4 min"},
  {icon:Gauge,title:"P/E ratio",text:"A simple introduction to price-to-earnings and why investors compare valuation metrics.",tag:"Fundamentals · 6 min"},
  {icon:BookOpen,title:"Order basics",text:"Market orders, share quantities, buying power, and what happens when an order executes.",tag:"Trading · 5 min"},
];

export default function LearnPage(){
  return <AppShell>
    <div className="pageContainer">
      <div className="pageHero learnHero"><div><small>MARKETLAB LEARN</small><h1>Investing, explained clearly.</h1><p>Short lessons built around the same tools you use in the paper-trading simulator.</p></div></div>
      <section className="learnProgress premiumCard"><div><small>YOUR PROGRESS</small><h2>Start with the essentials</h2><p>Complete lessons while you build your classroom portfolio.</p></div><div className="progressRing"><span>2</span><small>of 12</small></div></section>
      <div className="lessonGrid">{lessons.map(({icon:Icon,title,text,tag},i)=><article className="lessonCard" key={title}><div className="lessonIcon"><Icon size={21}/></div><small>{tag}</small><h2>{title}</h2><p>{text}</p><button>{i<2?"Continue lesson":"Start lesson"} <span>→</span></button></article>)}</div>
      <section className="premiumCard glossaryPanel"><div><small>QUICK GLOSSARY</small><h2>Terms you’ll see around MarketLab</h2></div><div className="glossaryGrid"><div><b>Buying power</b><span>Cash currently available for new simulated investments.</span></div><div><b>Unrealized return</b><span>Gain or loss on a position that you still own.</span></div><div><b>Volume</b><span>How many shares have traded during a period.</span></div><div><b>52-week range</b><span>The stock’s high and low over roughly the last year.</span></div></div></section>
    </div>
  </AppShell>;
}
