"use client";

import { useEffect, useRef, useState } from "react";
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  createChart,
  HistogramSeries,
  type UTCTimestamp,
} from "lightweight-charts";
import { CandlestickChart, LineChart, Maximize2, Minimize2, RotateCcw } from "lucide-react";

const ranges:Record<string,{interval:string;outputsize:number}>={
  "1D":{interval:"5min",outputsize:120},
  "5D":{interval:"15min",outputsize:180},
  "1M":{interval:"1h",outputsize:220},
  "3M":{interval:"1day",outputsize:95},
  "6M":{interval:"1day",outputsize:190},
  "YTD":{interval:"1day",outputsize:280},
  "1Y":{interval:"1day",outputsize:365},
  "5Y":{interval:"1week",outputsize:270},
};

function unix(datetime:string):UTCTimestamp{
  const dateOnly=/^\d{4}-\d{2}-\d{2}$/.test(datetime);
  const normalized=dateOnly?datetime+"T00:00:00Z":datetime.replace(" ","T")+"Z";
  return Math.floor(new Date(normalized).getTime()/1000) as UTCTimestamp;
}

export function MarketChart({symbol,price=0}:{symbol:string;price?:number}){
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
    if(!expanded)return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setExpanded(false)};
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[expanded]);

  useEffect(()=>{
    let cancelled=false;
    async function load(){
      const cfg=ranges[range];
      setLoading(true);
      setError("");
      try{
        const res=await fetch(
          "/api/market/candles?symbol="+encodeURIComponent(symbol)+"&interval="+cfg.interval+"&outputsize="+cfg.outputsize,
          {cache:"no-store"}
        );
        const data=await res.json();
        if(cancelled)return;
        if(!res.ok||!Array.isArray(data.values)||!data.values.length)throw new Error(data.error||"Chart data unavailable.");
        setRows(data.values);
      }catch(e:any){
        if(!cancelled){
          setRows([]);
          setError(e?.message||"Chart data unavailable.");
        }
      }finally{
        if(!cancelled)setLoading(false);
      }
    }
    void load();
    return()=>{cancelled=true};
  },[symbol,range]);

  useEffect(()=>{
    if(!host.current||!rows.length)return;
    host.current.innerHTML="";

    const chart=createChart(host.current,{
      autoSize:true,
      height:expanded?760:560,
      layout:{
        background:{type:ColorType.Solid,color:"#0d0d0e"},
        textColor:"#a0a0a7",
        fontFamily:'"Trebuchet MS","Segoe UI",Arial,sans-serif',
        fontSize:12,
      },
      grid:{
        vertLines:{color:"#19191c"},
        horzLines:{color:"#19191c"},
      },
      rightPriceScale:{
        borderColor:"#29292d",
        scaleMargins:{top:.07,bottom:.2},
      },
      timeScale:{
        borderColor:"#29292d",
        timeVisible:true,
        secondsVisible:false,
        rightOffset:4,
        barSpacing:7.5,
        minBarSpacing:3,
      },
      crosshair:{
        mode:CrosshairMode.Normal,
        vertLine:{color:"#5a5a62",width:1,labelBackgroundColor:"#333338"},
        horzLine:{color:"#5a5a62",width:1,labelBackgroundColor:"#333338"},
      },
      handleScale:true,
      handleScroll:true,
    });

    chartRef.current=chart;

    const mapped=rows.map(r=>({
      time:unix(r.datetime),
      open:Number(r.open),
      high:Number(r.high),
      low:Number(r.low),
      close:Number(r.close),
      volume:Number(r.volume||0),
    })).filter(r=>Number.isFinite(r.close)&&Number.isFinite(r.open));

    const last=mapped[mapped.length-1];
    lastRef.current=last;

    if(style==="candles"){
      const series=chart.addSeries(CandlestickSeries,{
        upColor:"#26a69a",
        downColor:"#ef5350",
        borderVisible:false,
        wickUpColor:"#26a69a",
        wickDownColor:"#ef5350",
        priceLineVisible:true,
        lastValueVisible:true,
      });
      series.setData(mapped.map(({time,open,high,low,close})=>({time,open,high,low,close})));
      seriesRef.current=series;
    }else{
      const series=chart.addSeries(AreaSeries,{
        lineColor:"#7e97ff",
        topColor:"rgba(126,151,255,.20)",
        bottomColor:"rgba(126,151,255,0)",
        lineWidth:2,
        priceLineVisible:true,
        lastValueVisible:true,
      });
      series.setData(mapped.map(r=>({time:r.time,value:r.close})));
      seriesRef.current=series;
    }

    const volume=chart.addSeries(HistogramSeries,{priceScaleId:"volume",priceFormat:{type:"volume"}});
    volume.priceScale().applyOptions({scaleMargins:{top:.82,bottom:0}});
    volume.setData(mapped.map(r=>({
      time:r.time,
      value:r.volume,
      color:r.close>=r.open?"rgba(38,166,154,.34)":"rgba(239,83,80,.30)",
    })));

    chart.timeScale().fitContent();

    return()=>{
      seriesRef.current=null;
      lastRef.current=null;
      chartRef.current=null;
      chart.remove();
    };
  },[rows,style,expanded]);

  useEffect(()=>{
    const series=seriesRef.current;
    const last=lastRef.current;
    if(!series||!last||!price)return;
    if(style==="candles"){
      const next={time:last.time,open:last.open,high:Math.max(last.high,price),low:Math.min(last.low,price),close:price};
      lastRef.current=next;
      series.update(next);
    }else{
      series.update({time:last.time,value:price});
      lastRef.current={...last,close:price,high:Math.max(last.high,price),low:Math.min(last.low,price)};
    }
  },[price,style]);

  return <div className={expanded?"marketChartWrap cleanMarketChart expanded":"marketChartWrap cleanMarketChart"}>
    <div className="chartControlBar">
      <div className="rangeTabs">
        {Object.keys(ranges).map(x=><button key={x} className={range===x?"active":""} onClick={()=>setRange(x)}>{x}</button>)}
      </div>
      <div className="chartTools">
        <button className={style==="candles"?"active":""} onClick={()=>setStyle("candles")} title="Candles"><CandlestickChart size={16}/></button>
        <button className={style==="area"?"active":""} onClick={()=>setStyle("area")} title="Line"><LineChart size={16}/></button>
        <button onClick={()=>chartRef.current?.timeScale().fitContent()} title="Reset view"><RotateCcw size={15}/></button>
        <button className="fullChartButton" onClick={()=>setExpanded(v=>!v)} title={expanded?"Exit full chart":"Full chart"}>
          {expanded?<Minimize2 size={15}/>:<Maximize2 size={15}/>}
          <span>{expanded?"Exit":"Full chart"}</span>
        </button>
      </div>
    </div>
    <div className="chartStage">
      <div ref={host} className="marketChart"/>
      {loading&&<div className="chartOverlay">Loading {symbol}…</div>}
      {!loading&&error&&<div className="chartOverlay chartMuted">{error}</div>}
    </div>
  </div>;
}
