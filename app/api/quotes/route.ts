import { NextRequest, NextResponse } from "next/server";
import { MARKET_SYMBOLS } from "@/lib/market";

export const dynamic = "force-dynamic";

export async function GET(request:NextRequest){
  const requested=(request.nextUrl.searchParams.get("symbols")||"AAPL")
    .split(",").map(s=>s.trim().toUpperCase()).filter(Boolean).slice(0,15);
  const key=process.env.FINNHUB_API_KEY;

  if(!key){
    const quotes=requested.map(symbol=>{
      const fallback=MARKET_SYMBOLS.find(s=>s.symbol===symbol);
      return fallback?{symbol,price:fallback.price,changePercent:fallback.changePercent}:null;
    }).filter(Boolean);
    return NextResponse.json({source:"demo",quotes});
  }

  try{
    const quotes=await Promise.all(requested.map(async symbol=>{
      const response=await fetch("https://finnhub.io/api/v1/quote?symbol="+encodeURIComponent(symbol)+"&token="+encodeURIComponent(key),{cache:"no-store"});
      if(!response.ok) return null;
      const q=await response.json();
      if(!q?.c) return null;
      return {symbol,price:Number(q.c),changePercent:Number(q.dp||0),high:Number(q.h||0),low:Number(q.l||0),open:Number(q.o||0),previousClose:Number(q.pc||0)};
    }));
    return NextResponse.json({source:"live",quotes:quotes.filter(Boolean)});
  }catch{
    return NextResponse.json({source:"demo",quotes:[]});
  }
}
