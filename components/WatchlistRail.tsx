"use client";

import { Plus, Star } from "lucide-react";
import { money, pct } from "@/lib/market";
import { useTrading } from "./TradingProvider";
import { TradeTicket } from "./TradeTicket";

export function WatchlistRail({symbol}:{symbol:string}){
  const {stocks,watchlist,setSelected,toggleWatchlist}=useTrading();
  return <div className="railStack">
    <section className="railSection">
      <div className="railTitle"><div><small>WATCHLIST</small><strong>My stocks</strong></div><button><Plus size={17}/></button></div>
      <div className="watchHeader"><span>Symbol</span><span>Last</span><span>Change</span></div>
      {watchlist.map(sym=>{
        const s=stocks.find(x=>x.symbol===sym);
        if(!s)return null;
        return <button key={sym} className={sym===symbol?"watchRow active":"watchRow"} onClick={()=>setSelected(sym)}>
          <div><i style={{background:s.color}}/><span><b>{s.symbol}</b><small>{s.name.split(" ")[0]}</small></span></div>
          <strong>{money(s.price).replace("$","")}</strong>
          <em className={s.changePercent>=0?"up":"down"}>{pct(s.changePercent)}</em>
        </button>
      })}
      <button className="watchAdd" onClick={()=>toggleWatchlist(symbol)}><Star size={14}/>{watchlist.includes(symbol)?"Remove current from watchlist":"Add current to watchlist"}</button>
    </section>
    <TradeTicket symbol={symbol}/>
  </div>;
}
