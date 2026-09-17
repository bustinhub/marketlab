import { NextRequest, NextResponse } from "next/server";
import { getQuotes } from "@/lib/market-data";

export const dynamic="force-dynamic";

export async function GET(request:NextRequest){
  const symbols=(request.nextUrl.searchParams.get("symbols")||"").split(",").map(s=>s.trim().toUpperCase()).filter(Boolean).slice(0,12);
  if(!symbols.length)return NextResponse.json({quotes:[]});
  try{
    return NextResponse.json({quotes:await getQuotes(symbols),source:"Twelve Data"});
  }catch(error:any){
    const configured=error?.message!=="MARKET_DATA_NOT_CONFIGURED";
    return NextResponse.json({error:configured?(error?.message||"Quotes unavailable."):"Market data is not configured.",quotes:[]},{status:configured?502:503});
  }
}
