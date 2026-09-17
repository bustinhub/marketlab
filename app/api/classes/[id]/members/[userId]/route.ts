import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";

export async function DELETE(request:NextRequest,{params}:{params:Promise<{id:string;userId:string}>}){
  const {id,userId}=await params;
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const {data:classroom}=await auth.admin!.from("classes").select("teacher_id").eq("id",id).maybeSingle();
  if(!classroom)return NextResponse.json({error:"Class not found."},{status:404});
  if(classroom.teacher_id!==auth.user!.id)return NextResponse.json({error:"Teacher access required."},{status:403});
  if(userId===auth.user!.id)return NextResponse.json({error:"The class owner cannot be removed."},{status:400});

  await auth.admin!.from("portfolios").delete().eq("class_id",id).eq("user_id",userId);
  const {error}=await auth.admin!.from("class_members").delete().eq("class_id",id).eq("user_id",userId);
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}
