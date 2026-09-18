"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

function tvExchange(exchange:string){
  const value=exchange.toUpperCase();
  if(value.includes("NASDAQ"))return "NASDAQ";
  if(value.includes("NYSE"))return "NYSE";
  if(value.includes("AMEX"))return "AMEX";
  return "";
}

export function MarketChart({symbol,exchange=""}:{symbol:string;exchange?:string}){
  const container=useRef<HTMLDivElement|null>(null);
  const [expanded,setExpanded]=useState(false);
  const tvSymbol=useMemo(()=>{
    const prefix=tvExchange(exchange);
    return prefix?prefix+":"+symbol.toUpperCase():symbol.toUpperCase();
  },[symbol,exchange]);

  useEffect(()=>{
    if(!expanded)return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setExpanded(false)};
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[expanded]);

  useEffect(()=>{
    const host=container.current;
    if(!host)return;
    host.innerHTML="";

    const widget=document.createElement("div");
    widget.className="tradingview-widget-container__widget";
    widget.style.height="100%";
    widget.style.width="100%";

    const script=document.createElement("script");
    script.src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type="text/javascript";
    script.async=true;
    script.innerHTML=JSON.stringify({
      autosize:true,
      symbol:tvSymbol,
      interval:"5",
      timezone:"exchange",
      theme:"dark",
      backgroundColor:"rgba(15, 15, 15, 1)",
      gridColor:"rgba(35, 35, 38, 0.42)",
      style:"1",
      locale:"en",
      withdateranges:true,
      hide_top_toolbar:false,
      hide_side_toolbar:false,
      allow_symbol_change:true,
      save_image:false,
      calendar:false,
      details:false,
      hotlist:false,
      support_host:"https://www.tradingview.com"
    });

    host.appendChild(widget);
    host.appendChild(script);
    return()=>{host.innerHTML=""};
  },[tvSymbol,expanded]);

  return <div className={expanded?"marketChartWrap advancedChart expanded":"marketChartWrap advancedChart"}>
    <div className="advancedChartTop">
      <div>
        <b>{symbol}</b>
        <span>Advanced chart</span>
      </div>
      <button onClick={()=>setExpanded(v=>!v)} title={expanded?"Exit full chart":"Full chart"}>
        {expanded?<Minimize2 size={15}/>:<Maximize2 size={15}/>}
        <span>{expanded?"Exit":"Full chart"}</span>
      </button>
    </div>
    <div ref={container} className="tradingview-widget-container marketAdvancedWidget"/>
  </div>;
}
