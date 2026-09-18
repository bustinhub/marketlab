type TwelveQuote={
  symbol?:string;name?:string;exchange?:string;currency?:string;datetime?:string;timestamp?:number;
  open?:string;high?:string;low?:string;close?:string;previous_close?:string;change?:string;percent_change?:string;volume?:string;
};

function key(){return process.env.TWELVE_DATA_API_KEY||""}

const quoteCache=new Map<string,{expires:number,data:any}>();
let universeCache:{expires:number,rows:any[]}|null=null;

async function td(path:string,params:Record<string,string|number|undefined>){
  const apiKey=key();
  if(!apiKey)throw new Error("MARKET_DATA_NOT_CONFIGURED");
  const url=new URL("https://api.twelvedata.com"+path);
  for(const [k,v] of Object.entries(params))if(v!==undefined)url.searchParams.set(k,String(v));
  const res=await fetch(url,{headers:{Authorization:"apikey "+apiKey},cache:"no-store"});
  const data=await res.json();
  if(!res.ok||data?.status==="error"||data?.code)throw new Error(data?.message||"Market data request failed.");
  return data;
}

function exchangeLabel(value:string){
  const v=value.toUpperCase();
  if(v.includes("NASDAQ"))return "NASDAQ";
  if(v.includes("NYSE")||v==="N")return "NYSE";
  if(v.includes("AMEX")||v==="A")return "NYSE American";
  if(v==="P")return "NYSE Arca";
  if(v==="Z")return "Cboe";
  if(v==="V")return "IEX";
  return value||"US";
}

function yahooInterval(interval:string){
  return ({
    "1min":"1m","5min":"5m","15min":"15m","30min":"30m","1h":"60m","4h":"60m",
    "1day":"1d","1week":"1wk","1month":"1mo"
  } as Record<string,string>)[interval]||"5m";
}
function yahooRange(interval:string,outputsize:number){
  if(interval==="1min")return outputsize>390?"5d":"1d";
  if(interval==="5min")return outputsize<=160?"1d":outputsize<=500?"5d":"1mo";
  if(interval==="15min"||interval==="30min")return outputsize<=220?"5d":outputsize>500?"3mo":"1mo";
  if(interval==="1h"||interval==="4h")return outputsize>500?"1y":"3mo";
  if(interval==="1day")return outputsize>370?"2y":"1y";
  if(interval==="1week")return outputsize>260?"10y":"5y";
  return "max";
}

async function yahooChart(symbol:string,interval="1m",range="1d"){
  const clean=symbol.toUpperCase();
  const url=new URL("https://query1.finance.yahoo.com/v8/finance/chart/"+encodeURIComponent(clean));
  url.searchParams.set("interval",interval);
  url.searchParams.set("range",range);
  url.searchParams.set("includePrePost","false");
  url.searchParams.set("events","div,splits");
  const res=await fetch(url,{
    headers:{
      "User-Agent":"Mozilla/5.0 MarketLab/1.0",
      "Accept":"application/json,text/plain,*/*"
    },
    cache:"no-store"
  });
  const data=await res.json().catch(()=>null);
  const result=data?.chart?.result?.[0];
  if(!res.ok||!result)throw new Error(data?.chart?.error?.description||"Quote unavailable.");
  return result;
}

async function yahooQuote(symbol:string){
  const clean=symbol.toUpperCase();
  const result=await yahooChart(clean,"1m","1d");
  const meta=result.meta||{};
  const q=result.indicators?.quote?.[0]||{};
  const closes=Array.isArray(q.close)?q.close:[];
  const opens=Array.isArray(q.open)?q.open:[];
  const highs=Array.isArray(q.high)?q.high:[];
  const lows=Array.isArray(q.low)?q.low:[];
  const volumes=Array.isArray(q.volume)?q.volume:[];
  let idx=closes.length-1;
  while(idx>=0&&(closes[idx]===null||closes[idx]===undefined))idx--;
  const price=Number(meta.regularMarketPrice??closes[idx]??0);
  if(!price)throw new Error("Quote unavailable.");
  const previousClose=Number(meta.chartPreviousClose??meta.previousClose??0);
  const change=previousClose?price-previousClose:0;
  const regular=meta.currentTradingPeriod?.regular;
  const now=Math.floor(Date.now()/1000);
  const isMarketOpen=Boolean(regular&&now>=Number(regular.start)&&now<=Number(regular.end));
  const timestamp=Number(meta.regularMarketTime??result.timestamp?.[idx]??0);
  return {
    symbol:String(meta.symbol||clean).toUpperCase(),
    name:String(meta.longName||meta.shortName||clean),
    exchange:exchangeLabel(String(meta.fullExchangeName||meta.exchangeName||meta.exchange||"US")),
    currency:String(meta.currency||"USD"),
    price,
    open:Number(meta.regularMarketOpen??opens[idx]??0),
    high:Number(meta.regularMarketDayHigh??highs[idx]??0),
    low:Number(meta.regularMarketDayLow??lows[idx]??0),
    previousClose,
    change,
    changePercent:previousClose?(change/previousClose)*100:0,
    volume:Number(meta.regularMarketVolume??volumes[idx]??0),
    datetime:timestamp?new Date(timestamp*1000).toISOString():"",
    timestamp,
    isMarketOpen,
    source:"Yahoo Finance"
  };
}

