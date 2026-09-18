import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";

function makeCode(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out="";
  for(let i=0;i<6;i++)out+=chars[Math.floor(Math.random()*chars.length)];
  return out;
}

export async function GET(request:NextRequest){
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const {data:memberships,error}=await auth.admin!.from("class_members")
    .select("class_id,role,classes(id,name,period,code,starting_cash,trading_enabled,public_holdings,allow_fractional,market_hours_only,teacher_id,created_at)")
    .eq("user_id",auth.user!.id)
    .order("joined_at",{ascending:false});
  if(error)return NextResponse.json({error:error.message},{status:500});

  const ids=(memberships||[]).map((m:any)=>m.class_id);
  let counts:Record<string,number>={};
  if(ids.length){
    const {data:rows}=await auth.admin!.from("class_members").select("class_id").in("class_id",ids);
    counts=(rows||[]).reduce((acc:any,row:any)=>{acc[row.class_id]=(acc[row.class_id]||0)+1;return acc},{});
  }

  const classes=(memberships||[]).map((m:any)=>({
    ...(Array.isArray(m.classes)?m.classes[0]:m.classes),
    member_role:m.role,
    member_count:counts[m.class_id]||0,
  })).filter((c:any)=>c?.id);
  return NextResponse.json({classes});
}

export async function POST(request:NextRequest){
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const body=await request.json().catch(()=>({}));
  const name=String(body.name||"").trim().slice(0,80);
  const period=String(body.period||"").trim().slice(0,40)||null;
  const startingCash=Math.min(10000000,Math.max(1000,Number(body.startingCash||100000)));
  if(name.length<2)return NextResponse.json({error:"Class name is required."},{status:400});

  const {data:profile}=await auth.admin!.from("profiles").select("role").eq("id",auth.user!.id).maybeSingle();
  if(profile?.role!=="teacher"&&profile?.role!=="owner")return NextResponse.json({error:"Teacher account required."},{status:403});

  let classroom:any=null;
  for(let attempt=0;attempt<5&&!classroom;attempt++){
    const code=makeCode();
    const {data,error}=await auth.admin!.from("classes").insert({
      teacher_id:auth.user!.id,name,period,code,starting_cash:startingCash
    }).select("*").single();
    if(!error)classroom=data;
  }
  if(!classroom)return NextResponse.json({error:"Could not create class code. Try again."},{status:500});

  await auth.admin!.from("class_members").insert({class_id:classroom.id,user_id:auth.user!.id,role:"teacher"});
  return NextResponse.json({classroom:{...classroom,member_role:"teacher",member_count:1}},{status:201});
}
