"use client";

import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export type Profile={
  id:string;
  username:string;
  display_name:string;
  role:"student"|"teacher"|"owner";
};

type AuthContextValue={
  configured:boolean;
  loading:boolean;
  user:User|null;
  session:Session|null;
  profile:Profile|null;
  signIn:(email:string,password:string)=>Promise<{error?:string}>;
  signUp:(email:string,password:string,username:string,displayName:string)=>Promise<{error?:string}>;
  signOut:()=>Promise<void>;
  refreshProfile:()=>Promise<void>;
  token:()=>string|null;
};

const AuthContext=createContext<AuthContextValue|null>(null);

export function AuthProvider({children}:{children:React.ReactNode}){
  const supabase=useMemo(()=>getSupabaseBrowser(),[]);
  const [loading,setLoading]=useState(true);
  const [session,setSession]=useState<Session|null>(null);
  const [profile,setProfile]=useState<Profile|null>(null);

  async function loadProfile(userId?:string){
    if(!supabase||!userId){setProfile(null);return}
    const {data}=await supabase.from("profiles").select("id,username,display_name,role").eq("id",userId).maybeSingle();
    setProfile((data as Profile|null)??null);
  }

  useEffect(()=>{
    if(!supabase){setLoading(false);return}
    supabase.auth.getSession().then(async({data})=>{
      setSession(data.session);
      await loadProfile(data.session?.user.id);
      setLoading(false);
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{
      setSession(next);
      void loadProfile(next?.user.id);
    });
    return()=>subscription.unsubscribe();
  },[supabase]);

  async function signIn(email:string,password:string){
    if(!supabase)return {error:"Authentication is not configured."};
    const {error}=await supabase.auth.signInWithPassword({email,password});
    return error?{error:error.message}:{};
  }

  async function signUp(email:string,password:string,username:string,displayName:string){
    if(!supabase)return {error:"Authentication is not configured."};

    const cleanUsername=username.trim().toLowerCase();
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if(!url||!key)return {error:"Authentication is not configured."};

    try{
      const response=await fetch(url+"/functions/v1/classroom-signup",{
        method:"POST",
        headers:{"content-type":"application/json",apikey:key},
        body:JSON.stringify({email,password,username:cleanUsername,displayName:displayName.trim()})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok)return {error:data.error||"Could not create account."};

      const {error}=await supabase.auth.signInWithPassword({email,password});
      if(error)return {error:error.message};
      return {};
    }catch{
      return {error:"Could not create account."};
    }
  }

  async function signOut(){
    if(supabase)await supabase.auth.signOut();
  }

  return <AuthContext.Provider value={{
    configured:Boolean(supabase),loading,user:session?.user??null,session,profile,signIn,signUp,signOut,
    refreshProfile:()=>loadProfile(session?.user.id),token:()=>session?.access_token??null
  }}>{children}</AuthContext.Provider>;
}

export function useAuth(){
  const value=useContext(AuthContext);
  if(!value)throw new Error("useAuth must be inside AuthProvider");
  return value;
}
