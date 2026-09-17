"use client";

import { useEffect } from "react";
import { Bell, Plus, Star } from "lucide-react";
import { AppShell } from "./AppShell";
import { MarketChart } from "./MarketChart";
import { WatchlistRail } from "./WatchlistRail";
import { useTrading } from "./TradingProvider";

function money(n:number,currency="USD"){
  try{return n.toLocaleString("en-US",{style:"currency",currency,minimumFractionDigits:2,maximumFractionDigits:2})}
  catch{return "$"+n.toFixed(2)}
}
function compact(n:number){return n?Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:2}).format(n):"—"}

export function TradeScreen({initialSymbol="AAPL"}:{initialSymbol?:string}){
  const {selected,setSelected,quote,quoteLoading,marketError,watchlist,toggleWatchlist,loadQuote}=useTrading();

  useEffect(()=>{
    const symbol=initialSymbol.toUpperCase();
    setSelected(symbol);
    void loadQuote(symbol);
  },[initialSymbol]);

  const symbol=selected||initialSymbol.toUpperCase();
  const onWatchlist=watchlist.includes(symbol);

  return <AppShell rightRail={<WatchlistRail symbol={symbol}/>}>
    <section className="instrumentHeader clean">
      <div className="instrumentIdentity">
        <div className="companyMark">{symbol.slice(0,1)}</div>
        <div>
          <div className="symbolLine"><h1>{symbol}</h1><span>{quote?.name||""}</span>{quote?.exchange&&<small>{quote.exchange}</small>}</div>
          <p>{quote?.currency||"USD"}</p>
        </div>
      </div>
      <div className="instrumentActions">
        <button className={onWatchlist?"iconTextButton active":"iconTextButton"} onClick={()=>toggleWatchlist(symbol)}><Star size={16} fill={onWatchlist?"currentColor":"none"}/>{onWatchlist?"Watching":"Watch"}</button>
        <button className="iconButton" title="Price alert"><Bell size={16}/></button>
        <button className="iconButton" title="Add"><Plus size={16}/></button>
      </div>
      <div className="quoteBlock">
        <strong>{quote?money(quote.price,quote.currency):quoteLoading?"Loading…":"—"}</strong>
        {quote&&<span className={quote.changePercent>=0?"up":"down"}>{quote.change>=0?"+":""}{money(Math.abs(quote.change),quote.currency)} · {quote.changePercent>=0?"+":""}{quote.changePercent.toFixed(2)}%</span>}
        <small>{quote?.datetime||""}{quote&&typeof quote.isMarketOpen==="boolean" ? (quote.isMarketOpen?" · Market open":" · Market closed") : ""}</small>
      </div>
      {marketError&&<div className="marketError">{marketError}</div>}
    </section>

    <section className="terminalCard">
      <MarketChart symbol={symbol} price={quote?.price||0}/>
    </section>

    <section className="statRibbon compactStats">
      <div><span>Open</span><b>{quote?.open?money(quote.open,quote.currency):"—"}</b></div>
      <div><span>High</span><b>{quote?.high?money(quote.high,quote.currency):"—"}</b></div>
      <div><span>Low</span><b>{quote?.low?money(quote.low,quote.currency):"—"}</b></div>
      <div><span>Previous close</span><b>{quote?.previousClose?money(quote.previousClose,quote.currency):"—"}</b></div>
      <div><span>Volume</span><b>{quote?.volume?compact(quote.volume):"—"}</b></div>
      <div><span>Exchange</span><b>{quote?.exchange||"—"}</b></div>
    </section>
  </AppShell>;
}
