import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const FALLBACK_URL="https://wszsxzvnckqmnttfifpn.supabase.co";
const FALLBACK_KEY="sb_publishable_CdFaLfYLEZ1SslQGHY2lIQ_xNUHx8Kf";

export async function requireUser(request:NextRequest){
  const header=request.headers.get("authorization")||"";
  const token=header.startsWith("Bearer ")?header.slice(7):"";
  if(!token)return {error:"Sign in required.",status:401 as const,user:null,admin:null};

  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||FALLBACK_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||FALLBACK_KEY;
  const client=createClient(url,key,{
    global:{headers:{Authorization:"Bearer "+token}},
    auth:{persistSession:false,autoRefreshToken:false}
  });

  const {data,error}=await client.auth.getUser(token);
  if(error||!data.user)return {error:"Session expired.",status:401 as const,user:null,admin:client};
  return {error:null,status:200 as const,user:data.user,admin:client};
}
