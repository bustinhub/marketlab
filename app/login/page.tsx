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
  const [username,setUsername]=useState("");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  useEffect(()=>{if(user)router.replace("/classes")},[user,router]);

  async function submit(e:FormEvent){
    e.preventDefault();
    setError("");
    setBusy(true);
    const result=mode==="signin"
      ?await signIn(email,password)
      :await signUp(email,password,username,name);

    if(result.error)setError(result.error);
    else router.replace("/classes");
    setBusy(false);
  }

  return <main className="authPage">
    <div className="authTop"><BrandLogo/><Link href="/">Back to MarketLab</Link></div>
    <section className="authCard">
      <h1>{mode==="signin"?"Sign in":"Create account"}</h1>
      <div className="authTabs">
        <button type="button" className={mode==="signin"?"active":""} onClick={()=>setMode("signin")}>Sign in</button>
        <button type="button" className={mode==="signup"?"active":""} onClick={()=>setMode("signup")}>Create account</button>
      </div>

      <form onSubmit={submit}>
        {mode==="signup"&&<>
          <label>Username
            <input
              required
              minLength={3}
              maxLength={24}
              pattern="[A-Za-z0-9_]+"
              value={username}
              onChange={e=>setUsername(e.target.value.replace(/\s+/g,"").toLowerCase())}
              placeholder="alex123"
              autoComplete="username"
            />
          </label>
          <label>Display name
            <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Alex" autoComplete="name"/>
          </label>
        </>}

        <label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>
        <label>Password<input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==="signin"?"current-password":"new-password"}/></label>
        {error&&<div className="formError">{error}</div>}
        <button className="primaryButton authSubmit" disabled={!configured||busy}>{busy?"Please wait…":mode==="signin"?"Sign in":"Create account"}</button>
      </form>
    </section>
  </main>;
}
