import Link from "next/link";

export function MarketLabMark({size=34}:{size?:number}){
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-label="MarketLab logo">
      <path d="M5.5 25.5V10.5L12.5 19.5L18 11L23.5 19.5L30.5 8.5V25.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.5 25.5L25.2 20.8L28.2 22.7L32 17.2" stroke="#6F8FFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="32" cy="17.2" r="1.8" fill="#6F8FFF"/>
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
