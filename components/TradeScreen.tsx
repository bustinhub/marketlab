"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Building2, CalendarDays, CircleDollarSign, Newspaper, Plus, Star, TrendingUp } from "lucide-react";
import { AppShell } from "./AppShell";
import { MarketChart } from "./MarketChart";
import { WatchlistRail } from "./WatchlistRail";
import { MARKET_INDEXES, money, pct } from "@/lib/market";
import { useTrading } from "./TradingProvider";

export function TradeScreen({initialSymbol="AAPL"}:{initialSymbol?:string}){
  const {stocks,selected,setSelected,watchlist,toggleWatchlist,feedMode}=useTrading();
  const [detailTab,setDetailTab]=useState<"overview"|"financials"|"news">("overview");

  useEffect(()=>{
    const symbol=initialSymbol.toUpperCase();
    if(stocks.some(s=>s.symbol===symbol)) setSelected(symbol);
  },[initialSymbol,setSelected]);

  const stock=stocks.find(s=>s.symbol===selected)??stocks[0];
  const dayChange=stock.price*(stock.changePercent/100);
  const onWatchlist=watchlist.includes(stock.symbol);

  const news=useMemo(()=>[
    {time:"12 min ago",title:stock.name+" remains active as investors digest the latest market session",source:"MarketLab Classroom News"},
    {time:"1 hr ago",title:"Technology shares lead volume across major U.S. indexes",source:"MarketLab Brief"},
    {time:"3 hr ago",title:"What students should know about price, volume, and market capitalization",source:"MarketLab Learn"},
  ],[stock.name]);

  return <AppShell rightRail={<WatchlistRail symbol={stock.symbol}/>}>
    <div className="marketStrip">
      <span className="stripLabel">MARKETS</span>
      {MARKET_INDEXES.map(i=><div key={i.symbol} className="indexItem"><b>{i.name}</b><span>{i.value}</span><em className={i.change>=0?"up":"down"}>{pct(i.change)}</em></div>)}
      <div className={feedMode==="live"?"marketStatus live":"marketStatus"}><i/>{feedMode==="live"?"Live quote feed":"Classroom demo feed"}</div>
    </div>

    <section className="instrumentHeader">
      <div className="instrumentIdentity">
        <div className="companyMark" style={{borderColor:stock.color}}>{stock.symbol.slice(0,1)}</div>
        <div><div className="symbolLine"><h1>{stock.symbol}</h1><span>{stock.name}</span><small>{stock.exchange}</small></div><p>{stock.sector}</p></div>
      </div>
      <div className="instrumentActions">
        <button className={onWatchlist?"iconTextButton active": "iconTextButton"} onClick={()=>toggleWatchlist(stock.symbol)}><Star size={16} fill={onWatchlist?"currentColor":"none"}/>{onWatchlist?"Watching":"Watch"}</button>
        <button className="iconButton"><Bell size={16}/></button>
        <button className="iconButton"><Plus size={16}/></button>
      </div>
      <div className="quoteBlock">
        <strong>{money(stock.price)}</strong>
        <span className={stock.changePercent>=0?"up":"down"}>{dayChange>=0?"+":""}{money(Math.abs(dayChange)).replace("$","$")} · {pct(stock.changePercent)}</span>
        <small>Today · USD</small>
      </div>
    </section>

    <section className="terminalCard">
      <MarketChart symbol={stock.symbol} price={stock.price}/>
    </section>

    <section className="statRibbon">
      <div><span>Open</span><b>{money(stock.price*(1-stock.changePercent/100))}</b></div>
      <div><span>Day range</span><b>{money(stock.price*.987)} — {money(stock.price*1.009)}</b></div>
      <div><span>52 week range</span><b>{money(stock.low52)} — {money(stock.high52)}</b></div>
      <div><span>Volume</span><b>{stock.volume}</b></div>
      <div><span>Market cap</span><b>{stock.marketCap}</b></div>
      <div><span>P/E ratio</span><b>{stock.pe}</b></div>
    </section>

    <div className="detailTabs">
      <button className={detailTab==="overview"?"active":""} onClick={()=>setDetailTab("overview")}>Overview</button>
      <button className={detailTab==="financials"?"active":""} onClick={()=>setDetailTab("financials")}>Financials</button>
      <button className={detailTab==="news"?"active":""} onClick={()=>setDetailTab("news")}>News & learning</button>
    </div>

    {detailTab==="overview"&&<section className="detailGrid">
      <article className="premiumCard companyOverview">
        <div className="sectionHeading"><div><small>COMPANY</small><h2>About {stock.name}</h2></div><Building2 size={19}/></div>
        <p>{stock.name} is listed on {stock.exchange} and is categorized in the {stock.sector} sector. MarketLab keeps this panel focused on the metrics students use most often when learning how public companies trade.</p>
        <div className="overviewFacts">
          <div><span>Exchange</span><b>{stock.exchange}</b></div><div><span>Sector</span><b>{stock.sector}</b></div><div><span>Symbol</span><b>{stock.symbol}</b></div><div><span>Currency</span><b>USD</b></div>
        </div>
      </article>
      <article className="premiumCard learningCallout">
        <div className="sectionHeading"><div><small>MARKETLAB EXPLAINS</small><h2>Reading this stock</h2></div><TrendingUp size={19}/></div>
        <p><b>Price</b> tells you what one share costs. <b>Volume</b> shows how actively shares are trading. <b>Market cap</b> estimates the total value of all outstanding shares.</p>
        <a href="/learn">Open the investing glossary →</a>
      </article>
    </section>}

    {detailTab==="financials"&&<section className="financialGrid">
      {[
        ["Market capitalization",stock.marketCap,"Company size based on share price"],
        ["P/E ratio",stock.pe,"Price relative to earnings"],
        ["52-week high",money(stock.high52),"Highest price in the displayed yearly range"],
        ["52-week low",money(stock.low52),"Lowest price in the displayed yearly range"],
        ["Volume",stock.volume,"Shares changing hands in the current session"],
        ["Sector",stock.sector,"Industry classification"],
      ].map(([label,value,help])=><article className="metricCard" key={label}><span>{label}</span><strong>{value}</strong><small>{help}</small></article>)}
    </section>}

    {detailTab==="news"&&<section className="newsList">
      {news.map((n,i)=><article key={i} className="newsItem"><div className="newsIcon">{i===2?<CircleDollarSign size={19}/>:<Newspaper size={19}/>}</div><div><small>{n.source} · {n.time}</small><h3>{n.title}</h3></div><CalendarDays size={16}/></article>)}
    </section>}
  </AppShell>;
}
