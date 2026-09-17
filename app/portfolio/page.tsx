"use client";

import { ArrowDownRight, ArrowUpRight, BriefcaseBusiness, CircleDollarSign, History, PieChart, Wallet } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useTrading } from "@/components/TradingProvider";
import { money, pct } from "@/lib/market";

export default function PortfolioPage(){
  const {cash,holdings,trades,stocks,equity,invested,totalReturn}=useTrading();
  const allocations=holdings.map(h=>{
    const stock=stocks.find(s=>s.symbol===h.symbol);
    const value=(stock?.price??h.avgCost)*h.shares;
    return {...h,stock,value,weight:invested?value/invested*100:0,returnPct:((stock?.price??h.avgCost)-h.avgCost)/h.avgCost*100};
  }).sort((a,b)=>b.value-a.value);

  return <AppShell>
    <div className="pageContainer">
      <div className="pageHero">
        <div><small>MY PORTFOLIO</small><h1>{money(equity)}</h1><p className={totalReturn>=0?"up":"down"}>{pct(totalReturn)} since class start</p></div>
        <div className="heroBadge"><BriefcaseBusiness size={17}/> Personal Finance · Period 3</div>
      </div>

      <div className="summaryGrid four">
        <article className="summaryCard"><span><Wallet size={15}/> Buying power</span><strong>{money(cash)}</strong><small>Available to invest</small></article>
        <article className="summaryCard"><span><CircleDollarSign size={15}/> Invested</span><strong>{money(invested)}</strong><small>{holdings.length} open position{holdings.length===1?"":"s"}</small></article>
        <article className="summaryCard"><span><ArrowUpRight size={15}/> Total return</span><strong className={totalReturn>=0?"up":"down"}>{pct(totalReturn)}</strong><small>{money(equity-100000)} vs. $100,000 start</small></article>
        <article className="summaryCard"><span><History size={15}/> Trades</span><strong>{trades.length}</strong><small>Completed paper orders</small></article>
      </div>

      <div className="portfolioLayout">
        <section className="premiumCard performancePanel">
          <div className="sectionHeading"><div><small>PERFORMANCE</small><h2>Account value</h2></div><span className="periodPill">ALL TIME</span></div>
          <div className="portfolioGraph" aria-label="Illustrative portfolio performance chart">
            <svg viewBox="0 0 700 220" preserveAspectRatio="none">
              <defs><linearGradient id="fillPortfolio" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6ea8fe" stopOpacity=".28"/><stop offset="100%" stopColor="#6ea8fe" stopOpacity="0"/></linearGradient></defs>
              <path d="M0 176 C80 170 98 120 150 135 S240 148 285 102 S365 128 410 92 S505 75 548 88 S625 48 700 52 L700 220 L0 220Z" fill="url(#fillPortfolio)"/>
              <path d="M0 176 C80 170 98 120 150 135 S240 148 285 102 S365 128 410 92 S505 75 548 88 S625 48 700 52" fill="none" stroke="#6ea8fe" strokeWidth="3"/>
            </svg>
          </div>
          <div className="graphLegend"><span>Starting value <b>$100,000</b></span><span>Current value <b>{money(equity)}</b></span></div>
        </section>

        <section className="premiumCard allocationPanel">
          <div className="sectionHeading"><div><small>ALLOCATION</small><h2>Portfolio mix</h2></div><PieChart size={18}/></div>
          {allocations.length?<>
            <div className="allocationBar">{allocations.map((a,i)=><i key={a.symbol} style={{width:a.weight+"%",background:a.stock?.color??"#718096"}}/>)}</div>
            <div className="allocationList">{allocations.slice(0,6).map(a=><div key={a.symbol}><span><i style={{background:a.stock?.color}}/>{a.symbol}</span><b>{a.weight.toFixed(1)}%</b></div>)}</div>
          </>:<div className="emptyState"><PieChart size={28}/><b>No investments yet</b><span>Your allocation will appear after your first paper trade.</span><a href="/trade">Browse the market</a></div>}
        </section>
      </div>

      <section className="premiumCard dataTableCard">
        <div className="sectionHeading"><div><small>POSITIONS</small><h2>Holdings</h2></div></div>
        {allocations.length?<div className="tableScroll"><table className="dataTable"><thead><tr><th>Company</th><th>Shares</th><th>Avg. cost</th><th>Last price</th><th>Market value</th><th>Return</th><th>Allocation</th></tr></thead><tbody>
          {allocations.map(a=><tr key={a.symbol}><td><div className="tableSymbol"><i style={{background:a.stock?.color}}/><span><b>{a.symbol}</b><small>{a.stock?.name}</small></span></div></td><td>{a.shares.toFixed(4)}</td><td>{money(a.avgCost)}</td><td>{money(a.stock?.price??a.avgCost)}</td><td><b>{money(a.value)}</b></td><td className={a.returnPct>=0?"up":"down"}>{a.returnPct>=0?<ArrowUpRight size={14}/>:<ArrowDownRight size={14}/>} {pct(a.returnPct)}</td><td>{a.weight.toFixed(1)}%</td></tr>)}
        </tbody></table></div>:<div className="emptyRow">No holdings yet. Your first trade will show up here.</div>}
      </section>

      <section className="premiumCard dataTableCard">
        <div className="sectionHeading"><div><small>ACTIVITY</small><h2>Trade history</h2></div></div>
        {trades.length?<div className="activityList">{trades.slice(0,12).map(t=><div className="activityRow" key={t.id}><span className={t.side==="BUY"?"activitySide buy":"activitySide sell"}>{t.side}</span><div><b>{t.symbol}</b><small>{new Date(t.createdAt).toLocaleString()}</small></div><span>{t.shares.toFixed(4)} shares</span><span>{money(t.price)} / share</span><strong>{money(t.total)}</strong></div>)}</div>:<div className="emptyRow">No completed trades yet.</div>}
      </section>
    </div>
  </AppShell>;
}
