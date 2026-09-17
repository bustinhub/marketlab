import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";

export async function GET(request:NextRequest){
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const classId=request.nextUrl.searchParams.get("classId")||"";
  if(!classId)return NextResponse.json({error:"Class is required."},{status:400});

  const {data:membership}=await auth.admin!.from("class_members").select("role").eq("class_id",classId).eq("user_id",auth.user!.id).maybeSingle();
  if(!membership)return NextResponse.json({error:"You are not in this class."},{status:403});

  const {data:portfolio}=await auth.admin!.from("portfolios").select("*").eq("class_id",classId).eq("user_id",auth.user!.id).maybeSingle();
  if(!portfolio)return NextResponse.json({portfolio:null,holdings:[],trades:[]});

  const [{data:holdings},{data:trades}]=await Promise.all([
    auth.admin!.from("holdings").select("symbol,shares,avg_cost").eq("portfolio_id",portfolio.id).order("symbol"),
    auth.admin!.from("trades").select("id,symbol,side,shares,price,total,executed_at").eq("portfolio_id",portfolio.id).order("executed_at",{ascending:false}).limit(100)
  ]);
  return NextResponse.json({portfolio,holdings:holdings||[],trades:trades||[]});
}
