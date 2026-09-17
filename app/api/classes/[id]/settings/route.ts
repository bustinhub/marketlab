import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";

export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const {data:classroom}=await auth.admin!.from("classes").select("*").eq("id",id).maybeSingle();
  if(!classroom)return NextResponse.json({error:"Class not found."},{status:404});
  if(classroom.teacher_id!==auth.user!.id)return NextResponse.json({error:"Teacher access required."},{status:403});

  const body=await request.json().catch(()=>({}));
  const patch:any={updated_at:new Date().toISOString()};
  if(typeof body.trading_enabled==="boolean")patch.trading_enabled=body.trading_enabled;
  if(typeof body.public_holdings==="boolean")patch.public_holdings=body.public_holdings;
  if(typeof body.allow_fractional==="boolean")patch.allow_fractional=body.allow_fractional;
  if(typeof body.name==="string"&&body.name.trim())patch.name=body.name.trim().slice(0,80);
  if(typeof body.period==="string")patch.period=body.period.trim().slice(0,40)||null;

  const {data,error}=await auth.admin!.from("classes").update(patch).eq("id",id).select("*").single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({classroom:data});
}
