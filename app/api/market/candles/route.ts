import { NextRequest, NextResponse } from "next/server";
import { getCandles } from "@/lib/market-data";

export const dynamic="force-dynamic";

const allowed=new Set(["1min","5min","15min","30min","1h","4h","1day","1week","1month"]);

export async function GET(request:NextRequest){
  const symbol=(request.nextUrl.searchParams.get("symbol")||"").trim().toUpperCase();
  const interval=request.nextUrl.searchParams.get("interval")||"5min";
  const outputsize=Math.min(500,Math.max(20,Number(request.nextUrl.searchParams.get("outputsize")||120)));
  if(!symbol)return NextResponse.json({error:"Symbol required."},{status:400});
  if(!allowed.has(interval))return NextResponse.json({error:"Invalid interval."},{status:400});
  try{
    return NextResponse.json(await getCandles(symbol,interval,outputsize));
  }catch(error:any){
    const configured=error?.message!=="MARKET_DATA_NOT_CONFIGURED";
    return NextResponse.json({error:configured?(error?.message||"Chart data unavailable."):"Market data is not configured.",values:[]},{status:configured?502:503});
  }
}
