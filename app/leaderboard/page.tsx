"use client";

import { Crown, Medal, Trophy, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useTrading } from "@/components/TradingProvider";
import { CLASSMATES, money, pct } from "@/lib/market";

export default function LeaderboardPage(){
  const {equity,totalReturn,trades}=useTrading();
  const rows=[...CLASSMATES,{name:"You",value:equity,returnPct:totalReturn,today:totalReturn/5,trades:trades.length,badge:"AY"}].sort((a,b)=>b.value-a.value);
  const top=rows.slice(0,3);

  return <AppShell>
    <div className="pageContainer">
      <div className="pageHero leaderboardHero">
        <div><small>CLASS COMPETITION</small><h1>Leaderboard</h1><p>Learn by building a portfolio — without risking real money.</p></div>
        <div className="competitionMeta"><span><Users size={15}/> 24 students</span><b>23 days remaining</b></div>
      </div>

      <div className="podiumGrid">
        {top.map((r,i)=><article key={r.name} className={"podiumCard place"+(i+1)}>
          <div className="podiumRank">{i===0?<Crown size={22}/>:<Medal size={22}/>}<span>#{i+1}</span></div>
          <div className="podiumAvatar">{r.badge}</div>
          <h2>{r.name}</h2><strong>{money(r.value)}</strong><span className={r.returnPct>=0?"up":"down"}>{pct(r.returnPct)}</span>
        </article>)}
      </div>

      <section className="premiumCard classStats">
        <div><Trophy size={18}/><span>Class leader</span><b>{rows[0].name}</b></div>
        <div><span>Average portfolio</span><b>{money(rows.reduce((s,r)=>s+r.value,0)/rows.length)}</b></div>
        <div><span>Total paper trades</span><b>{rows.reduce((s,r)=>s+r.trades,0)}</b></div>
        <div><span>Starting balance</span><b>$100,000</b></div>
      </section>

      <section className="premiumCard dataTableCard">
        <div className="sectionHeading leaderboardHeading"><div><small>STANDINGS</small><h2>Personal Finance · Period 3</h2></div><div className="filterPills"><button className="active">Overall</button><button>Today</button><button>This week</button></div></div>
        <div className="leaderRows">
          {rows.map((r,i)=><div key={r.name} className={r.name==="You"?"leaderboardRow you":"leaderboardRow"}>
            <div className="rankNumber">{i+1}</div>
            <div className="leaderPerson"><div className="leaderAvatar">{r.badge}</div><div><b>{r.name}</b><small>{r.name==="You"?"Your account":"Student"}</small></div></div>
            <div><span>Portfolio</span><b>{money(r.value)}</b></div>
            <div><span>Today</span><b className={r.today>=0?"up":"down"}>{pct(r.today)}</b></div>
            <div><span>Total return</span><b className={r.returnPct>=0?"up":"down"}>{pct(r.returnPct)}</b></div>
            <div><span>Trades</span><b>{r.trades}</b></div>
          </div>)}
        </div>
      </section>
    </div>
  </AppShell>;
}
