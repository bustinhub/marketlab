"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import { useClassroom } from "./ClassroomProvider";

export type MarketQuote={
  symbol:string;name:string;exchange:string;currency:string;price:number;
  open:number;high:number;low:number;previousClose:number;change:number;changePercent:number;volume:number;
  datetime:string;timestamp:number;isMarketOpen?:boolean;
};
export type Holding={symbol:string;shares:number;avgCost:number};
export type Trade={id:string;symbol:string;side:"BUY"|"SELL";shares:number;price:number;total:number;createdAt:string};

type TradingContextValue={
  selected:string;
  setSelected:(symbol:string)=>void;
  quote:MarketQuote|null;
  quotes:Record<string,MarketQuote>;
  quoteLoading:boolean;
  marketError:string|null;
  feedMode:"live"|"unavailable";
  cash:number;
  startingBalance:number;
  holdings:Holding[];
  trades:Trade[];
  watchlist:string[];
  equity:number;
  invested:number;
  totalReturn:number;
  portfolioLoading:boolean;
  portfolioReady:boolean;
  loadQuote:(symbol:string)=>Promise<MarketQuote|null>;
  refreshPortfolio:()=>Promise<void>;
  execute:(input:{symbol:string;side:"BUY"|"SELL";shares:number})=>Promise<{ok:boolean;message:string}>;
  toggleWatchlist:(symbol:string)=>void;
};

const TradingContext=createContext<TradingContextValue|null>(null);
const WATCHLIST_KEY="marketlab-watchlist";

