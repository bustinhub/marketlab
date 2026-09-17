"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, Lock, RefreshCw, RotateCcw, Trash2, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { useClassroom } from "@/components/ClassroomProvider";

type Member={user_id:string;role:"teacher"|"student";joined_at:string;display_name:string};

export default function TeacherPage(){
  const {user,profile,token}=useAuth();
  const {activeClass,refresh}=useClassroom();
  const [members,setMembers]=useState<Member[]>([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [copied,setCopied]=useState(false);

  async function loadMembers(){
    if(!activeClass||!user)return;
    const access=token();if(!access)return;
    const res=await fetch("/api/classes/"+activeClass.id+"/members",{headers:{Authorization:"Bearer "+access},cache:"no-store"});
    const data=await res.json();
    if(res.ok)setMembers(data.members||[]);else setError(data.error||"Roster unavailable.");
  }

  useEffect(()=>{void loadMembers()},[activeClass?.id,user?.id]);

  async function patch(values:Record<string,unknown>){
    if(!activeClass)return;
    const access=token();if(!access)return;
    setBusy(true);setError("");
    const res=await fetch("/api/classes/"+activeClass.id+"/settings",{method:"PATCH",headers:{"content-type":"application/json",Authorization:"Bearer "+access},body:JSON.stringify(values)});
    const data=await res.json();
    if(!res.ok)setError(data.error||"Could not update class.");
    else await refresh();
    setBusy(false);
  }

  async function resetClass(){
    if(!activeClass||!confirm("Reset every student portfolio in this class? This deletes all trades and holdings."))return;
    const access=token();if(!access)return;
    setBusy(true);
    const res=await fetch("/api/classes/"+activeClass.id+"/reset",{method:"POST",headers:{Authorization:"Bearer "+access}});
    const data=await res.json();
    if(!res.ok)setError(data.error||"Reset failed.");
    setBusy(false);
  }

  async function regenerateCode(){
    if(!activeClass||!confirm("Generate a new class code? The old code will stop working."))return;
    const access=token();if(!access)return;
    setBusy(true);setError("");
    const res=await fetch("/api/classes/"+activeClass.id+"/code",{method:"POST",headers:{Authorization:"Bearer "+access}});
    const data=await res.json();
    if(!res.ok)setError(data.error||"Could not regenerate code.");else await refresh();
    setBusy(false);
  }

  async function deleteClass(){
    if(!activeClass||!confirm("Delete this class and all student portfolios? This cannot be undone."))return;
    const access=token();if(!access)return;
    setBusy(true);setError("");
    const res=await fetch("/api/classes/"+activeClass.id,{method:"DELETE",headers:{Authorization:"Bearer "+access}});
    const data=await res.json();
    if(!res.ok){setError(data.error||"Could not delete class.");setBusy(false);return}
    await refresh();setBusy(false);window.location.href="/classes";
  }

  async function removeStudent(userId:string,name:string){
    if(!activeClass||!confirm("Remove "+name+" from this class?"))return;
    const access=token();if(!access)return;
    const res=await fetch("/api/classes/"+activeClass.id+"/members/"+userId,{method:"DELETE",headers:{Authorization:"Bearer "+access}});
    const data=await res.json();
    if(!res.ok)setError(data.error||"Could not remove student.");else await loadMembers();
  }

  if(!user||profile?.role!=="teacher")return <AppShell><div className="pageContainer"><div className="emptyPanel"><b>Teacher account required.</b><Link href="/login" className="primaryButton">Sign in</Link></div></div></AppShell>;
  if(!activeClass||activeClass.member_role!=="teacher")return <AppShell><div className="pageContainer"><div className="emptyPanel"><b>Select one of your classes.</b><Link href="/classes" className="primaryButton">Classes</Link></div></div></AppShell>;

  const students=members.filter(m=>m.role==="student");

  return <AppShell><div className="pageContainer">
    <div className="pageHero">
      <div><small>TEACHER</small><h1>{activeClass.name}</h1><p>{activeClass.period||"No period"}</p></div>
      <div className="classCodeActions">
        <button className="classCodeLarge" onClick={()=>{navigator.clipboard?.writeText(activeClass.code);setCopied(true);setTimeout(()=>setCopied(false),1200)}}><span>Class code</span><b>{activeClass.code}</b><Copy size={14}/>{copied&&<em>Copied</em>}</button>
        <button className="smallButton" disabled={busy} onClick={()=>void regenerateCode()}><RefreshCw size={13}/> New code</button>
      </div>
    </div>
    {error&&<div className="formError wide">{error}</div>}
    <div className="summaryGrid four">
      <article className="summaryCard"><span><Users size={15}/> Students</span><strong>{students.length}</strong></article>
      <article className="summaryCard"><span>Starting cash</span><strong>{"$"}{Number(activeClass.starting_cash).toLocaleString()}</strong></article>
      <article className="summaryCard"><span><Lock size={15}/> Trading</span><strong>{activeClass.trading_enabled?"Open":"Paused"}</strong></article>
      <article className="summaryCard"><span>Fractional shares</span><strong>{activeClass.allow_fractional?"On":"Off"}</strong></article>
    </div>

    <section className="premiumCard controlPanel teacherSettings">
      <div className="sectionHeading"><div><small>CLASS SETTINGS</small><h2>Trading rules</h2></div></div>
      <div className="settingRow"><div><b>Allow trading</b><span>Students can submit paper orders.</span></div><button disabled={busy} className={activeClass.trading_enabled?"toggle on":"toggle"} onClick={()=>void patch({trading_enabled:!activeClass.trading_enabled})}><i/></button></div>
      <div className="settingRow"><div><b>Fractional shares</b><span>Students can buy less than one share.</span></div><button disabled={busy} className={activeClass.allow_fractional?"toggle on":"toggle"} onClick={()=>void patch({allow_fractional:!activeClass.allow_fractional})}><i/></button></div>
      <div className="settingRow"><div><b>Market hours only</b><span>Block new orders while the U.S. market is closed.</span></div><button disabled={busy} className={activeClass.market_hours_only?"toggle on":"toggle"} onClick={()=>void patch({market_hours_only:!activeClass.market_hours_only})}><i/></button></div>
      <div className="settingRow"><div><b>Public holdings</b><span>Allow classmates to see each other's positions.</span></div><button disabled={busy} className={activeClass.public_holdings?"toggle on":"toggle"} onClick={()=>void patch({public_holdings:!activeClass.public_holdings})}><i/></button></div>
      <div className="teacherAction dangerLine"><div><b>Reset all portfolios</b><span>Deletes class trades and returns every student to the starting balance.</span></div><button disabled={busy} className="dangerButton" onClick={()=>void resetClass()}><RotateCcw size={14}/> Reset</button></div>
      <div className="teacherAction dangerLine"><div><b>Delete class</b><span>Deletes the class, roster, portfolios, holdings, and trade history.</span></div><button disabled={busy} className="dangerButton" onClick={()=>void deleteClass()}><Trash2 size={14}/> Delete</button></div>
    </section>

    <section className="premiumCard dataTableCard">
      <div className="sectionHeading"><div><small>ROSTER</small><h2>{students.length} students</h2></div></div>
      {!students.length?<div className="emptyRow">Share code <b>{activeClass.code}</b> with students.</div>
      :<div className="teacherStudentRows">{students.map(m=><div className="teacherStudent" key={m.user_id}>
        <div className="leaderAvatar">{m.display_name.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}</div>
        <div><b>{m.display_name}</b><small>Joined {new Date(m.joined_at).toLocaleDateString()}</small></div>
        <div><span>Role</span><b>Student</b></div>
        <Link className="smallButton" href={"/teacher/student/"+m.user_id}>View</Link>
        <button className="removeMember" onClick={()=>void removeStudent(m.user_id,m.display_name)} title="Remove student"><Trash2 size={14}/></button>
      </div>)}</div>}
    </section>
  </div></AppShell>;
}
