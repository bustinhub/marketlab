import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "./supabase-admin";

export async function requireUser(request:NextRequest){
  const admin=getSupabaseAdmin();
  if(!admin) return {error:"Database is not configured.",status:503 as const,user:null,admin:null};
  const header=request.headers.get("authorization")||"";
  const token=header.startsWith("Bearer ")?header.slice(7):"";
  if(!token) return {error:"Sign in required.",status:401 as const,user:null,admin};
  const {data,error}=await admin.auth.getUser(token);
  if(error||!data.user) return {error:"Session expired.",status:401 as const,user:null,admin};
  return {error:null,status:200 as const,user:data.user,admin};
}