function parsePipe(text:string){
  return text.split(/\r?\n/).filter(Boolean).map(line=>line.split("|"));
}

async function loadUsUniverse(){
  if(universeCache&&universeCache.expires>Date.now())return universeCache.rows;
  const [nasdaqRes,otherRes]=await Promise.all([
    fetch("https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt",{headers:{"User-Agent":"Mozilla/5.0 MarketLab/1.0"},cache:"force-cache"}),
    fetch("https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt",{headers:{"User-Agent":"Mozilla/5.0 MarketLab/1.0"},cache:"force-cache"})
  ]);
  const rows:any[]=[];
  if(nasdaqRes.ok){
    const parsed=parsePipe(await nasdaqRes.text());
    for(let i=1;i<parsed.length;i++){
      const r=parsed[i];
      if(!r[0]||r[0].startsWith("File Creation")||r[3]==="Y")continue;
      rows.push({symbol:r[0],name:r[1]||r[0],exchange:"NASDAQ",type:r[6]==="Y"?"ETF":"Stock",country:"United States",currency:"USD"});
    }
  }
  if(otherRes.ok){
    const parsed=parsePipe(await otherRes.text());
    for(let i=1;i<parsed.length;i++){
      const r=parsed[i];
      if(!r[0]||r[0].startsWith("File Creation")||r[6]==="Y")continue;
      rows.push({symbol:r[0],name:r[1]||r[0],exchange:exchangeLabel(r[2]||""),type:r[4]==="Y"?"ETF":"Stock",country:"United States",currency:"USD"});
    }
  }
  const dedup=[...new Map(rows.map(r=>[r.symbol,r])).values()];
  universeCache={expires:Date.now()+6*60*60*1000,rows:dedup};
  return dedup;
}

export async function searchSymbols(query:string){
  const clean=query.trim();
  if(!clean)return [];
  if(key()){
    try{
      const data=await td("/symbol_search",{symbol:clean,outputsize:40});
      const rows=Array.isArray(data?.data)?data.data:[];
      const normalized=rows
        .filter((r:any)=>String(r.country||"").toLowerCase().includes("united states"))
        .filter((r:any)=>["common stock","etf","depositary receipt","reit","preferred stock"].some(t=>String(r.instrument_type||"").toLowerCase().includes(t)))
        .map((r:any)=>({
          symbol:String(r.symbol||""),
          name:String(r.instrument_name||r.name||r.symbol||""),
          exchange:String(r.exchange||""),
          micCode:String(r.mic_code||""),
          type:String(r.instrument_type||""),
          country:String(r.country||""),
          currency:String(r.currency||"USD"),
        })).filter((r:any)=>r.symbol);
      if(normalized.length)return normalized;
    }catch{}
  }
  const q=clean.toLowerCase();
  const universe=await loadUsUniverse();
  return universe
    .filter(r=>r.symbol.toLowerCase().includes(q)||r.name.toLowerCase().includes(q))
    .sort((a,b)=>{
      const as=a.symbol.toLowerCase()===q?0:a.symbol.toLowerCase().startsWith(q)?1:a.name.toLowerCase().startsWith(q)?2:3;
      const bs=b.symbol.toLowerCase()===q?0:b.symbol.toLowerCase().startsWith(q)?1:b.name.toLowerCase().startsWith(q)?2:3;
      return as-bs||a.symbol.localeCompare(b.symbol);
    })
    .slice(0,40);
}

