import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";

export async function POST(request:NextRequest){
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const body=await request.json().catch(()=>({}));
  const code=String(body.code||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,"");
  if(code.length<4)return NextResponse.json({error:"Enter a valid class code."},{status:400});

  const {data:classroom,error}=await auth.admin!.from("classes").select("*").eq("code",code).maybeSingle();
  if(error||!classroom)return NextResponse.json({error:"Class code not found."},{status:404});

  const {data:existing}=await auth.admin!.from("class_members").select("role").eq("class_id",classroom.id).eq("user_id",auth.user!.id).maybeSingle();
  if(!existing){
    const {error:memberError}=await auth.admin!.from("class_members").insert({class_id:classroom.id,user_id:auth.user!.id,role:"student"});
    if(memberError)return NextResponse.json({error:memberError.message},{status:500});
  }

  const {data:portfolio}=await auth.admin!.from("portfolios").select("id").eq("class_id",classroom.id).eq("user_id",auth.user!.id).maybeSingle();
  if(!portfolio){
    const {error:pError}=await auth.admin!.from("portfolios").insert({
      class_id:classroom.id,user_id:auth.user!.id,starting_balance:classroom.starting_cash,cash_balance:classroom.starting_cash
    });
    if(pError)return NextResponse.json({error:pError.message},{status:500});
  }

  const {count}=await auth.admin!.from("class_members").select("*",{count:"exact",head:true}).eq("class_id",classroom.id);
  return NextResponse.json({classroom:{...classroom,member_role:existing?.role||"student",member_count:count||1}});
}
