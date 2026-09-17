import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";

export async function DELETE(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const {data:classroom}=await auth.admin!.from("classes").select("teacher_id").eq("id",id).maybeSingle();
  if(!classroom)return NextResponse.json({error:"Class not found."},{status:404});
  if(classroom.teacher_id!==auth.user!.id)return NextResponse.json({error:"Teacher access required."},{status:403});
  const {error}=await auth.admin!.from("classes").delete().eq("id",id);
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}
