"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {Trophy} from "lucide-react";
import {AppShell} from "@/components/AppShell";
import {useAuth} from "@/components/AuthProvider";
import {useClassroom} from "@/components/ClassroomProvider";

type Row={user_id:string;display_name:string;portfolio_value:number;return_percent:number;holdings_count:number};
const money=(n:number)=>n.toLocaleString("en-US",{style:"currency",currency:"USD"});
const pct=(n:number)=>(n>=0?"+":"")+n.toFixed(2)+"%";
const initials=(n:string)=>n.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();

function Podium({row,rank,you}:{row:Row;rank:1|2|3;you:boolean}){
 return <div className={"podiumCard podium"+rank+(you?" you":"")}>
  <div className="podiumPerson"><div className="podiumAvatar">{initials(row.display_name)}</div><b>{row.display_name}</b><span className={row.return_percent>=0?"up":"down"}>{pct(row.return_percent)}</span></div>
  <div className="podiumBlock"><strong>{rank}</strong><small>{money(row.portfolio_value)}</small></div>
 </div>;
}

export default function LeaderboardPage(){
 const {user,token}=useAuth();
 const {activeClass}=useClassroom();
 const [rows,setRows]=useState<Row[]>([]);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");

 useEffect(()=>{
  if(!user||!activeClass){setRows([]);return}
  let cancelled=false;
  const load=async()=>{
   const access=token(); if(!access)return;
   setLoading(true);
   try{
    const res=await fetch("/api/leaderboard?classId="+encodeURIComponent(activeClass.id),{headers:{Authorization:"Bearer "+access},cache:"no-store"});
    const data=await res.json();
    if(cancelled)return;
    if(!res.ok)throw new Error(data.error||"Leaderboard unavailable.");
    setRows(data.rows||[]); setError("");
   }catch(e:any){if(!cancelled)setError(e?.message||"Leaderboard unavailable.")}
   finally{if(!cancelled)setLoading(false)}
  };
  void load(); const id=setInterval(load,30000);
  return()=>{cancelled=true;clearInterval(id)};
 },[user?.id,activeClass?.id]);

 if(!user)return <AppShell><div className="pageContainer"><div className="emptyPanel"><b>Sign in to view your class leaderboard.</b><Link className="primaryButton" href="/login">Sign in</Link></div></div></AppShell>;
 if(!activeClass)return <AppShell><div className="pageContainer"><div className="emptyPanel"><b>Select a class.</b><Link className="primaryButton" href="/classes">Classes</Link></div></div></AppShell>;

 const [first,second,third]=rows;
 const rest=rows.slice(3);

 return <AppShell><div className="pageContainer leaderboardPage">
  <div className="pageHero leaderboardHero"><div><small>LEADERBOARD</small><h1>{activeClass.name}</h1><p>{activeClass.period||activeClass.code}</p></div></div>
  {error&&<div className="formError wide">{error}</div>}
  {loading&&!rows.length?<div className="leaderboardLoading">Updating standings…</div>
  :!rows.length?<div className="emptyPanel compact leaderboardEmpty"><Trophy size={24}/><b>No student portfolios yet.</b></div>
  :<>
   <section className="podium">
    {second&&<Podium row={second} rank={2} you={second.user_id===user.id}/>}
    {first&&<Podium row={first} rank={1} you={first.user_id===user.id}/>}
    {third&&<Podium row={third} rank={3} you={third.user_id===user.id}/>}
   </section>
   {rest.length>0&&<section className="leaderboardList">
    <div className="leaderboardListHead"><span>Rank</span><span>Student</span><span>Portfolio</span><span>Return</span><span>Positions</span></div>
    {rest.map((r,i)=><div key={r.user_id} className={r.user_id===user.id?"leaderboardRow you":"leaderboardRow"}>
     <div className="rankNumber">{i+4}</div>
     <div className="leaderPerson"><div className="leaderAvatar">{initials(r.display_name)}</div><div><b>{r.display_name}</b><small>{r.user_id===user.id?"You":"Student"}</small></div></div>
     <div><span>Portfolio</span><b>{money(r.portfolio_value)}</b></div>
     <div><span>Return</span><b className={r.return_percent>=0?"up":"down"}>{pct(r.return_percent)}</b></div>
     <div><span>Positions</span><b>{r.holdings_count}</b></div>
    </div>)}
   </section>}
  </>}
 </div></AppShell>;
}
