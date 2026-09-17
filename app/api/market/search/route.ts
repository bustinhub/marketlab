import { NextRequest, NextResponse } from "next/server";
import { searchSymbols } from "@/lib/market-data";

export const dynamic="force-dynamic";

export async function GET(request:NextRequest){
  const q=(request.nextUrl.searchParams.get("q")||"").trim();
  if(q.length<1)return NextResponse.json({results:[]});
  try{
    const results=await searchSymbols(q);
    return NextResponse.json({results});
  }catch(error:any){
    const configured=error?.message!=="MARKET_DATA_NOT_CONFIGURED";
    return NextResponse.json({error:configured?(error?.message||"Market search failed."):"Market data is not configured.",results:[]},{status:configured?502:503});
  }
}
