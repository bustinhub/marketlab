"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { MARKET_SYMBOLS, type MarketSymbol } from "@/lib/market";

export type Holding = { symbol:string; shares:number; avgCost:number };
export type Trade = { id:string; symbol:string; side:"BUY"|"SELL"; shares:number; price:number; total:number; createdAt:string };
type FeedMode = "demo" | "live";

type TradingContextValue = {
  stocks:MarketSymbol[];
  selected:string;
  setSelected:(s:string)=>void;
  cash:number;
  holdings:Holding[];
  trades:Trade[];
  watchlist:string[];
  feedMode:FeedMode;
  equity:number;
  invested:number;
  totalReturn:number;
  execute:(input:{symbol:string;side:"BUY"|"SELL";shares:number})=>{ok:boolean;message:string};
  toggleWatchlist:(symbol:string)=>void;
  resetPortfolio:()=>void;
};

const TradingContext = createContext<TradingContextValue | null>(null);
const STORAGE_KEY = "marketlab-v2-state";

export function TradingProvider({ children }:{children:React.ReactNode}) {
  const [stocks,setStocks] = useState<MarketSymbol[]>(MARKET_SYMBOLS);
  const [selected,setSelected] = useState("AAPL");
  const [cash,setCash] = useState(100000);
  const [holdings,setHoldings] = useState<Holding[]>([]);
  const [trades,setTrades] = useState<Trade[]>([]);
  const [watchlist,setWatchlist] = useState(["AAPL","NVDA","TSLA","AMZN","MSFT","GOOGL"]);
  const [feedMode,setFeedMode] = useState<FeedMode>("demo");
  const [hydrated,setHydrated] = useState(false);

  useEffect(()=>{
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw){
        const saved=JSON.parse(raw);
        if(typeof saved.cash==="number") setCash(saved.cash);
        if(Array.isArray(saved.holdings)) setHoldings(saved.holdings);
        if(Array.isArray(saved.trades)) setTrades(saved.trades);
        if(Array.isArray(saved.watchlist)) setWatchlist(saved.watchlist);
      }
    }catch{}
    setHydrated(true);
  },[]);

  useEffect(()=>{
    if(!hydrated) return;
    localStorage.setItem(STORAGE_KEY,JSON.stringify({cash,holdings,trades,watchlist}));
  },[cash,holdings,trades,watchlist,hydrated]);

  useEffect(()=>{
    const timer=setInterval(()=>{
      if(feedMode==="live") return;
      setStocks(prev=>prev.map(s=>{
        const drift=(Math.random()-.49)*.00125;
        return {...s,price:Math.max(1,s.price*(1+drift)),changePercent:s.changePercent+drift*100};
      }));
    },1200);
    return ()=>clearInterval(timer);
  },[feedMode]);

  useEffect(()=>{
    let cancelled=false;
    async function sync(){
      try{
        const symbols=MARKET_SYMBOLS.map(s=>s.symbol).join(",");
        const res=await fetch(`/api/quotes?symbols=${symbols}`,{cache:"no-store"});
        if(!res.ok) return;
        const data=await res.json();
        if(cancelled || data.source!=="live" || !Array.isArray(data.quotes)) return;
        setFeedMode("live");
        setStocks(prev=>prev.map(s=>{
          const q=data.quotes.find((x:{symbol:string})=>x.symbol===s.symbol);
          return q ? {...s,price:q.price,changePercent:q.changePercent} : s;
        }));
      }catch{}
    }
    sync();
    const id=setInterval(sync,15000);
    return ()=>{cancelled=true;clearInterval(id)};
  },[]);

  const invested=useMemo(()=>holdings.reduce((sum,h)=>{
    const p=stocks.find(s=>s.symbol===h.symbol)?.price ?? h.avgCost;
    return sum+p*h.shares;
  },0),[holdings,stocks]);
  const equity=cash+invested;
  const totalReturn=((equity-100000)/100000)*100;

  function execute({symbol,side,shares}:{symbol:string;side:"BUY"|"SELL";shares:number}){
    const stock=stocks.find(s=>s.symbol===symbol);
    if(!stock || !Number.isFinite(shares) || shares<=0) return {ok:false,message:"Enter a valid share amount."};
    const total=stock.price*shares;
    const current=holdings.find(h=>h.symbol===symbol);

    if(side==="BUY"){
      if(total>cash) return {ok:false,message:"Not enough buying power for this order."};
      setCash(v=>v-total);
      setHoldings(prev=>{
        if(!current) return [...prev,{symbol,shares,avgCost:stock.price}];
        const nextShares=current.shares+shares;
        const avgCost=(current.avgCost*current.shares+stock.price*shares)/nextShares;
        return prev.map(h=>h.symbol===symbol?{...h,shares:nextShares,avgCost}:h);
      });
    }else{
      if(!current || shares>current.shares) return {ok:false,message:"You do not own enough shares to sell."};
      setCash(v=>v+total);
      setHoldings(prev=>prev.map(h=>h.symbol===symbol?{...h,shares:h.shares-shares}:h).filter(h=>h.shares>.000001));
    }

    setTrades(prev=>[{
      id:crypto.randomUUID(),symbol,side,shares,price:stock.price,total,createdAt:new Date().toISOString()
    },...prev].slice(0,100));
    return {ok:true,message:`${side==="BUY"?"Bought":"Sold"} ${shares.toFixed(4)} ${symbol} @ $${stock.price.toFixed(2)}`};
  }

  function toggleWatchlist(symbol:string){
    setWatchlist(prev=>prev.includes(symbol)?prev.filter(x=>x!==symbol):[...prev,symbol]);
  }

  function resetPortfolio(){
    setCash(100000);setHoldings([]);setTrades([]);
  }

  return <TradingContext.Provider value={{
    stocks,selected,setSelected,cash,holdings,trades,watchlist,feedMode,equity,invested,totalReturn,execute,toggleWatchlist,resetPortfolio
  }}>{children}</TradingContext.Provider>;
}

export function useTrading(){
  const value=useContext(TradingContext);
  if(!value) throw new Error("useTrading must be used inside TradingProvider");
  return value;
}
