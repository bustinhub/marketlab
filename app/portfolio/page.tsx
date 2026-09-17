"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, CircleDollarSign, History, PieChart, Wallet } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useTrading } from "@/components/TradingProvider";
import { useAuth } from "@/components/AuthProvider";
import { useClassroom } from "@/components/ClassroomProvider";

function money(n:number){return n.toLocaleString("en-US",{style:"currency",currency:"USD"})}
function pct(n:number){return (n>=0?"+":"")+n.toFixed(2)+"%"}

export default function PortfolioPage(){
  const {user}=useAuth();
  const {activeClass}=useClassroom();
  const {cash,startingBalance,holdings,trades,quotes,equity,invested,totalReturn,portfolioLoading,portfolioReady}=useTrading();
  const allocations=holdings.map(h=>{
    const price=quotes[h.symbol]?.price??h.avgCost;
    const value=price*h.shares;
    return {...h,price,value,weight:invested?value/invested*100:0,returnPct:((price-h.avgCost)/h.avgCost)*100};
  }).sort((a,b)=>b.value-a.value);

  return <AppShell>
    <div className="pageContainer">
      {!user?<div className="emptyPanel"><b>Sign in to view a portfolio.</b><Link className="primaryButton" href="/login">Sign in</Link></div>
      :!activeClass?<div className="emptyPanel"><b>Choose a class first.</b><Link className="primaryButton" href="/classes">Classes</Link></div>
      :activeClass.member_role!=="student"?<div className="emptyPanel"><b>Teacher accounts do not have student portfolios.</b><Link className="primaryButton" href="/teacher">Teacher console</Link></div>
      :portfolioLoading?<div className="emptyPanel">Loading portfolio…</div>
      :!portfolioReady?<div className="emptyPanel"><b>Portfolio unavailable.</b><span>Rejoin the class or refresh the page.</span></div>
      :<>
        <div className="pageHero"><div><small>{activeClass.name.toUpperCase()}</small><h1>{money(equity)}</h1><p className={totalReturn>=0?"up":"down"}>{pct(totalReturn)} total return</p></div></div>
        <div className="summaryGrid four">
          <article className="summaryCard"><span><Wallet size={15}/> Buying power</span><strong>{money(cash)}</strong></article>
          <article className="summaryCard"><span><CircleDollarSign size={15}/> Invested</span><strong>{money(invested)}</strong></article>
          <article className="summaryCard"><span>{totalReturn>=0?<ArrowUpRight size={15}/>:<ArrowDownRight size={15}/>} Return</span><strong className={totalReturn>=0?"up":"down"}>{pct(totalReturn)}</strong><small>{money(equity-startingBalance)} vs. start</small></article>
          <article className="summaryCard"><span><History size={15}/> Trades</span><strong>{trades.length}</strong></article>
        </div>

        <section className="premiumCard allocationPanel fullAllocation">
          <div className="sectionHeading"><div><small>ALLOCATION</small><h2>Positions</h2></div><PieChart size={18}/></div>
          {allocations.length?<><div className="allocationBar">{allocations.map((a,i)=><i key={a.symbol} style={{width:a.weight+"%",background:["#2962ff","#26a69a","#ab47bc","#ffa726","#42a5f5","#ef5350"][i%6]}}/>)}</div>
          <div className="allocationList">{allocations.map((a,i)=><div key={a.symbol}><span><i style={{background:["#2962ff","#26a69a","#ab47bc","#ffa726","#42a5f5","#ef5350"][i%6]}}/>{a.symbol}</span><b>{a.weight.toFixed(1)}%</b></div>)}</div></>:<div className="emptyRow">No positions yet.</div>}
        </section>

        <section className="premiumCard dataTableCard">
          <div className="sectionHeading"><div><small>HOLDINGS</small><h2>Portfolio</h2></div></div>
          {allocations.length?<div className="tableScroll"><table className="dataTable"><thead><tr><th>Symbol</th><th>Shares</th><th>Avg. cost</th><th>Last</th><th>Market value</th><th>Return</th><th>Weight</th></tr></thead><tbody>
            {allocations.map(a=><tr key={a.symbol}><td><b>{a.symbol}</b></td><td>{a.shares.toFixed(4)}</td><td>{money(a.avgCost)}</td><td>{money(a.price)}</td><td><b>{money(a.value)}</b></td><td className={a.returnPct>=0?"up":"down"}>{pct(a.returnPct)}</td><td>{a.weight.toFixed(1)}%</td></tr>)}
          </tbody></table></div>:<div className="emptyRow">No holdings yet. <Link href="/trade">Browse stocks</Link>.</div>}
        </section>

        <section className="premiumCard dataTableCard">
          <div className="sectionHeading"><div><small>ACTIVITY</small><h2>Trades</h2></div></div>
          {trades.length?<div className="activityList">{trades.map(t=><div className="activityRow" key={t.id}><span className={t.side==="BUY"?"activitySide buy":"activitySide sell"}>{t.side}</span><div><b>{t.symbol}</b><small>{new Date(t.createdAt).toLocaleString()}</small></div><span>{t.shares.toFixed(4)} shares</span><span>{money(t.price)}</span><strong>{money(t.total)}</strong></div>)}</div>:<div className="emptyRow">No trades yet.</div>}
        </section>
      </>}
    </div>
  </AppShell>;
}
