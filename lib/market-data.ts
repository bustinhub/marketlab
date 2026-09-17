type TwelveQuote={
  symbol?:string;name?:string;exchange?:string;currency?:string;datetime?:string;timestamp?:number;
  open?:string;high?:string;low?:string;close?:string;previous_close?:string;change?:string;percent_change?:string;volume?:string;
};

function key(){return process.env.TWELVE_DATA_API_KEY||""}

const quoteCache=new Map<string,{expires:number,data:any}>();

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

export async function searchSymbols(query:string){
  const data=await td("/symbol_search",{symbol:query,outputsize:40});
  const rows=Array.isArray(data?.data)?data.data:[];
  return rows
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
    }))
    .filter((r:any)=>r.symbol);
}

export async function getQuote(symbol:string){
  const clean=symbol.toUpperCase();
  const cached=quoteCache.get(clean);
  if(cached&&cached.expires>Date.now())return cached.data;
  const q:TwelveQuote=await td("/quote",{symbol:clean});
  const close=Number(q.close||0);
  if(!close)throw new Error("Quote unavailable.");
  const result={
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
  };
  quoteCache.set(clean,{expires:Date.now()+2500,data:result});
  return result;
}

export async function getQuotes(symbols:string[]){
  const unique=[...new Set(symbols.map(s=>s.toUpperCase()).filter(Boolean))].slice(0,100);
  if(!unique.length)return [];
  const data=await td("/quote",{symbol:unique.join(",")});

  if(unique.length===1){
    const q:any=data;
    const close=Number(q.close||0);
    return close?[{
      symbol:String(q.symbol||unique[0]).toUpperCase(),
      name:String(q.name||q.symbol||unique[0]),
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
      isMarketOpen:Boolean(q.is_market_open),
    }]:[];
  }

  return Object.entries(data||{}).flatMap(([symbol,value]:[string,any])=>{
    if(!value||value.status==="error")return [];
    const close=Number(value.close||0);
    if(!close)return [];
    return [{
      symbol:String(value.symbol||symbol).toUpperCase(),
      name:String(value.name||value.symbol||symbol),
      exchange:String(value.exchange||""),
      currency:String(value.currency||"USD"),
      price:close,
      open:Number(value.open||0),
      high:Number(value.high||0),
      low:Number(value.low||0),
      previousClose:Number(value.previous_close||0),
      change:Number(value.change||0),
      changePercent:Number(value.percent_change||0),
      volume:Number(value.volume||0),
      datetime:String(value.datetime||""),
      timestamp:Number(value.timestamp||0),
      isMarketOpen:Boolean(value.is_market_open),
    }];
  });
}

export async function getCandles(symbol:string,interval:string,outputsize:number){
  const data=await td("/time_series",{symbol,interval,outputsize,order:"ASC",timezone:"UTC"});
  const values=Array.isArray(data?.values)?data.values:[];
  return {
    meta:{
      symbol:String(data?.meta?.symbol||symbol),
      interval:String(data?.meta?.interval||interval),
      currency:String(data?.meta?.currency||"USD"),
      exchange:String(data?.meta?.exchange||""),
      timezone:String(data?.meta?.exchange_timezone||"America/New_York"),
    },
    values:values.map((r:any)=>({
      datetime:String(r.datetime),
      open:Number(r.open),
      high:Number(r.high),
      low:Number(r.low),
      close:Number(r.close),
      volume:Number(r.volume||0),
    })).filter((r:any)=>Number.isFinite(r.close)),
  };
}
