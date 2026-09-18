"use client";

import { useEffect, useState } from "react";

const stockMeta:Record<string,{name:string;domain:string;exchange:string}>={
  AAPL:{name:"Apple Inc",domain:"apple.com",exchange:"NASDAQ"},
  NVDA:{name:"NVIDIA Corp.",domain:"nvidia.com",exchange:"NASDAQ"},
  MSFT:{name:"Microsoft Corp.",domain:"microsoft.com",exchange:"NASDAQ"},
  AMZN:{name:"Amazon.com Inc.",domain:"amazon.com",exchange:"NASDAQ"},
  TSLA:{name:"Tesla Inc.",domain:"tesla.com",exchange:"NASDAQ"},
  META:{name:"Meta Platforms Inc.",domain:"meta.com",exchange:"NASDAQ"},
  GOOGL:{name:"Alphabet Inc.",domain:"google.com",exchange:"NASDAQ"},
  GOOG:{name:"Alphabet Inc.",domain:"google.com",exchange:"NASDAQ"},
  NFLX:{name:"Netflix Inc.",domain:"netflix.com",exchange:"NASDAQ"},
  AMD:{name:"Advanced Micro Devices Inc.",domain:"amd.com",exchange:"NASDAQ"},
  INTC:{name:"Intel Corp.",domain:"intel.com",exchange:"NASDAQ"},
  JPM:{name:"JPMorgan Chase & Co.",domain:"jpmorganchase.com",exchange:"NYSE"},
  BAC:{name:"Bank of America Corp.",domain:"bankofamerica.com",exchange:"NYSE"},
  WMT:{name:"Walmart Inc.",domain:"walmart.com",exchange:"NYSE"},
  DIS:{name:"Walt Disney Co.",domain:"disney.com",exchange:"NYSE"},
  KO:{name:"Coca-Cola Co.",domain:"coca-colacompany.com",exchange:"NYSE"},
};

export function getStockMeta(symbol:string){
  return stockMeta[symbol.toUpperCase()]||null;
}

export function StockLogo({symbol,size=40}:{symbol:string;size?:number}){
  const clean=symbol.toUpperCase();
  const meta=getStockMeta(clean);
  const primary="https://financialmodelingprep.com/image-stock/"+encodeURIComponent(clean)+".png";
  const secondary=meta?"https://www.google.com/s2/favicons?sz=128&domain_url=https://"+meta.domain:"";
  const [src,setSrc]=useState(primary);
  const [failed,setFailed]=useState(false);

  useEffect(()=>{
    setSrc(primary);
    setFailed(false);
  },[primary]);

  return <span className="stockLogo" style={{width:size,height:size}}>
    {!failed&&<img
      src={src}
      alt=""
      width={Math.max(16,Math.round(size*.68))}
      height={Math.max(16,Math.round(size*.68))}
      onError={()=>{
        if(secondary&&src!==secondary)setSrc(secondary);
        else setFailed(true);
      }}
    />}
    {failed&&<span className="stockLogoLetter">{clean.slice(0,1)}</span>}
  </span>;
}
