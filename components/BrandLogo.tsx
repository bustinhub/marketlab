import Link from "next/link";

export function MarketLabMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="MarketLab logo">
      <rect x="1" y="1" width="62" height="62" rx="17" fill="#0E151E" stroke="#263344" strokeWidth="2"/>
      <path d="M14 43V28M14 34H22M28 47V18M28 25H36M42 39V24M42 30H50" stroke="#EAF2FA" strokeWidth="4" strokeLinecap="round"/>
      <path d="M11 46L24 34L35 39L53 17" stroke="#6EA8FE" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="53" cy="17" r="3.5" fill="#53D3A2"/>
    </svg>
  );
}

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brandLogo" aria-label="MarketLab home">
      <MarketLabMark size={34}/>
      {!compact && <span className="brandWord"><b>Market</b><strong>Lab</strong></span>}
    </Link>
  );
}
