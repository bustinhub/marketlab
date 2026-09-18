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
    <div className="pageContainer classroomsV3">
      <div className="classroomsTitle">
        <div>
          <h1>Classrooms</h1>
          <p>Manage your classes, join with a code, or create a new trading room.</p>
        </div>
        {user&&<div className="classroomsMiniStats">
          <div><span>Role</span><b>{profile?.role==="owner"?"Owner":profile?.role==="teacher"?"Teacher":"Student"}</b></div>
          <div><span>Classes</span><b>{classes.length}</b></div>
          <div><span>Active</span><b>{activeClass?.name||"None"}</b></div>
        </div>}
      </div>

      {!user?
        <div className="emptyPanel classroomSignIn">
          <Users size={24}/>
          <b>Sign in to use classroom features.</b>
          <Link href="/login" className="primaryButton">Sign in</Link>
        </div>
      :<>
        {error&&<div className="formError wide">{error}</div>}

        <div className={canTeach?"classroomsLayout teacher":"classroomsLayout student"}>
          <section className="classroomPrimary">
            <div className="classroomSectionHead">
              <div>
                <h2>Your classrooms</h2>
                <p>{loading?"Loading classrooms…":classes.length?"Select one to make it active.":"No classrooms yet."}</p>
              </div>
              <span className="classCountPill">{classes.length}</span>
            </div>

            <div className="classroomRows">
              {!loading&&!classes.length&&<div className="classroomEmpty">
                <div className="classroomEmptyIcon"><Users size={22}/></div>
                <b>No classrooms yet</b>
                <span>{canTeach?"Create your first class or join one with a code.":"Enter the code from your teacher to join."}</span>
              </div>}

              {classes.map(c=><button
                className={activeClass?.id===c.id?"classroomRow active":"classroomRow"}
                key={c.id}
                onClick={()=>setActiveClassId(c.id)}
              >
                <div className="classroomRowIcon"><Users size={17}/></div>
                <div className="classroomRowMain">
                  <b>{c.name}</b>
                  <span>{c.period||"No period"} · {c.member_count} member{c.member_count===1?"":"s"}</span>
                </div>
                <div className="classroomCode" onClick={e=>{e.stopPropagation();copy(c.code)}}>
                  <span>Code</span>
                  <b>{c.code}</b>
                  {copied===c.code?<Check size={13}/>:<Copy size={13}/>}
                </div>
                <em>{c.member_role==="teacher"?"Teacher":"Student"}</em>
              </button>)}
            </div>
          </section>

          <aside className="classroomActions">
            <form className="classroomActionCard" onSubmit={join}>
              <div className="classroomActionHead">
                <div className="classroomActionIcon"><Users size={17}/></div>
                <div><h2>Join a classroom</h2><p>Use the code your teacher shared.</p></div>
              </div>
              <label>Class code
                <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={10}/>
              </label>
              <button className="primaryButton" disabled={!joinCode.trim()}>Join class</button>
            </form>

            {canTeach&&<form className="classroomActionCard create" onSubmit={create}>
              <div className="classroomActionHead">
                <div className="classroomActionIcon"><Plus size={17}/></div>
                <div><h2>Create a classroom</h2><p>Set the starting balance and invite students.</p></div>
              </div>
              <label>Class name
                <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Personal Finance"/>
              </label>
              <div className="classroomTwoFields">
                <label>Period<input value={period} onChange={e=>setPeriod(e.target.value)} placeholder="Period 3"/></label>
                <label>Starting cash<input type="number" min="1000" max="10000000" value={startingCash} onChange={e=>setStartingCash(e.target.value)}/></label>
              </div>
              <button className="primaryButton"><Plus size={15}/> Create class</button>
            </form>}
          </aside>
        </div>
      </>}
    </div>
  </AppShell>;
}
