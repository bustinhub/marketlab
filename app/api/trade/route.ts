import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getQuote } from "@/lib/market-data";

export async function POST(request:NextRequest){
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const body=await request.json().catch(()=>({}));
  const classId=String(body.classId||"");
  const symbol=String(body.symbol||"").trim().toUpperCase();
  const side=String(body.side||"").toUpperCase();
  const shares=Number(body.shares);
  if(!classId||!symbol||!["BUY","SELL"].includes(side)||!Number.isFinite(shares)||shares<=0)
    return NextResponse.json({error:"Invalid order."},{status:400});

  const {data:classroom}=await auth.admin!.from("classes").select("*").eq("id",classId).maybeSingle();
  if(!classroom)return NextResponse.json({error:"Class not found."},{status:404});
  if(!classroom.trading_enabled)return NextResponse.json({error:"Trading is paused by your teacher."},{status:403});

  const {data:membership}=await auth.admin!.from("class_members").select("role").eq("class_id",classId).eq("user_id",auth.user!.id).maybeSingle();
  if(!membership||membership.role!=="student")return NextResponse.json({error:"Student portfolio required."},{status:403});
  if(!classroom.allow_fractional&&!Number.isInteger(shares))return NextResponse.json({error:"This class only allows whole shares."},{status:400});

  let quote;
  try{quote=await getQuote(symbol)}catch(error:any){
    return NextResponse.json({error:error?.message==="MARKET_DATA_NOT_CONFIGURED"?"Live market data is not configured.":(error?.message||"Could not verify market price.")},{status:503});
  }

  const {data,error}=await auth.admin!.rpc("execute_paper_trade",{
    p_user_id:auth.user!.id,p_class_id:classId,p_symbol:symbol,p_side:side,p_shares:shares,p_price:quote.price
  });
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({ok:true,execution:data,quote});
}
