"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AreaSeries, CandlestickSeries, ColorType, CrosshairMode, createChart, HistogramSeries, type UTCTimestamp } from "lightweight-charts";
import { CandlestickChart, Expand, LineChart, RotateCcw } from "lucide-react";

function seeded(symbol:string,index:number){
  let n=0;
  for(const c of symbol)n=(n*31+c.charCodeAt(0))%9973;
  const x=Math.sin((n+index)*12.9898)*43758.5453;
  return x-Math.floor(x);
}

function buildSeries(symbol:string,price:number,count=110){
  const rows:{time:UTCTimestamp;open:number;high:number;low:number;close:number;volume:number}[]=[];
  const now=Math.floor(Date.now()/300000)*300;
  let last=price*.94;
  for(let i=count-1;i>=0;i--){
    const r1=seeded(symbol,i*3+1),r2=seeded(symbol,i*3+2),r3=seeded(symbol,i*3+3);
    const open=last;
    const close=Math.max(1,open*(1+(r1-.47)*.012));
    const high=Math.max(open,close)*(1+r2*.0055);
    const low=Math.min(open,close)*(1-r3*.0055);
    rows.push({time:(now-i*300) as UTCTimestamp,open,high,low,close,volume:Math.round(750000+r2*6500000)});
    last=close;
  }
  const factor=price/rows[rows.length-1].close;
  return rows.map(r=>({...r,open:r.open*factor,high:r.high*factor,low:r.low*factor,close:r.close*factor}));
}

export function MarketChart({symbol,price}:{symbol:string;price:number}){
  const host=useRef<HTMLDivElement|null>(null);
  const [style,setStyle]=useState<"candles"|"area">("candles");
  const [range,setRange]=useState("1D");
  const [expanded,setExpanded]=useState(false);
  const base=useMemo(()=>buildSeries(symbol,price),[symbol]);

  useEffect(()=>{
    if(!host.current)return;
    host.current.innerHTML="";
    const chart=createChart(host.current,{
      autoSize:true,
      height:expanded?690:500,
      layout:{background:{type:ColorType.Solid,color:"#080d13"},textColor:"#7f8b99",fontFamily:"Inter, ui-sans-serif, system-ui"},
      grid:{vertLines:{color:"#111923"},horzLines:{color:"#111923"}},
      rightPriceScale:{borderColor:"#1c2632",scaleMargins:{top:.08,bottom:.22}},
      timeScale:{borderColor:"#1c2632",timeVisible:true,secondsVisible:false,rightOffset:4,barSpacing:8},
      crosshair:{mode:CrosshairMode.Normal,vertLine:{color:"#46566a",width:1,labelBackgroundColor:"#253244"},horzLine:{color:"#46566a",width:1,labelBackgroundColor:"#253244"}},
      handleScale:true,handleScroll:true,
    });
    if(style==="candles"){
      const series=chart.addSeries(CandlestickSeries,{upColor:"#2bd3a3",downColor:"#f25f70",borderVisible:false,wickUpColor:"#2bd3a3",wickDownColor:"#f25f70"});
      series.setData(base.map(({time,open,high,low,close})=>({time,open,high,low,close})));
      const last=base[base.length-1];
      series.update({time:last.time,open:last.open,close:price,high:Math.max(last.high,price),low:Math.min(last.low,price)});
    }else{
      const series=chart.addSeries(AreaSeries,{lineColor:"#72a8ff",topColor:"rgba(114,168,255,.24)",bottomColor:"rgba(114,168,255,0)",lineWidth:2});
      series.setData(base.map(r=>({time:r.time,value:r.close})));
      series.update({time:base[base.length-1].time,value:price});
    }
    const volume=chart.addSeries(HistogramSeries,{priceScaleId:"vol",priceFormat:{type:"volume"}});
    volume.priceScale().applyOptions({scaleMargins:{top:.82,bottom:0}});
    volume.setData(base.map(r=>({time:r.time,value:r.volume,color:r.close>=r.open?"rgba(43,211,163,.22)":"rgba(242,95,112,.22)"})));
    chart.timeScale().fitContent();
    return()=>chart.remove();
  },[symbol,price,style,range,expanded,base]);

  return <div className={expanded?"marketChartWrap expanded":"marketChartWrap"}>
    <div className="chartControlBar">
      <div className="rangeTabs">{["1D","5D","1M","3M","6M","YTD","1Y","5Y"].map(x=><button key={x} className={range===x?"active":""} onClick={()=>setRange(x)}>{x}</button>)}</div>
      <div className="chartTools">
        <button className={style==="candles"?"active":""} onClick={()=>setStyle("candles")} title="Candles"><CandlestickChart size={16}/></button>
        <button className={style==="area"?"active":""} onClick={()=>setStyle("area")} title="Line"><LineChart size={16}/></button>
        <button onClick={()=>setRange("1D")} title="Reset"><RotateCcw size={15}/></button>
        <button onClick={()=>setExpanded(v=>!v)} title="Expand chart"><Expand size={15}/></button>
      </div>
    </div>
    <div ref={host} className="marketChart"/>
    <div className="chartHint">Drag to inspect · scroll to zoom · move across candles for exact OHLC values</div>
  </div>;
}
