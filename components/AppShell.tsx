"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BookOpen, GraduationCap, LogIn, Search, Trophy, Users, WalletCards } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { useTrading } from "./TradingProvider";
import { useAuth } from "./AuthProvider";
import { useClassroom } from "./ClassroomProvider";

type SearchResult={symbol:string;name:string;exchange:string;type:string};

export function AppShell({children,rightRail}:{children:React.ReactNode;rightRail?:React.ReactNode}){
  const pathname=usePathname();
  const router=useRouter();
  const {feedMode,equity,setSelected}=useTrading();
  const {user,profile,signOut}=useAuth();
  const {activeClass,classes}=useClassroom();
  const [query,setQuery]=useState("");
  const searchInput=useRef<HTMLInputElement|null>(null);
  const [results,setResults]=useState<SearchResult[]>([]);
  const [searching,setSearching]=useState(false);

  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();searchInput.current?.focus()}
      if(event.key==="/"&&document.activeElement?.tagName!=="INPUT"&&document.activeElement?.tagName!=="TEXTAREA"){event.preventDefault();searchInput.current?.focus()}
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[]);

  useEffect(()=>{
    const q=query.trim();
    if(!q){setResults([]);setSearching(false);return}
    setSearching(true);
    const id=setTimeout(async()=>{
      try{
        const res=await fetch("/api/market/search?q="+encodeURIComponent(q),{cache:"no-store"});
        const data=await res.json();
        setResults(res.ok&&Array.isArray(data.results)?data.results.slice(0,10):[]);
      }catch{setResults([])}
      finally{setSearching(false)}
    },220);
    return()=>clearTimeout(id);
  },[query]);

  function openSymbol(symbol:string){
    setQuery("");setResults([]);setSelected(symbol);router.push("/trade?symbol="+encodeURIComponent(symbol));
  }

  const initials=useMemo(()=>{
    const name=profile?.display_name||user?.email||"";
    return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase()||"U";
  },[profile?.display_name,user?.email]);

  const nav=[
    {href:"/trade",label:"Markets",icon:BarChart3},
    {href:"/portfolio",label:"Portfolio",icon:WalletCards},
    {href:"/leaderboard",label:"Ranks",icon:Trophy},
    {href:"/classes",label:"Classes",icon:Users},
    {href:"/learn",label:"Learn",icon:BookOpen},
    ...(profile?.role==="teacher"?[{href:"/teacher",label:"Teacher",icon:GraduationCap}]:[]),
  ];

  return <div className="appFrame workspaceTheme">
    <header className="appTopbar">
      <BrandLogo/>
      <div className="globalSearch">
        <Search size={15}/>
        <input ref={searchInput} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search ticker or company"/>
        <kbd>⌘K</kbd>
        {(query&&results.length>0)&&<div className="globalSearchMenu">
          {results.map(s=><button key={s.exchange+":"+s.symbol} onClick={()=>openSymbol(s.symbol)}>
            <span className="symbolChip">{s.symbol.slice(0,1)}</span>
            <span><b>{s.symbol}</b><small>{s.name}</small></span>
            <em>{s.exchange}</em>
          </button>)}
        </div>}
        {query&&searching&&<div className="searchStatus">Searching…</div>}
      </div>

      <div className="topbarMeta">
        {user&&<Link href="/classes" className="topClassPill">
          <span>{activeClass?.name||"No class"}</span>
          <small>{activeClass?(activeClass.period||activeClass.code):(classes.length?classes.length+" classes":"Choose class")}</small>
        </Link>}
        <div className={feedMode==="live"?"feedBadge live":"feedBadge"}><i/>{feedMode==="live"?"LIVE":feedMode==="connecting"?"CONNECTING":"OFFLINE"}</div>
        {user&&activeClass?.member_role==="student"&&<div className="topEquity"><span>Equity</span><strong>{"$"}{equity.toLocaleString("en-US",{maximumFractionDigits:0})}</strong></div>}
        {user?<div className="accountMenu">
          <button className="userAvatar" title={profile?.display_name||user.email||""}>{initials}</button>
          <div className="accountText"><b>{profile?.display_name||"Account"}</b><span>{profile?.role||"student"}</span></div>
          <button className="signOutLink" onClick={()=>void signOut()}>Sign out</button>
        </div>:<Link className="topSignIn" href="/login"><LogIn size={14}/> Sign in</Link>}
      </div>
    </header>

    <div className={rightRail?"shellGrid withRail":"shellGrid"}>
      <aside className="sidebar">
        <div className="navGroup">
          {nav.map(item=>{
            const Icon=item.icon;
            const active=pathname===item.href||pathname.startsWith(item.href+"/");
            return <Link title={item.label} key={item.href} href={item.href} className={active?"sideLink active":"sideLink"}>
              <Icon size={18}/><span>{item.label}</span>
            </Link>
          })}
        </div>
      </aside>
      <main className="appContent">{children}</main>
      {rightRail&&<aside className="rightRail">{rightRail}</aside>}
    </div>
  </div>;
}
