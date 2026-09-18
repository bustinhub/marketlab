"use client";

import { useEffect } from "react";
import { Star } from "lucide-react";
import { AppShell } from "./AppShell";
import { MarketChart } from "./MarketChart";
import { WatchlistRail } from "./WatchlistRail";
import { useTrading } from "./TradingProvider";
import { StockLogo, getStockMeta } from "./StockLogo";

function money(n:number,currency="USD"){
  try{return n.toLocaleString("en-US",{style:"currency",currency,minimumFractionDigits:2,maximumFractionDigits:2})}
  catch{return "$"+n.toFixed(2)}
}
function compact(n:number){return n?Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:2}).format(n):"—"}

export function TradeScreen({initialSymbol="AAPL"}:{initialSymbol?:string}){
  const {selected,setSelected,quote,quoteLoading,watchlist,toggleWatchlist,loadQuote}=useTrading();

  useEffect(()=>{
    const symbol=initialSymbol.toUpperCase();
    setSelected(symbol);
    void loadQuote(symbol);
  },[initialSymbol]);

  const symbol=selected||initialSymbol.toUpperCase();
  const fallback=getStockMeta(symbol);
  const name=quote?.name||fallback?.name||symbol;
  const exchange=quote?.exchange||fallback?.exchange||"US";
  const currency=quote?.currency||"USD";
  const onWatchlist=watchlist.includes(symbol);
  const changeClass=(quote?.changePercent??0)>=0?"up":"down";

  return <AppShell rightRail={<WatchlistRail symbol={symbol}/>}>
    <div className="tradeWorkspace">
      <section className="instrumentHeader instrumentHeaderV2">
        <div className="instrumentIdentity instrumentIdentityV2">
          <StockLogo symbol={symbol} size={56}/>
          <div className="instrumentCopy">
            <h1>{name}</h1>
            <div className="instrumentMeta">
              <b>{symbol}</b>
              <span>·</span>
              <span>{exchange}</span>
              <span>·</span>
              <span>{currency}</span>
            </div>
          </div>
        </div>

        {quote&&<div className="quoteBlock quoteBlockV2">
          <strong>{money(quote.price,currency)}</strong>
          <span className={changeClass}>{quote.change>=0?"+":"-"}{money(Math.abs(quote.change),currency)} ({quote.changePercent>=0?"+":""}{quote.changePercent.toFixed(2)}%)</span>
          {quote.datetime&&<small>Updated {quote.datetime}</small>}
        </div>}

        {!quote&&quoteLoading&&<div className="quoteLoading">Loading quote…</div>}

        <button aria-label={onWatchlist?"Remove from watchlist":"Add to watchlist"} className={onWatchlist?"watchToggle active":"watchToggle"} onClick={()=>toggleWatchlist(symbol)}>
          <Star size={16} fill={onWatchlist?"currentColor":"none"}/>
        </button>
      </section>

      <section className="terminalCard terminalCardV2">
        <MarketChart symbol={symbol} exchange={exchange}/>
      </section>

      {quote&&<section className="statRibbon compactStats">
        <div><span>Open</span><b>{quote.open?money(quote.open,currency):"—"}</b></div>
        <div><span>High</span><b>{quote.high?money(quote.high,currency):"—"}</b></div>
        <div><span>Low</span><b>{quote.low?money(quote.low,currency):"—"}</b></div>
        <div><span>Prev close</span><b>{quote.previousClose?money(quote.previousClose,currency):"—"}</b></div>
        <div><span>Volume</span><b>{quote.volume?compact(quote.volume):"—"}</b></div>
        <div><span>Exchange</span><b>{exchange}</b></div>
      </section>}
    </div>
  </AppShell>;
}
