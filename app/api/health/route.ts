import { NextResponse } from "next/server";

export async function GET(){
  const marketData=Boolean(process.env.TWELVE_DATA_API_KEY);
  const database=Boolean((process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL)&&process.env.SUPABASE_SERVICE_ROLE_KEY);
  const auth=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return NextResponse.json({
    ok:marketData&&database&&auth,
    services:{marketData,database,auth}
  });
}
