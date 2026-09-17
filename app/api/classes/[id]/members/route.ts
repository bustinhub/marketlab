import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";

export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const {data:membership}=await auth.admin!.from("class_members").select("role").eq("class_id",id).eq("user_id",auth.user!.id).maybeSingle();
  if(!membership)return NextResponse.json({error:"You are not in this class."},{status:403});

  const {data,error}=await auth.admin!.from("class_members")
    .select("user_id,role,joined_at,profiles(display_name)")
    .eq("class_id",id).order("joined_at",{ascending:true});
  if(error)return NextResponse.json({error:error.message},{status:500});
  const members=(data||[]).map((m:any)=>({
    user_id:m.user_id,role:m.role,joined_at:m.joined_at,
    display_name:(Array.isArray(m.profiles)?m.profiles[0]?.display_name:m.profiles?.display_name)||"Student"
  }));
  return NextResponse.json({members});
}
