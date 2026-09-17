import Link from "next/link";
import { ArrowRight, BarChart3, GraduationCap, ShieldCheck, Trophy } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export default function Home(){
  return <main className="landing simpleLanding">
    <nav className="landingNav">
      <BrandLogo/>
      <div className="landingActions">
        <Link href="/login" className="ghostButton">Sign in</Link>
        <Link href="/trade" className="primaryButton">Open markets</Link>
      </div>
    </nav>

    <section className="simpleHero">
      <div className="simpleHeroCopy">
        <span className="eyebrow">CLASSROOM PAPER TRADING</span>
        <h1>MarketLab</h1>
        <p>Real market data. Paper portfolios. Classroom competitions.</p>
        <div className="heroActions">
          <Link href="/login" className="primaryButton large">Get started <ArrowRight size={16}/></Link>
          <Link href="/trade" className="ghostButton large">Browse markets</Link>
        </div>
      </div>
      <div className="simpleTerminal" aria-label="MarketLab product preview">
        <div className="terminalTop"><span>MARKETLAB</span><em>MARKETS</em></div>
        <div className="simpleTerminalHead"><div><b>AAPL</b><span>Apple Inc.</span></div><small>Interactive chart</small></div>
        <div className="simpleChartGrid">
          <svg viewBox="0 0 700 260" preserveAspectRatio="none">
            <path d="M0 210 C45 205 65 230 92 190 S150 175 176 183 S222 142 256 153 S307 164 334 132 S390 122 420 137 S475 102 505 111 S560 85 590 94 S642 63 700 72" fill="none" stroke="#26a69a" strokeWidth="3"/>
          </svg>
        </div>
        <div className="simpleTerminalFoot"><span>Candles</span><span>Watchlist</span><span>Paper orders</span><span>Portfolio</span></div>
      </div>
    </section>

    <section className="simpleFeatures">
      <article><BarChart3 size={19}/><b>Real prices & charts</b><span>Search U.S. stocks and ETFs and inspect actual market candles.</span></article>
      <article><Trophy size={19}/><b>Class leaderboards</b><span>Standings are built from enrolled students, not sample users.</span></article>
      <article><GraduationCap size={19}/><b>Teacher controls</b><span>Create classes, share codes, pause trading, and manage rosters.</span></article>
      <article><ShieldCheck size={19}/><b>Paper trading only</b><span>No brokerage account and no real money.</span></article>
    </section>
  </main>;
}
