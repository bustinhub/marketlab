import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";

export async function GET(request:NextRequest){
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const {data,error}=await auth.admin!.from("watchlists").select("symbol").eq("user_id",auth.user!.id).order("created_at",{ascending:true});
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({symbols:(data||[]).map((r:any)=>r.symbol)});
}

export async function POST(request:NextRequest){
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const body=await request.json().catch(()=>({}));
  const symbol=String(body.symbol||"").trim().toUpperCase();
  if(!symbol)return NextResponse.json({error:"Symbol required."},{status:400});
  const {error}=await auth.admin!.from("watchlists").upsert({user_id:auth.user!.id,symbol},{onConflict:"user_id,symbol"});
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}

export async function DELETE(request:NextRequest){
  const auth=await requireUser(request);
  if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const symbol=String(request.nextUrl.searchParams.get("symbol")||"").trim().toUpperCase();
  if(!symbol)return NextResponse.json({error:"Symbol required."},{status:400});
  const {error}=await auth.admin!.from("watchlists").delete().eq("user_id",auth.user!.id).eq("symbol",symbol);
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}
