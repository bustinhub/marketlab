"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { useTrading } from "./TradingProvider";
import { useAuth } from "./AuthProvider";
import { useClassroom } from "./ClassroomProvider";

function money(n:number){return n.toLocaleString("en-US",{style:"currency",currency:"USD"})}

export function TradeTicket({symbol}:{symbol:string}){
  const {user}=useAuth();
  const {activeClass}=useClassroom();
  const {quotes,cash,holdings,execute}=useTrading();
  const stock=quotes[symbol];
  const holding=holdings.find(h=>h.symbol===symbol);
  const [side,setSide]=useState<"BUY"|"SELL">("BUY");
  const [mode,setMode]=useState<"shares"|"dollars">("shares");
  const [amount,setAmount]=useState("1");
  const [review,setReview]=useState(false);
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState<{ok:boolean;text:string}|null>(null);

  const shares=useMemo(()=>{
    const value=Number(amount)||0;
    return mode==="shares"?value:(stock?.price?value/stock.price:0);
  },[amount,mode,stock?.price]);
  const total=shares*(stock?.price||0);
  const valid=Boolean(stock)&&shares>0&&(side==="BUY"?total<=cash:shares<=(holding?.shares??0));

  async function submit(){
    if(!user||!activeClass||activeClass.member_role!=="student")return;
    if(!review){setNotice(null);setReview(true);return}
    setBusy(true);
    const result=await execute({symbol,side,shares});
    setNotice({ok:result.ok,text:result.message});
    if(result.ok){setReview(false);setAmount(mode==="shares"?"1":"100")}
    setBusy(false);
  }

  if(!user)return <div className="tradeTicket ticketGate"><b>Paper trading</b><span>Sign in to place classroom trades.</span><Link href="/login">Sign in</Link></div>;
  if(!activeClass)return <div className="tradeTicket ticketGate"><b>No class selected</b><span>Join or select a class first.</span><Link href="/classes">Classes</Link></div>;
  if(activeClass.member_role!=="student")return <div className="tradeTicket ticketGate"><b>Teacher account</b><span>Teacher accounts manage classes and student portfolios.</span></div>;

  return <div className="tradeTicket">
    <div className="ticketHeader"><strong>Order</strong><span>{activeClass.name}</span></div>

    <div className="sideTabs">
      <button className={side==="BUY"?"buy active":""} onClick={()=>{setSide("BUY");setReview(false)}}>Buy</button>
      <button className={side==="SELL"?"sell active":""} onClick={()=>{setSide("SELL");setReview(false)}}>Sell</button>
    </div>

    <div className="ticketSymbol"><span>{symbol}</span><b>{stock?money(stock.price):"—"}</b></div>

    <div className="orderField">
      <label>Amount</label>
      <div className="segmented">
        <button className={mode==="shares"?"active":""} onClick={()=>{setMode("shares");setAmount("1");setReview(false)}}>Shares</button>
        <button className={mode==="dollars"?"active":""} onClick={()=>{setMode("dollars");setAmount("100");setReview(false)}}>Dollars</button>
      </div>
    </div>

    <div className="amountField"><div><span>{mode==="dollars"?"$":""}</span><input aria-label={mode==="shares"?"Shares":"Dollars"} inputMode="decimal" value={amount} onChange={e=>{setAmount(e.target.value);setReview(false)}}/></div></div>

    <div className="ticketRows">
      <div><span>Shares</span><b>{shares.toFixed(4)}</b></div>
      <div><span>Estimated total</span><b>{stock?money(total):"—"}</b></div>
      <div><span>{side==="BUY"?"Buying power":"Shares owned"}</span><b>{side==="BUY"?money(cash):(holding?.shares??0).toFixed(4)}</b></div>
    </div>

    {review&&<div className="reviewBox"><div><b>Review order</b><span>{side} {shares.toFixed(4)} {symbol} at the latest quote.</span></div></div>}
    {notice&&<div className={notice.ok?"ticketNotice ok":"ticketNotice"}>{notice.ok?<Check size={15}/>:<AlertCircle size={15}/>}<span>{notice.text}</span></div>}

    <button disabled={!valid||busy} className={side==="BUY"?"primaryOrder buy":"primaryOrder sell"} onClick={()=>void submit()}>
      {busy?"Submitting…":review?("Confirm "+side.toLowerCase()):("Review "+side.toLowerCase())}
    </button>
  </div>;
}
