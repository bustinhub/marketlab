"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage(){
  const router=useRouter();
  const {configured,user,signIn,signUp}=useAuth();
  const [mode,setMode]=useState<"signin"|"signup">("signin");
  const [role,setRole]=useState<"student"|"teacher">("student");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  useEffect(()=>{if(user)router.replace("/classes")},[user,router]);

  async function submit(e:FormEvent){
    e.preventDefault();setError("");setMessage("");setBusy(true);
    const result=mode==="signin"?await signIn(email,password):await signUp(email,password,name,role);
    if(result.error)setError(result.error);
    else if("needsEmailConfirmation" in result&&result.needsEmailConfirmation)setMessage("Check your email to confirm your account.");
    else router.replace("/classes");
    setBusy(false);
  }

  return <main className="authPage">
    <div className="authTop"><BrandLogo/><Link href="/">Back to MarketLab</Link></div>
    <section className="authCard">
      <h1>{mode==="signin"?"Sign in":"Create account"}</h1>
      {!configured&&<div className="setupNotice">Supabase environment variables are required before accounts can be created.</div>}
      <div className="authTabs"><button className={mode==="signin"?"active":""} onClick={()=>setMode("signin")}>Sign in</button><button className={mode==="signup"?"active":""} onClick={()=>setMode("signup")}>Create account</button></div>
      <form onSubmit={submit}>
        {mode==="signup"&&<>
          <label>Display name<input required value={name} onChange={e=>setName(e.target.value)} autoComplete="name"/></label>
          <label>Account type<select value={role} onChange={e=>setRole(e.target.value as "student"|"teacher")}><option value="student">Student</option><option value="teacher">Teacher</option></select></label>
        </>}
        <label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>
        <label>Password<input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==="signin"?"current-password":"new-password"}/></label>
        {error&&<div className="formError">{error}</div>}
        {message&&<div className="formSuccess">{message}</div>}
        <button className="primaryButton authSubmit" disabled={!configured||busy}>{busy?"Please wait…":mode==="signin"?"Sign in":"Create account"}</button>
      </form>
    </section>
  </main>;
}
