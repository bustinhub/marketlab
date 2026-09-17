"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Check, Copy, Plus, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { useClassroom } from "@/components/ClassroomProvider";

export default function ClassesPage(){
  const {user,profile}=useAuth();
  const {classes,activeClass,setActiveClassId,createClass,joinClass,loading}=useClassroom();
  const [joinCode,setJoinCode]=useState("");
  const [name,setName]=useState("");
  const [period,setPeriod]=useState("");
  const [startingCash,setStartingCash]=useState("100000");
  const [error,setError]=useState("");
  const [copied,setCopied]=useState("");

  async function join(e:FormEvent){
    e.preventDefault();setError("");
    const result=await joinClass(joinCode);
    if(!result.ok)setError(result.error||"Could not join class.");
    else setJoinCode("");
  }

  async function create(e:FormEvent){
    e.preventDefault();setError("");
    const result=await createClass({name,period,startingCash:Number(startingCash)});
    if(!result.ok)setError(result.error||"Could not create class.");
    else{setName("");setPeriod("")}
  }

  function copy(code:string){
    navigator.clipboard?.writeText(code);setCopied(code);setTimeout(()=>setCopied(""),1200);
  }

  return <AppShell>
    <div className="pageContainer classesPage">
      <div className="pageHero"><div><small>CLASSES</small><h1>Classrooms</h1></div></div>
      {!user?<div className="emptyPanel"><Users size={24}/><b>Sign in to use classroom features.</b><Link href="/login" className="primaryButton">Sign in</Link></div>:<>
        <div className="classActionGrid">
          <form className="premiumCard classForm" onSubmit={join}>
            <h2>Join a class</h2>
            <label>Class code<input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={10}/></label>
            <button className="primaryButton">Join class</button>
          </form>
          {profile?.role==="teacher"&&<form className="premiumCard classForm" onSubmit={create}>
            <h2>Create a class</h2>
            <div className="twoFields"><label>Name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Personal Finance"/></label><label>Period<input value={period} onChange={e=>setPeriod(e.target.value)} placeholder="Period 3"/></label></div>
            <label>Starting cash<input type="number" min="1000" max="10000000" value={startingCash} onChange={e=>setStartingCash(e.target.value)}/></label>
            <button className="primaryButton"><Plus size={15}/> Create class</button>
          </form>}
        </div>
        {error&&<div className="formError wide">{error}</div>}
        <section className="premiumCard classList">
          <div className="sectionHeading"><div><small>YOUR CLASSES</small><h2>{loading?"Loading…":classes.length+" total"}</h2></div></div>
          {!loading&&!classes.length&&<div className="emptyRow">No classes yet.</div>}
          {classes.map(c=><button className={activeClass?.id===c.id?"classRow active":"classRow"} key={c.id} onClick={()=>setActiveClassId(c.id)}>
            <div className="classRowIcon"><Users size={17}/></div>
            <div><b>{c.name}</b><span>{c.period||"No period"} · {c.member_count} member{c.member_count===1?"":"s"}</span></div>
            <div className="classCode" onClick={e=>{e.stopPropagation();copy(c.code)}}><span>Code</span><b>{c.code}</b>{copied===c.code?<Check size={13}/>:<Copy size={13}/>}</div>
            <em>{c.member_role==="teacher"?"Teacher":"Student"}</em>
          </button>)}
        </section>
      </>}
    </div>
  </AppShell>;
}
