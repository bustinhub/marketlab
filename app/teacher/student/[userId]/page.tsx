"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, History, Wallet } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { useClassroom } from "@/components/ClassroomProvider";

type Detail={
  student:{user_id:string;display_name:string};
  portfolio:{cash_balance:number;starting_balance:number;value:number;return_percent:number};
  holdings:Array<{symbol:string;shares:number;avg_cost:number;last:number;value:number;return_percent:number}>;
  trades:Array<{id:string;symbol:string;side:"BUY"|"SELL";shares:number;price:number;total:number;executed_at:string}>;
};
const money=(n:number)=>n.toLocaleString("en-US",{style:"currency",currency:"USD"});
const pct=(n:number)=>(n>=0?"+":"")+n.toFixed(2)+"%";

export default function StudentPortfolioPage(){
  const params=useParams<{userId:string}>();
  const {user,profile,token}=useAuth();
  const {activeClass}=useClassroom();
  const [detail,setDetail]=useState<Detail|null>(null);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    if(!user||!activeClass||!params.userId){setLoading(false);return}
    const classId=activeClass.id,userId=params.userId;
    let cancelled=false;
    async function load(){
      const access=token();if(!access)return;
      setLoading(true);
      try{
        const res=await fetch("/api/classes/"+classId+"/students/"+userId+"/portfolio",{headers:{Authorization:"Bearer "+access},cache:"no-store"});
        const data=await res.json();
        if(cancelled)return;
        if(!res.ok)throw new Error(data.error||"Student portfolio unavailable.");
        setDetail(data);setError("");
      }catch(e:any){if(!cancelled)setError(e?.message||"Student portfolio unavailable.")}
      finally{if(!cancelled)setLoading(false)}
    }
    void load();
    return()=>{cancelled=true};
  },[user?.id,activeClass?.id,params.userId]);

  if(!user||(profile?.role!=="teacher"&&profile?.role!=="owner"))return <AppShell><div className="pageContainer"><div className="emptyPanel"><b>Teacher account required.</b></div></div></AppShell>;
  if(!activeClass)return <AppShell><div className="pageContainer"><div className="emptyPanel"><b>Select a class first.</b><Link className="primaryButton" href="/classes">Classes</Link></div></div></AppShell>;

  return <AppShell><div className="pageContainer">
    <Link href="/teacher" className="backLink"><ArrowLeft size={14}/> Back to class</Link>
    {loading?<div className="emptyPanel">Loading…</div>:error?<div className="formError wide">{error}</div>:detail&&<>
      <div className="pageHero"><div><small>STUDENT PORTFOLIO</small><h1>{detail.student.display_name}</h1><p>{activeClass.name}</p></div></div>
      <div className="summaryGrid four">
        <article className="summaryCard"><span><Wallet size={15}/> Portfolio value</span><strong>{money(detail.portfolio.value)}</strong></article>
        <article className="summaryCard"><span>Buying power</span><strong>{money(detail.portfolio.cash_balance)}</strong></article>
        <article className="summaryCard"><span>Total return</span><strong className={detail.portfolio.return_percent>=0?"up":"down"}>{pct(detail.portfolio.return_percent)}</strong></article>
        <article className="summaryCard"><span><History size={15}/> Trades</span><strong>{detail.trades.length}</strong></article>
      </div>
      <section className="premiumCard dataTableCard">
        <div className="sectionHeading"><div><small>HOLDINGS</small><h2>{detail.holdings.length} positions</h2></div></div>
        {detail.holdings.length?<div className="tableScroll"><table className="dataTable"><thead><tr><th>Symbol</th><th>Shares</th><th>Avg. cost</th><th>Last</th><th>Value</th><th>Return</th></tr></thead><tbody>
          {detail.holdings.map(h=><tr key={h.symbol}><td><b>{h.symbol}</b></td><td>{h.shares.toFixed(4)}</td><td>{money(h.avg_cost)}</td><td>{money(h.last)}</td><td>{money(h.value)}</td><td className={h.return_percent>=0?"up":"down"}>{pct(h.return_percent)}</td></tr>)}
        </tbody></table></div>:<div className="emptyRow">No holdings.</div>}
      </section>
      <section className="premiumCard dataTableCard">
        <div className="sectionHeading"><div><small>TRADE HISTORY</small><h2>{detail.trades.length} trades</h2></div></div>
        {detail.trades.length?<div className="activityList">{detail.trades.map(t=><div className="activityRow" key={t.id}><span className={t.side==="BUY"?"activitySide buy":"activitySide sell"}>{t.side}</span><div><b>{t.symbol}</b><small>{new Date(t.executed_at).toLocaleString()}</small></div><span>{t.shares.toFixed(4)} shares</span><span>{money(t.price)}</span><strong>{money(t.total)}</strong></div>)}</div>:<div className="emptyRow">No trades.</div>}
      </section>
    </>}
  </div></AppShell>;
}
