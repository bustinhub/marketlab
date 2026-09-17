"use client";

import { useState } from "react";
import { Activity, Lock, RotateCcw, Settings2, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useTrading } from "@/components/TradingProvider";
import { CLASSMATES, money } from "@/lib/market";

export default function TeacherPage(){
  const {resetPortfolio,trades}=useTrading();
  const [tradingOpen,setTradingOpen]=useState(true);
  const [publicHoldings,setPublicHoldings]=useState(false);
  const [confirmReset,setConfirmReset]=useState(false);

  return <AppShell>
    <div className="pageContainer">
      <div className="pageHero">
        <div><small>TEACHER CONSOLE</small><h1>Personal Finance · Period 3</h1><p>Class code <b>PF3-2026</b> · Classroom paper trading controls</p></div>
        <button className="primaryButton"><Settings2 size={16}/> Class settings</button>
      </div>

      <div className="summaryGrid four">
        <article className="summaryCard"><span><Users size={15}/> Students</span><strong>24</strong><small>22 active this week</small></article>
        <article className="summaryCard"><span><Activity size={15}/> Class trades</span><strong>{118+trades.length}</strong><small>Across all portfolios</small></article>
        <article className="summaryCard"><span><ShieldCheck size={15}/> Starting cash</span><strong>$100,000</strong><small>Per student</small></article>
        <article className="summaryCard"><span><Lock size={15}/> Market access</span><strong>{tradingOpen?"Open":"Frozen"}</strong><small>Teacher controlled</small></article>
      </div>

      <div className="teacherGrid">
        <section className="premiumCard controlPanel">
          <div className="sectionHeading"><div><small>COMPETITION CONTROLS</small><h2>Classroom rules</h2></div></div>
          <div className="settingRow"><div><b>Allow trading</b><span>Students can place simulated buy and sell orders.</span></div><button className={tradingOpen?"toggle on":"toggle"} onClick={()=>setTradingOpen(v=>!v)}><i/></button></div>
          <div className="settingRow"><div><b>Public holdings</b><span>Let classmates see each other's individual stock positions.</span></div><button className={publicHoldings?"toggle on":"toggle"} onClick={()=>setPublicHoldings(v=>!v)}><i/></button></div>
          <div className="settingRow"><div><b>Fractional shares</b><span>Allow students to invest by dollar amount.</span></div><button className="toggle on"><i/></button></div>
          <div className="settingRow"><div><b>Competition end</b><span>October 10, 2026 · 4:00 PM ET</span></div><button className="smallButton">Edit</button></div>
        </section>

        <section className="premiumCard controlPanel dangerPanel">
          <div className="sectionHeading"><div><small>CLASS ACTIONS</small><h2>Portfolio controls</h2></div></div>
          <div className="teacherAction"><div><b>Freeze all trading</b><span>Pause new orders without changing student portfolios.</span></div><button className="secondaryButton" onClick={()=>setTradingOpen(false)}>Freeze</button></div>
          <div className="teacherAction"><div><b>Reset demo portfolio</b><span>Reset your local test account back to $100,000.</span></div>{confirmReset?<div className="confirmButtons"><button onClick={()=>setConfirmReset(false)}>Cancel</button><button className="dangerButton" onClick={()=>{resetPortfolio();setConfirmReset(false)}}>Confirm reset</button></div>:<button className="secondaryButton" onClick={()=>setConfirmReset(true)}><RotateCcw size={14}/> Reset</button>}</div>
        </section>
      </div>

      <section className="premiumCard dataTableCard">
        <div className="sectionHeading"><div><small>STUDENTS</small><h2>Class roster</h2></div><button className="smallButton">Export class report</button></div>
        <div className="teacherStudentRows">
          {CLASSMATES.map((s,i)=><div className="teacherStudent" key={s.name}><div className="leaderAvatar">{s.badge}</div><div><b>{s.name}</b><small>Student #{i+1}</small></div><div><span>Portfolio</span><b>{money(s.value)}</b></div><div><span>Return</span><b className={s.returnPct>=0?"up":"down"}>{s.returnPct>=0?"+":""}{s.returnPct.toFixed(2)}%</b></div><div><span>Trades</span><b>{s.trades}</b></div><button className="smallButton">View</button></div>)}
        </div>
      </section>
    </div>
  </AppShell>;
}
