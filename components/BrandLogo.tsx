import Link from "next/link";

export function MarketLabMark({size=36}:{size?:number}){
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="MarketLab logo">
      <path d="M8 12V29M5.5 17H10.5V24H5.5V17Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M19 8V27M16.5 12H21.5V20H16.5V12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M30 14V31M27.5 19H32.5V26H27.5V19Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M4 31L13 25L21 28L35 9" stroke="#2962FF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="35" cy="9" r="2.6" fill="#26A69A"/>
    </svg>
  );
}

export function BrandLogo({compact=false}:{compact?:boolean}){
  return (
    <Link href="/" className="brandLogo" aria-label="MarketLab home">
      <MarketLabMark size={34}/>
      {!compact&&<span className="brandWord"><b>Market</b><strong>Lab</strong></span>}
    </Link>
  );
}
