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

  const canTeach=profile?.role==="teacher"||profile?.role==="owner";

  async function join(e:FormEvent){
    e.preventDefault();
    setError("");
    const result=await joinClass(joinCode);
    if(!result.ok)setError(result.error||"Could not join class.");
    else setJoinCode("");
  }

  async function create(e:FormEvent){
    e.preventDefault();
    setError("");
    const result=await createClass({name,period,startingCash:Number(startingCash)});
    if(!result.ok)setError(result.error||"Could not create class.");
    else{setName("");setPeriod("")}
  }

  function copy(code:string){
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(()=>setCopied(""),1200);
  }

  return <AppShell>
    <div className="pageContainer classesPage classesRefresh">
      <div className="pageHero classesHero">
        <div>
          <h1>Classrooms</h1>
          <p>Join your class or create one for your students.</p>
        </div>
      </div>

      {!user?
        <div className="emptyPanel"><Users size={24}/><b>Sign in to use classroom features.</b><Link href="/login" className="primaryButton">Sign in</Link></div>
      :<>
        <div className="classSummaryBar">
          <div><span>Account</span><b>{profile?.role==="owner"?"Owner":profile?.role==="teacher"?"Teacher":"Student"}</b></div>
          <div><span>Classrooms</span><b>{classes.length}</b></div>
          <div><span>Selected</span><b>{activeClass?.name||"None"}</b></div>
        </div>

        <div className={canTeach?"classActionGrid teacherGrid":"classActionGrid studentGrid"}>
          <form className="premiumCard classForm classJoinCard" onSubmit={join}>
            <div className="classFormHead">
              <div className="classFormIcon"><Users size={18}/></div>
              <div><h2>Join a classroom</h2><p>Enter the code your teacher shared.</p></div>
            </div>
            <label>Class code
              <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={10}/>
            </label>
            <button className="primaryButton" disabled={!joinCode.trim()}>Join class</button>
          </form>

          {canTeach&&<form className="premiumCard classForm classCreateCard" onSubmit={create}>
            <div className="classFormHead">
              <div className="classFormIcon"><Plus size={18}/></div>
              <div><h2>Create a classroom</h2><p>Set the starting balance and invite students.</p></div>
            </div>
            <div className="twoFields">
              <label>Name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Personal Finance"/></label>
              <label>Period<input value={period} onChange={e=>setPeriod(e.target.value)} placeholder="Period 3"/></label>
            </div>
            <label>Starting cash<input type="number" min="1000" max="10000000" value={startingCash} onChange={e=>setStartingCash(e.target.value)}/></label>
            <button className="primaryButton"><Plus size={15}/> Create class</button>
          </form>}
        </div>

        {error&&<div className="formError wide">{error}</div>}

        <section className="premiumCard classList refreshedClassList">
          <div className="classListTop">
            <div>
              <h2>Your classrooms</h2>
              <p>{loading?"Loading…":classes.length?"Choose a classroom to make it active.":"Create or join a classroom to get started."}</p>
            </div>
            <span className="classCountPill">{classes.length} {classes.length===1?"class":"classes"}</span>
          </div>

          {!loading&&!classes.length&&<div className="emptyClassState">
            <Users size={22}/>
            <b>No classrooms yet</b>
            <span>{canTeach?"Create one above or join with a class code.":"Join a class with the code from your teacher."}</span>
          </div>}

          {classes.map(c=><button className={activeClass?.id===c.id?"classRow active":"classRow"} key={c.id} onClick={()=>setActiveClassId(c.id)}>
            <div className="classRowIcon"><Users size={17}/></div>
            <div className="classRowMain">
              <b>{c.name}</b>
              <span>{c.period||"No period"} · {c.member_count} member{c.member_count===1?"":"s"}</span>
            </div>
            <div className="classCode" onClick={e=>{e.stopPropagation();copy(c.code)}}>
              <span>Code</span>
              <b>{c.code}</b>
              {copied===c.code?<Check size={13}/>:<Copy size={13}/>}
            </div>
            <em>{c.member_role==="teacher"?"Teacher":"Student"}</em>
          </button>)}
        </section>
      </>}
    </div>
  </AppShell>;
}
