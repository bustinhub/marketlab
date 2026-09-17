"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BookOpen, GraduationCap, LayoutDashboard, Search, Settings, Trophy, Users, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { useTrading } from "./TradingProvider";
import { MARKET_SYMBOLS } from "@/lib/market";

const nav=[
  {href:"/trade",label:"Markets",icon:BarChart3},
  {href:"/portfolio",label:"Portfolio",icon:WalletCards},
  {href:"/leaderboard",label:"Leaderboard",icon:Trophy},
  {href:"/learn",label:"Learn",icon:BookOpen},
  {href:"/teacher",label:"Teacher",icon:GraduationCap},
];

export function AppShell({children,rightRail}:{children:React.ReactNode;rightRail?:React.ReactNode}){
  const pathname=usePathname();
  const router=useRouter();
  const {feedMode,equity}=useTrading();
  const [query,setQuery]=useState("");
  const results=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q) return [];
    return MARKET_SYMBOLS.filter(s=>s.symbol.toLowerCase().includes(q)||s.name.toLowerCase().includes(q)).slice(0,6);
  },[query]);

  function openSymbol(symbol:string){
    setQuery("");
    router.push(`/trade?symbol=${symbol}`);
  }

  return <div className="appFrame">
    <header className="appTopbar">
      <BrandLogo/>
      <div className="globalSearch">
        <Search size={16}/>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search a company or symbol"/>
        <kbd>⌘ K</kbd>
        {results.length>0&&<div className="globalSearchMenu">
          {results.map(s=><button key={s.symbol} onClick={()=>openSymbol(s.symbol)}>
            <span className="symbolChip">{s.symbol.slice(0,1)}</span>
            <span><b>{s.symbol}</b><small>{s.name}</small></span>
            <em>{s.exchange}</em>
          </button>)}
        </div>}
      </div>
      <div className="topbarMeta">
        <div className={feedMode==="live"?"feedBadge live":"feedBadge"}><i/>{feedMode==="live"?"LIVE DATA":"DEMO FEED"}</div>
        <div className="topEquity"><span>Portfolio</span><strong>${equity.toLocaleString("en-US",{maximumFractionDigits:0})}</strong></div>
        <button className="userAvatar">AY</button>
      </div>
    </header>

    <div className={rightRail?"shellGrid withRail":"shellGrid"}>
      <aside className="sidebar">
        <div className="navGroup">
          <span className="navLabel">WORKSPACE</span>
          {nav.map(item=>{
            const Icon=item.icon;
            const active=pathname===item.href;
            return <Link key={item.href} href={item.href} className={active?"sideLink active":"sideLink"}><Icon size={18}/><span>{item.label}</span></Link>
          })}
        </div>
        <div className="classSummary">
          <div className="classIcon"><Users size={17}/></div>
          <div><small>PERSONAL FINANCE</small><strong>Period 3</strong><span>PF3-2026 · 24 students</span></div>
        </div>
        <div className="sidebarBottom">
          <Link href="/teacher" className="sideLink"><LayoutDashboard size={18}/><span>Classroom</span></Link>
          <button className="sideLink"><Settings size={18}/><span>Settings</span></button>
        </div>
      </aside>
      <main className="appContent">{children}</main>
      {rightRail&&<aside className="rightRail">{rightRail}</aside>}
    </div>
  </div>;
}
