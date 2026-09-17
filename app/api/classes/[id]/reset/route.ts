import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";

export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const {data:classroom}=await auth.admin!.from("classes").select("teacher_id,starting_cash").eq("id",id).maybeSingle();
  if(!classroom)return NextResponse.json({error:"Class not found."},{status:404});
  if(classroom.teacher_id!==auth.user!.id)return NextResponse.json({error:"Teacher access required."},{status:403});

  const {data:portfolios,error}=await auth.admin!.from("portfolios").select("id").eq("class_id",id);
  if(error)return NextResponse.json({error:error.message},{status:500});
  const ids=(portfolios||[]).map((p:any)=>p.id);
  if(ids.length){
    await auth.admin!.from("trades").delete().in("portfolio_id",ids);
    await auth.admin!.from("holdings").delete().in("portfolio_id",ids);
    await auth.admin!.from("portfolios").update({cash_balance:classroom.starting_cash,starting_balance:classroom.starting_cash,updated_at:new Date().toISOString()}).eq("class_id",id);
  }
  return NextResponse.json({ok:true});
}
