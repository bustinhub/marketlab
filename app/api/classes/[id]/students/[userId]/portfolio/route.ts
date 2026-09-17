import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getQuotes } from "@/lib/market-data";

export async function GET(request:NextRequest,{params}:{params:Promise<{id:string;userId:string}>}){
  const {id,userId}=await params;
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});

  const {data:classroom}=await auth.admin!.from("classes").select("teacher_id,name,starting_cash").eq("id",id).maybeSingle();
  if(!classroom)return NextResponse.json({error:"Class not found."},{status:404});
  if(classroom.teacher_id!==auth.user!.id)return NextResponse.json({error:"Teacher access required."},{status:403});

  const {data:member}=await auth.admin!.from("class_members")
    .select("user_id,role,profiles(display_name)")
    .eq("class_id",id).eq("user_id",userId).eq("role","student").maybeSingle();
  if(!member)return NextResponse.json({error:"Student not found in this class."},{status:404});

  const {data:portfolio}=await auth.admin!.from("portfolios").select("*").eq("class_id",id).eq("user_id",userId).maybeSingle();
  if(!portfolio)return NextResponse.json({error:"Student portfolio not found."},{status:404});

  const [{data:holdings},{data:trades}]=await Promise.all([
    auth.admin!.from("holdings").select("symbol,shares,avg_cost").eq("portfolio_id",portfolio.id).order("symbol"),
    auth.admin!.from("trades").select("id,symbol,side,shares,price,total,executed_at").eq("portfolio_id",portfolio.id).order("executed_at",{ascending:false}).limit(100)
  ]);

  const symbols=(holdings||[]).map((h:any)=>String(h.symbol));
  let quotes:any[]=[];
  if(symbols.length){try{quotes=await getQuotes(symbols)}catch{}}
  const quoteMap=quotes.reduce((acc:any,q:any)=>{acc[q.symbol]=q;return acc},{});
  const positions=(holdings||[]).map((h:any)=>{
    const shares=Number(h.shares),avgCost=Number(h.avg_cost);
    const last=Number(quoteMap[h.symbol]?.price||avgCost);
    const value=shares*last;
    return {symbol:h.symbol,shares,avg_cost:avgCost,last,value,return_percent:avgCost?((last-avgCost)/avgCost)*100:0};
  });
  const cash=Number(portfolio.cash_balance);
  const starting=Number(portfolio.starting_balance);
  const value=cash+positions.reduce((sum:number,p:any)=>sum+p.value,0);

  return NextResponse.json({
    student:{
      user_id:userId,
      display_name:(Array.isArray(member.profiles)?member.profiles[0]?.display_name:(member as any).profiles?.display_name)||"Student"
    },
    portfolio:{cash_balance:cash,starting_balance:starting,value,return_percent:starting?((value-starting)/starting)*100:0},
    holdings:positions,
    trades:(trades||[]).map((t:any)=>({...t,shares:Number(t.shares),price:Number(t.price),total:Number(t.total)}))
  });
}
