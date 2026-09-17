"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Check, ChevronDown, ShieldCheck } from "lucide-react";
import { money } from "@/lib/market";
import { useTrading } from "./TradingProvider";

export function TradeTicket({symbol}:{symbol:string}){
  const {stocks,cash,holdings,execute}=useTrading();
  const stock=stocks.find(s=>s.symbol===symbol)!;
  const holding=holdings.find(h=>h.symbol===symbol);
  const [side,setSide]=useState<"BUY"|"SELL">("BUY");
  const [mode,setMode]=useState<"shares"|"dollars">("shares");
  const [amount,setAmount]=useState("1");
  const [review,setReview]=useState(false);
  const [notice,setNotice]=useState<{ok:boolean;text:string}|null>(null);

  const shares=useMemo(()=>{
    const value=Number(amount)||0;
    return mode==="shares"?value:value/stock.price;
  },[amount,mode,stock.price]);
  const total=shares*stock.price;
  const valid=shares>0&&(side==="BUY"?total<=cash:shares<=(holding?.shares??0));

  function submit(){
    if(!review){setNotice(null);setReview(true);return}
    const result=execute({symbol,side,shares});
    setNotice({ok:result.ok,text:result.message});
    if(result.ok){setReview(false);setAmount(mode==="shares"?"1":"100");}
  }

  return <div className="tradeTicket premiumCard">
    <div className="ticketHeader">
      <div><small>PAPER ORDER</small><strong>{symbol}</strong></div>
      <span>{stock.exchange}</span>
    </div>
    <div className="sideTabs">
      <button className={side==="BUY"?"buy active":""} onClick={()=>{setSide("BUY");setReview(false)}}>Buy</button>
      <button className={side==="SELL"?"sell active":""} onClick={()=>{setSide("SELL");setReview(false)}}>Sell</button>
    </div>
    <div className="orderField">
      <label>Order type</label>
      <button className="fieldButton">Market <ChevronDown size={14}/></button>
    </div>
    <div className="orderField">
      <label>Invest in</label>
      <div className="segmented"><button className={mode==="shares"?"active":""} onClick={()=>{setMode("shares");setAmount("1")}}>Shares</button><button className={mode==="dollars"?"active":""} onClick={()=>{setMode("dollars");setAmount("100")}}>Dollars</button></div>
    </div>
    <div className="amountField">
      <label>{mode==="shares"?"Shares":"Amount"}</label>
      <div><span>{mode==="dollars"?"$":""}</span><input inputMode="decimal" value={amount} onChange={e=>{setAmount(e.target.value);setReview(false)}}/></div>
    </div>
    <div className="ticketRows">
      <div><span>Market price</span><b>{money(stock.price)}</b></div>
      <div><span>Estimated shares</span><b>{shares.toFixed(4)}</b></div>
      <div><span>Estimated total</span><b>{money(total)}</b></div>
      <div><span>{side==="BUY"?"Buying power":"Shares owned"}</span><b>{side==="BUY"?money(cash):(holding?.shares??0).toFixed(4)}</b></div>
    </div>
    {review&&<div className="reviewBox"><ShieldCheck size={17}/><div><b>Review your order</b><span>{side} {shares.toFixed(4)} shares of {symbol} for about {money(total)}.</span></div></div>}
    {notice&&<div className={notice.ok?"ticketNotice ok":"ticketNotice"}>{notice.ok?<Check size={15}/>:<AlertCircle size={15}/>}<span>{notice.text}</span></div>}
    <button disabled={!valid} className={side==="BUY"?"primaryOrder buy":"primaryOrder sell"} onClick={submit}>{review?("Confirm "+side.toLowerCase()):("Review "+side.toLowerCase()+" order")}</button>
    <p className="simulationNote">Simulation only. No real securities or money are exchanged.</p>
  </div>;
}
