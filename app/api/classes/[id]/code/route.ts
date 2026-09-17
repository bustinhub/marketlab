import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";

function makeCode(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out="";
  for(let i=0;i<6;i++)out+=chars[Math.floor(Math.random()*chars.length)];
  return out;
}

export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const {data:classroom}=await auth.admin!.from("classes").select("teacher_id").eq("id",id).maybeSingle();
  if(!classroom)return NextResponse.json({error:"Class not found."},{status:404});
  if(classroom.teacher_id!==auth.user!.id)return NextResponse.json({error:"Teacher access required."},{status:403});

  for(let attempt=0;attempt<5;attempt++){
    const code=makeCode();
    const {data,error}=await auth.admin!.from("classes").update({code,updated_at:new Date().toISOString()}).eq("id",id).select("code").single();
    if(!error)return NextResponse.json({code:data.code});
  }
  return NextResponse.json({error:"Could not generate a new class code."},{status:500});
}
