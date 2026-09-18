import Link from "next/link";

export function MarketLabMark({size=34}:{size?:number}){
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-label="MarketLab logo">
      <path d="M5.5 26V10L12.5 19L19 10V26" stroke="currentColor" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M25 10V26H31.5" stroke="#7E97FF" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function BrandLogo({compact=false}:{compact?:boolean}){
  return (
    <Link href="/" className="brandLogo" aria-label="MarketLab home">
      <MarketLabMark size={31}/>
      {!compact&&<span className="brandWord"><b>Market</b><strong>Lab</strong></span>}
    </Link>
  );
}
