import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";

export async function POST(request:NextRequest){
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const body=await request.json().catch(()=>({}));
  const code=String(body.code||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,"");
  if(code.length<4)return NextResponse.json({error:"Enter a valid class code."},{status:400});

  const {data,error}=await auth.admin!.rpc("join_class_by_code",{p_code:code});
  if(error)return NextResponse.json({error:error.message.includes("Class code not found")?"Class code not found.":error.message},{status:error.message.includes("not found")?404:400});
  return NextResponse.json({classroom:data});
}
