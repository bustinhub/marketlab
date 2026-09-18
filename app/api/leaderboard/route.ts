import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getQuotes } from "@/lib/market-data";

export const dynamic="force-dynamic";

export async function GET(request:NextRequest){
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const classId=request.nextUrl.searchParams.get("classId")||"";
  if(!classId)return NextResponse.json({error:"Class is required."},{status:400});

  const {data:membership}=await auth.admin!.from("class_members").select("role").eq("class_id",classId).eq("user_id",auth.user!.id).maybeSingle();
  if(!membership)return NextResponse.json({error:"You are not in this class."},{status:403});

  const {data:members,error:memberError}=await auth.admin!.from("class_members")
    .select("user_id,role,profiles(username,display_name)")
    .eq("class_id",classId).eq("role","student");
  if(memberError)return NextResponse.json({error:memberError.message},{status:500});

  const userIds=(members||[]).map((m:any)=>m.user_id);
  if(!userIds.length)return NextResponse.json({rows:[]});

  const {data:portfolios,error:pError}=await auth.admin!.from("portfolios")
    .select("id,user_id,cash_balance,starting_balance")
    .eq("class_id",classId).in("user_id",userIds);
  if(pError)return NextResponse.json({error:pError.message},{status:500});

  const portfolioIds=(portfolios||[]).map((p:any)=>p.id);
  const {data:holdings}=portfolioIds.length
    ? await auth.admin!.from("holdings").select("portfolio_id,symbol,shares,avg_cost").in("portfolio_id",portfolioIds)
    : {data:[] as any[]};

  const symbols=[...new Set((holdings||[]).map((h:any)=>String(h.symbol).toUpperCase()))];
  let quoteMap:Record<string,number>={};
  if(symbols.length){
    try{
      const quotes=await getQuotes(symbols);
      quoteMap=quotes.reduce((acc:any,q:any)=>{acc[q.symbol]=q.price;return acc},{});
    }catch{}
  }

  const profileMap=new Map((members||[]).map((m:any)=>{
    const profile=Array.isArray(m.profiles)?m.profiles[0]:m.profiles;
    return [m.user_id,{display_name:profile?.display_name||"Student",username:profile?.username||""}];
  }));

  const rows=(portfolios||[]).map((p:any)=>{
    const positions=(holdings||[]).filter((h:any)=>h.portfolio_id===p.id);
    const invested=positions.reduce((sum:number,h:any)=>sum+(quoteMap[h.symbol]??Number(h.avg_cost))*Number(h.shares),0);
    const value=Number(p.cash_balance)+invested;
    const starting=Number(p.starting_balance);
    return {
      user_id:p.user_id,
      display_name:(profileMap.get(p.user_id) as any)?.display_name||"Student",
      username:(profileMap.get(p.user_id) as any)?.username||"",
      portfolio_value:value,
      return_percent:starting?((value-starting)/starting)*100:0,
      holdings_count:positions.length,
    };
  }).sort((a:any,b:any)=>b.portfolio_value-a.portfolio_value);

  return NextResponse.json({rows,quotes_live:Object.keys(quoteMap).length>0});
}
