"use client";

import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useTrading } from "./TradingProvider";
import { TradeTicket } from "./TradeTicket";

function price(n?:number){return typeof n==="number"?n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}):"—"}
function percent(n?:number){return typeof n==="number"?(n>=0?"+":"")+n.toFixed(2)+"%":"—"}

export function WatchlistRail({symbol}:{symbol:string}){
  const router=useRouter();
  const {quotes,watchlist,setSelected,toggleWatchlist}=useTrading();

  function open(sym:string){setSelected(sym);router.push("/trade?symbol="+encodeURIComponent(sym))}

  return <div className="railStack">
    <section className="railSection">
      <div className="railTitle"><strong>Watchlist</strong><span>{watchlist.length}</span></div>
      <div className="watchHeader"><span>Symbol</span><span>Last</span><span>Chg%</span></div>
      <div className="watchRows">
        {watchlist.map(sym=>{
          const q=quotes[sym];
          return <button key={sym} className={sym===symbol?"watchRow active":"watchRow"} onClick={()=>open(sym)}>
            <div><span><b>{sym}</b><small>{q?.name||""}</small></span></div>
            <strong>{price(q?.price)}</strong>
            <em className={(q?.changePercent??0)>=0?"up":"down"}>{percent(q?.changePercent)}</em>
          </button>
        })}
      </div>
      <button className="watchAdd" onClick={()=>toggleWatchlist(symbol)}><Star size={13}/>{watchlist.includes(symbol)?"Remove "+symbol:"Add "+symbol}</button>
    </section>
    <TradeTicket symbol={symbol}/>
  </div>;
}