export async function getQuote(symbol:string){
  const clean=symbol.toUpperCase();
  const cached=quoteCache.get(clean);
  if(cached&&cached.expires>Date.now())return cached.data;
  let result:any=null;
  if(key()){
    try{
      const q:TwelveQuote=await td("/quote",{symbol:clean});
      const close=Number(q.close||0);
      if(close){
        result={
          symbol:String(q.symbol||clean).toUpperCase(),
          name:String(q.name||q.symbol||symbol),
          exchange:String(q.exchange||""),
          currency:String(q.currency||"USD"),
          price:close,
          open:Number(q.open||0),
          high:Number(q.high||0),
          low:Number(q.low||0),
          previousClose:Number(q.previous_close||0),
          change:Number(q.change||0),
          changePercent:Number(q.percent_change||0),
          volume:Number(q.volume||0),
          datetime:String(q.datetime||""),
          timestamp:Number(q.timestamp||0),
          isMarketOpen:Boolean((q as any).is_market_open),
          source:"Twelve Data"
        };
      }
    }catch{}
  }
  if(!result)result=await yahooQuote(clean);
  quoteCache.set(clean,{expires:Date.now()+10000,data:result});
  return result;
}

export async function getQuotes(symbols:string[]){
  const unique=[...new Set(symbols.map(s=>s.toUpperCase()).filter(Boolean))].slice(0,50);
  if(!unique.length)return [];
  const now=Date.now();
  const results:any[]=[];
  const missing:string[]=[];
  for(const symbol of unique){
    const cached=quoteCache.get(symbol);
    if(cached&&cached.expires>now)results.push(cached.data);
    else missing.push(symbol);
  }
  if(!missing.length)return results;

  if(key()){
    try{
      const data=await td("/quote",{symbol:missing.join(",")});
      const normalize=(symbol:string,value:any)=>{
        if(!value||value.status==="error")return null;
        const close=Number(value.close||0); if(!close)return null;
        return {
          symbol:String(value.symbol||symbol).toUpperCase(),name:String(value.name||value.symbol||symbol),
          exchange:String(value.exchange||""),currency:String(value.currency||"USD"),price:close,
          open:Number(value.open||0),high:Number(value.high||0),low:Number(value.low||0),
          previousClose:Number(value.previous_close||0),change:Number(value.change||0),
          changePercent:Number(value.percent_change||0),volume:Number(value.volume||0),
          datetime:String(value.datetime||""),timestamp:Number(value.timestamp||0),
          isMarketOpen:Boolean(value.is_market_open),source:"Twelve Data"
        };
      };
      if(missing.length===1){
        const q=normalize(missing[0],data);if(q)results.push(q);
      }else{
        for(const [symbol,value] of Object.entries(data||{})){const q=normalize(symbol,value);if(q)results.push(q)}
      }
    }catch{}
  }

  const have=new Set(results.map(q=>q.symbol));
  const stillMissing=missing.filter(s=>!have.has(s));
  const settled=await Promise.allSettled(stillMissing.map(s=>yahooQuote(s)));
  for(const item of settled)if(item.status==="fulfilled")results.push(item.value);
  for(const q of results)quoteCache.set(q.symbol,{expires:Date.now()+15000,data:q});
  return results;
}

export async function getCandles(symbol:string,interval:string,outputsize:number){
  if(key()){
    try{
      const data=await td("/time_series",{symbol,interval,outputsize,order:"ASC",timezone:"UTC"});
      const values=Array.isArray(data?.values)?data.values:[];
      if(values.length)return {
        meta:{
          symbol:String(data?.meta?.symbol||symbol),interval:String(data?.meta?.interval||interval),
          currency:String(data?.meta?.currency||"USD"),exchange:String(data?.meta?.exchange||""),
          timezone:String(data?.meta?.exchange_timezone||"America/New_York"),
        },
        values:values.map((r:any)=>({
          datetime:String(r.datetime),open:Number(r.open),high:Number(r.high),low:Number(r.low),close:Number(r.close),volume:Number(r.volume||0),
        })).filter((r:any)=>Number.isFinite(r.close)),
      };
    }catch{}
  }

  const result=await yahooChart(symbol,yahooInterval(interval),yahooRange(interval,outputsize));
  const meta=result.meta||{};
  const quote=result.indicators?.quote?.[0]||{};
  const timestamps=Array.isArray(result.timestamp)?result.timestamp:[];
  const values=timestamps.map((ts:number,i:number)=>({
    datetime:new Date(ts*1000).toISOString().replace("T"," ").slice(0,19),
    open:Number(quote.open?.[i]),high:Number(quote.high?.[i]),low:Number(quote.low?.[i]),
    close:Number(quote.close?.[i]),volume:Number(quote.volume?.[i]||0)
  })).filter((r:any)=>Number.isFinite(r.close)&&r.close>0).slice(-outputsize);

  return {
    meta:{
      symbol:String(meta.symbol||symbol),interval, currency:String(meta.currency||"USD"),
      exchange:exchangeLabel(String(meta.fullExchangeName||meta.exchangeName||meta.exchange||"US")),
      timezone:String(meta.exchangeTimezoneName||"America/New_York")
    },
    values
  };
}
