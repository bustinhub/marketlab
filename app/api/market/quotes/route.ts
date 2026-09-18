import { NextRequest, NextResponse } from "next/server";
import { getQuotes } from "@/lib/market-data";

export const dynamic="force-dynamic";

export async function GET(request:NextRequest){
  const symbols=(request.nextUrl.searchParams.get("symbols")||"").split(",").map(s=>s.trim().toUpperCase()).filter(Boolean).slice(0,12);
  if(!symbols.length)return NextResponse.json({quotes:[]});
  try{
    const quotes=await getQuotes(symbols);
    return NextResponse.json({quotes,source:quotes[0]?.source||"Market feed"});
  }catch(error:any){
    return NextResponse.json({error:error?.message||"Quotes unavailable.",quotes:[]},{status:502});
  }
}
