"use client";

import { useEffect, useRef, useState } from "react";
import { AreaSeries, CandlestickSeries, ColorType, CrosshairMode, createChart, HistogramSeries, type UTCTimestamp } from "lightweight-charts";
import { CandlestickChart, Expand, LineChart, RotateCcw } from "lucide-react";

const ranges:Record<string,{interval:string;outputsize:number}>={
  "1D":{interval:"5min",outputsize:90},
  "5D":{interval:"30min",outputsize:100},
  "1M":{interval:"1h",outputsize:180},
  "3M":{interval:"1day",outputsize:95},
  "6M":{interval:"1day",outputsize:190},
  "YTD":{interval:"1day",outputsize:280},
  "1Y":{interval:"1day",outputsize:365},
  "5Y":{interval:"1week",outputsize:270},
};

function unix(datetime:string):UTCTimestamp{
  const normalized=datetime.includes("T")?datetime:datetime.replace(" ","T");
  return Math.floor(new Date(normalized+"Z").getTime()/1000) as UTCTimestamp;
}

export function MarketChart({symbol,price}:{symbol:string;price:number}){
  const host=useRef<HTMLDivElement|null>(null);
  const chartRef=useRef<any>(null);
  const seriesRef=useRef<any>(null);
  const lastRef=useRef<any>(null);
  const [style,setStyle]=useState<"candles"|"area">("candles");
  const [range,setRange]=useState("1D");
  const [expanded,setExpanded]=useState(false);
  const [rows,setRows]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  useEffect(()=>{
    let cancelled=false;
    async function load(){
      setLoading(true);setError("");
      const cfg=ranges[range];
      try{
        const res=await fetch("/api/market/candles?symbol="+encodeURIComponent(symbol)+"&interval="+cfg.interval+"&outputsize="+cfg.outputsize,{cache:"no-store"});
        const data=await res.json();
        if(cancelled)return;
        if(!res.ok||!Array.isArray(data.values)||!data.values.length)throw new Error(data.error||"Chart data unavailable.");
        setRows(data.values);
      }catch(e:any){
        if(!cancelled){setRows([]);setError(e?.message||"Chart data unavailable.");}
      }finally{if(!cancelled)setLoading(false)}
    }
    void load();
    return()=>{cancelled=true};
  },[symbol,range]);

  useEffect(()=>{
    if(!host.current||!rows.length)return;
    host.current.innerHTML="";
    const chart=createChart(host.current,{
      autoSize:true,
      height:expanded?700:510,
      layout:{background:{type:ColorType.Solid,color:"#080b0f"},textColor:"#787f89",fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif'},
      grid:{vertLines:{color:"#15191f"},horzLines:{color:"#15191f"}},
      rightPriceScale:{borderColor:"#242930",scaleMargins:{top:.08,bottom:.2}},
      timeScale:{borderColor:"#242930",timeVisible:true,secondsVisible:false,rightOffset:3,barSpacing:7},
      crosshair:{mode:CrosshairMode.Normal,vertLine:{color:"#565e68",width:1,labelBackgroundColor:"#363d46"},horzLine:{color:"#565e68",width:1,labelBackgroundColor:"#363d46"}},
      handleScale:true,handleScroll:true,
    });
    chartRef.current=chart;

    const mapped=rows.map(r=>({time:unix(r.datetime),open:Number(r.open),high:Number(r.high),low:Number(r.low),close:Number(r.close),volume:Number(r.volume||0)}));
    const last=mapped[mapped.length-1];
    lastRef.current=last;

    if(style==="candles"){
      const series=chart.addSeries(CandlestickSeries,{
        upColor:"#26a69a",downColor:"#ef5350",borderVisible:false,wickUpColor:"#26a69a",wickDownColor:"#ef5350"
      });
      series.setData(mapped.map(({time,open,high,low,close})=>({time,open,high,low,close})));
      seriesRef.current=series;
    }else{
      const series=chart.addSeries(AreaSeries,{
        lineColor:"#4f9b8f",topColor:"rgba(79,155,143,.22)",bottomColor:"rgba(79,155,143,0)",lineWidth:2
      });
      series.setData(mapped.map(r=>({time:r.time,value:r.close})));
      seriesRef.current=series;
    }

    const volume=chart.addSeries(HistogramSeries,{priceScaleId:"volume",priceFormat:{type:"volume"}});
    volume.priceScale().applyOptions({scaleMargins:{top:.82,bottom:0}});
    volume.setData(mapped.map(r=>({time:r.time,value:r.volume,color:r.close>=r.open?"rgba(38,166,154,.26)":"rgba(239,83,80,.24)"})));
    chart.timeScale().fitContent();

    return()=>{seriesRef.current=null;lastRef.current=null;chartRef.current=null;chart.remove()};
  },[rows,style,expanded]);

  useEffect(()=>{
    const series=seriesRef.current,last=lastRef.current;
    if(!series||!last||!price)return;
    if(style==="candles"){
      const next={time:last.time,open:last.open,high:Math.max(last.high,price),low:Math.min(last.low,price),close:price};
      lastRef.current=next;series.update(next);
    }else{
      series.update({time:last.time,value:price});
      lastRef.current={...last,close:price,high:Math.max(last.high,price),low:Math.min(last.low,price)};
    }
  },[price,style]);

  return <div className={expanded?"marketChartWrap expanded":"marketChartWrap"}>
    <div className="chartControlBar">
      <div className="rangeTabs">{Object.keys(ranges).map(x=><button key={x} className={range===x?"active":""} onClick={()=>setRange(x)}>{x}</button>)}</div>
      <div className="chartTools">
        <button className={style==="candles"?"active":""} onClick={()=>setStyle("candles")} title="Candles"><CandlestickChart size={16}/></button>
        <button className={style==="area"?"active":""} onClick={()=>setStyle("area")} title="Line"><LineChart size={16}/></button>
        <button onClick={()=>chartRef.current?.timeScale().fitContent()} title="Reset view"><RotateCcw size={15}/></button>
        <button onClick={()=>setExpanded(v=>!v)} title="Expand chart"><Expand size={15}/></button>
      </div>
    </div>
    <div className="chartStage">
      <div ref={host} className="marketChart"/>
      {loading&&<div className="chartOverlay">Loading {symbol}…</div>}
      {!loading&&error&&<div className="chartOverlay error">{error}</div>}
    </div>
  </div>;
}
