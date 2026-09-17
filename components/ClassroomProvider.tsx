"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";

export type Classroom={
  id:string;
  name:string;
  period:string|null;
  code:string;
  starting_cash:number;
  trading_enabled:boolean;
  public_holdings:boolean;
  allow_fractional:boolean;
  market_hours_only:boolean;
  teacher_id:string;
  member_role:"teacher"|"student";
  member_count:number;
  created_at:string;
};

type ClassroomContextValue={
  loading:boolean;
  classes:Classroom[];
  activeClass:Classroom|null;
  setActiveClassId:(id:string)=>void;
  refresh:()=>Promise<void>;
  createClass:(input:{name:string;period?:string;startingCash:number})=>Promise<{ok:boolean;error?:string;classroom?:Classroom}>;
  joinClass:(code:string)=>Promise<{ok:boolean;error?:string;classroom?:Classroom}>;
};

const ClassroomContext=createContext<ClassroomContextValue|null>(null);

export function ClassroomProvider({children}:{children:React.ReactNode}){
  const {user,token}=useAuth();
  const [loading,setLoading]=useState(false);
  const [classes,setClasses]=useState<Classroom[]>([]);
  const [activeClassId,setActiveClassIdState]=useState<string>("");

  async function refresh(){
    if(!user){setClasses([]);setActiveClassIdState("");return}
    const access=token();if(!access)return;
    setLoading(true);
    try{
      const res=await fetch("/api/classes",{headers:{Authorization:"Bearer "+access},cache:"no-store"});
      const data=await res.json();
      if(res.ok&&Array.isArray(data.classes)){
        setClasses(data.classes);
        const saved=localStorage.getItem("marketlab-active-class");
        const next=data.classes.some((c:Classroom)=>c.id===saved)?saved:(data.classes[0]?.id||"");
        setActiveClassIdState(next||"");
      }
    }finally{setLoading(false)}
  }

  useEffect(()=>{void refresh()},[user?.id]);

  function setActiveClassId(id:string){
    setActiveClassIdState(id);
    if(id)localStorage.setItem("marketlab-active-class",id);
  }

  async function createClass(input:{name:string;period?:string;startingCash:number}){
    const access=token();if(!access)return {ok:false,error:"Sign in required."};
    const res=await fetch("/api/classes",{method:"POST",headers:{"content-type":"application/json",Authorization:"Bearer "+access},body:JSON.stringify(input)});
    const data=await res.json();
    if(!res.ok)return {ok:false,error:data.error||"Could not create class."};
    await refresh();setActiveClassId(data.classroom.id);return {ok:true,classroom:data.classroom};
  }

  async function joinClass(code:string){
    const access=token();if(!access)return {ok:false,error:"Sign in required."};
    const res=await fetch("/api/classes/join",{method:"POST",headers:{"content-type":"application/json",Authorization:"Bearer "+access},body:JSON.stringify({code})});
    const data=await res.json();
    if(!res.ok)return {ok:false,error:data.error||"Could not join class."};
    await refresh();setActiveClassId(data.classroom.id);return {ok:true,classroom:data.classroom};
  }

  const activeClass=useMemo(()=>classes.find(c=>c.id===activeClassId)??null,[classes,activeClassId]);

  return <ClassroomContext.Provider value={{loading,classes,activeClass,setActiveClassId,refresh,createClass,joinClass}}>{children}</ClassroomContext.Provider>;
}

export function useClassroom(){
  const value=useContext(ClassroomContext);
  if(!value)throw new Error("useClassroom must be inside ClassroomProvider");
  return value;
}
