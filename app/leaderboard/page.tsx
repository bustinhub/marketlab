"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { useClassroom } from "@/components/ClassroomProvider";

type Row={user_id:string;display_name:string;portfolio_value:number;return_percent:number;holdings_count:number};
function money(n:number){return n.toLocaleString("en-US",{style:"currency",currency:"USD"})}
function pct(n:number){return (n>=0?"+":"")+n.toFixed(2)+"%"}

export default function LeaderboardPage(){
  const {user,token}=useAuth();
  const {activeClass}=useClassroom();
  const [rows,setRows]=useState<Row[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{
    if(!user||!activeClass){setRows([]);return}
    const classId=activeClass.id;
    let cancelled=false;
    async function load(){
      const access=token();if(!access)return;
      setLoading(true);
      try{
        const res=await fetch("/api/leaderboard?classId="+encodeURIComponent(classId),{headers:{Authorization:"Bearer "+access},cache:"no-store"});
        const data=await res.json();
        if(cancelled)return;
        if(!res.ok)throw new Error(data.error||"Leaderboard unavailable.");
        setRows(data.rows||[]);setError("");
      }catch(e:any){if(!cancelled)setError(e?.message||"Leaderboard unavailable.")}
      finally{if(!cancelled)setLoading(false)}
    }
    void load();
    const id=setInterval(load,30000);
    return()=>{cancelled=true;clearInterval(id)};
  },[user?.id,activeClass?.id]);

  return <AppShell><div className="pageContainer">
    {!user?<div className="emptyPanel"><b>Sign in to view your class leaderboard.</b><Link className="primaryButton" href="/login">Sign in</Link></div>
    :!activeClass?<div className="emptyPanel"><b>Select a class.</b><Link className="primaryButton" href="/classes">Classes</Link></div>
    :<>
      <div className="pageHero"><div><small>LEADERBOARD</small><h1>{activeClass.name}</h1><p>{activeClass.period||activeClass.code}</p></div></div>
      {error&&<div className="formError wide">{error}</div>}
      <section className="premiumCard dataTableCard">
        <div className="sectionHeading"><div><small>STANDINGS</small><h2>{loading?"Updating…":rows.length+" students"}</h2></div></div>
        {!loading&&!rows.length?<div className="emptyPanel compact"><Trophy size={22}/><b>No student portfolios yet.</b></div>
        :<div className="leaderRows">{rows.map((r,i)=><div key={r.user_id} className={r.user_id===user.id?"leaderboardRow you":"leaderboardRow"}>
          <div className="rankNumber">{i+1}</div>
          <div className="leaderPerson"><div className="leaderAvatar">{r.display_name.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}</div><div><b>{r.display_name}</b><small>{r.user_id===user.id?"You":"Student"}</small></div></div>
          <div><span>Portfolio</span><b>{money(r.portfolio_value)}</b></div>
          <div><span>Return</span><b className={r.return_percent>=0?"up":"down"}>{pct(r.return_percent)}</b></div>
          <div><span>Positions</span><b>{r.holdings_count}</b></div>
        </div>)}</div>}
      </section>
    </>}
  </div></AppShell>;
}