export function TradingProvider({children}:{children:React.ReactNode}){
  const {user,token}=useAuth();
  const {activeClass}=useClassroom();
  const [selected,setSelectedState]=useState("AAPL");
  const [quotes,setQuotes]=useState<Record<string,MarketQuote>>({});
  const [quoteLoading,setQuoteLoading]=useState(false);
  const [marketError,setMarketError]=useState<string|null>(null);
  const [cash,setCash]=useState(0);
  const [startingBalance,setStartingBalance]=useState(0);
  const [holdings,setHoldings]=useState<Holding[]>([]);
  const [trades,setTrades]=useState<Trade[]>([]);
  const [portfolioLoading,setPortfolioLoading]=useState(false);
  const [portfolioReady,setPortfolioReady]=useState(false);
  const [watchlist,setWatchlist]=useState<string[]>(["AAPL","NVDA","TSLA","MSFT","AMZN"]);

  useEffect(()=>{
    async function loadWatchlist(){
      if(user){
        const access=token();
        if(access){
          try{
            const res=await fetch("/api/watchlist",{headers:{Authorization:"Bearer "+access},cache:"no-store"});
            const data=await res.json();
            if(res.ok&&Array.isArray(data.symbols)&&data.symbols.length){setWatchlist(data.symbols.slice(0,20));return}
          }catch{}
        }
      }
      try{
        const saved=JSON.parse(localStorage.getItem(WATCHLIST_KEY)||"null");
        if(Array.isArray(saved)&&saved.length)setWatchlist(saved.slice(0,20));
      }catch{}
    }
    void loadWatchlist();
  },[user?.id]);

  function setSelected(symbol:string){
    const next=symbol.trim().toUpperCase();
    if(next)setSelectedState(next);
  }

  async function loadQuote(symbol:string){
    const clean=symbol.trim().toUpperCase();
    if(!clean)return null;
    setQuoteLoading(true);
    try{
      const res=await fetch("/api/market/quote?symbol="+encodeURIComponent(clean),{cache:"no-store"});
      const data=await res.json();
      if(!res.ok||!data.quote)throw new Error(data.error||"Quote unavailable.");
      setQuotes(prev=>({...prev,[clean]:data.quote}));
      setMarketError(null);
      return data.quote as MarketQuote;
    }catch(error:any){
      setMarketError(error?.message||"Live market data unavailable.");
      return null;
    }finally{setQuoteLoading(false)}
  }

  async function refreshQuotes(symbols:string[]){
    const clean=[...new Set(symbols.map(s=>s.toUpperCase()).filter(Boolean))].slice(0,12);
    if(!clean.length)return;
    try{
      const res=await fetch("/api/market/quotes?symbols="+encodeURIComponent(clean.join(",")),{cache:"no-store"});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||"Quotes unavailable.");
      const next:Record<string,MarketQuote>={};
      for(const q of data.quotes||[])next[q.symbol]=q;
      if(Object.keys(next).length)setQuotes(prev=>({...prev,...next}));
      setMarketError(null);
    }catch(error:any){
      setMarketError(error?.message||"Live market data unavailable.");
    }
  }

  async function refreshPortfolio(){
    if(!user||!activeClass||activeClass.member_role!=="student"){
      setCash(0);setStartingBalance(0);setHoldings([]);setTrades([]);setPortfolioReady(false);return;
    }
    const access=token();if(!access)return;
    setPortfolioLoading(true);
    try{
      const res=await fetch("/api/portfolio?classId="+encodeURIComponent(activeClass.id),{headers:{Authorization:"Bearer "+access},cache:"no-store"});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||"Portfolio unavailable.");
      if(!data.portfolio){setPortfolioReady(false);return}
      setCash(Number(data.portfolio.cash_balance));
      setStartingBalance(Number(data.portfolio.starting_balance));
      setHoldings((data.holdings||[]).map((h:any)=>({symbol:h.symbol,shares:Number(h.shares),avgCost:Number(h.avg_cost)})));
      setTrades((data.trades||[]).map((t:any)=>({id:t.id,symbol:t.symbol,side:t.side,shares:Number(t.shares),price:Number(t.price),total:Number(t.total),createdAt:t.executed_at})));
      setPortfolioReady(true);
    }catch{setPortfolioReady(false)}
    finally{setPortfolioLoading(false)}
  }

  useEffect(()=>{void loadQuote(selected);const id=setInterval(()=>void loadQuote(selected),5000);return()=>clearInterval(id)},[selected]);

  useEffect(()=>{
    const symbols=[...watchlist,...holdings.map(h=>h.symbol)];
    void refreshQuotes(symbols);
    const id=setInterval(()=>void refreshQuotes(symbols),60000);
    return()=>clearInterval(id);
  },[watchlist.join(","),holdings.map(h=>h.symbol).join(",")]);

  useEffect(()=>{void refreshPortfolio()},[user?.id,activeClass?.id]);

  const invested=useMemo(()=>holdings.reduce((sum,h)=>{
    const price=quotes[h.symbol]?.price??h.avgCost;
    return sum+price*h.shares;
  },0),[holdings,quotes]);
  const equity=cash+invested;
  const totalReturn=startingBalance?((equity-startingBalance)/startingBalance)*100:0;

  async function execute(input:{symbol:string;side:"BUY"|"SELL";shares:number}){
    if(!user)return {ok:false,message:"Sign in to trade."};
    if(!activeClass)return {ok:false,message:"Join a class first."};
    if(activeClass.member_role!=="student")return {ok:false,message:"Teacher accounts do not have student portfolios."};
    const access=token();if(!access)return {ok:false,message:"Session expired."};
    try{
      const res=await fetch("/api/trade",{method:"POST",headers:{"content-type":"application/json",Authorization:"Bearer "+access},body:JSON.stringify({classId:activeClass.id,...input})});
      const data=await res.json();
      if(!res.ok)return {ok:false,message:data.error||"Order failed."};
      if(data.quote)setQuotes(prev=>({...prev,[data.quote.symbol]:data.quote}));
      await refreshPortfolio();
      return {ok:true,message:(input.side==="BUY"?"Bought ":"Sold ")+input.shares.toFixed(4)+" "+input.symbol+" @ $"+Number(data.quote.price).toFixed(2)};
    }catch{return {ok:false,message:"Order could not be submitted."}}
  }

  function toggleWatchlist(symbol:string){
    const clean=symbol.toUpperCase();
    setWatchlist(prev=>{
      const removing=prev.includes(clean);
      const next=removing?prev.filter(s=>s!==clean):[...prev,clean].slice(0,20);
      localStorage.setItem(WATCHLIST_KEY,JSON.stringify(next));
      const access=token();
      if(user&&access){
        void fetch(removing?("/api/watchlist?symbol="+encodeURIComponent(clean)):"/api/watchlist",{
          method:removing?"DELETE":"POST",
          headers:removing?{Authorization:"Bearer "+access}:{"content-type":"application/json",Authorization:"Bearer "+access},
          body:removing?undefined:JSON.stringify({symbol:clean})
        }).catch(()=>{});
      }
      return next;
    });
  }

  return <TradingContext.Provider value={{
    selected,setSelected,quote:quotes[selected]??null,quotes,quoteLoading,marketError,
    feedMode:marketError?"unavailable":"live",cash,startingBalance,holdings,trades,watchlist,equity,invested,totalReturn,
    portfolioLoading,portfolioReady,loadQuote,refreshPortfolio,execute,toggleWatchlist
  }}>{children}</TradingContext.Provider>;
}

export function useTrading(){
  const value=useContext(TradingContext);
  if(!value)throw new Error("useTrading must be inside TradingProvider");
  return value;
}
