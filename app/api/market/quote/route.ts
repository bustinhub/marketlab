import { NextRequest, NextResponse } from "next/server";
import { getQuote } from "@/lib/market-data";

export const dynamic="force-dynamic";

export async function GET(request:NextRequest){
  const symbol=(request.nextUrl.searchParams.get("symbol")||"").trim().toUpperCase();
  if(!symbol)return NextResponse.json({error:"Symbol required."},{status:400});
  try{
    const quote=await getQuote(symbol);\n    return NextResponse.json({quote,source:quote.source||"Market feed"});
  }catch(error:any){
    const configured=error?.message!=="MARKET_DATA_NOT_CONFIGURED";
    return NextResponse.json({error:configured?(error?.message||"Quote unavailable."):"Market data is not configured."},{status:configured?502:503});
  }
}
