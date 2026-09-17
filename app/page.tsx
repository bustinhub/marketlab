import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, CandlestickChart, CheckCircle2, GraduationCap, ShieldCheck, Trophy } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { MARKET_INDEXES, MARKET_SYMBOLS, pct } from "@/lib/market";

export default function Home(){
  const featured=MARKET_SYMBOLS.slice(0,5);
  return <main className="landing">
    <nav className="landingNav">
      <BrandLogo/>
      <div className="landingLinks"><a href="#features">Features</a><a href="#classroom">Classroom</a><Link href="/learn">Learn</Link></div>
      <div className="landingActions"><Link href="/teacher" className="ghostButton">Teacher console</Link><Link href="/trade" className="primaryButton">Open MarketLab <ArrowRight size={15}/></Link></div>
    </nav>

    <section className="heroSection">
      <div className="heroCopy">
        <div className="eyebrow"><span/> CLASSROOM PAPER TRADING</div>
        <h1>Learn the market<br/><em>by using it.</em></h1>
        <p>MarketLab turns real market concepts into a hands-on classroom competition with paper money, professional charts, portfolios, and a live leaderboard.</p>
        <div className="heroActions"><Link href="/trade" className="primaryButton large">Start paper trading <ArrowRight size={17}/></Link><Link href="/leaderboard" className="ghostButton large"><Trophy size={16}/> View leaderboard</Link></div>
        <div className="trustRow"><span><ShieldCheck size={15}/> No real money</span><span><CheckCircle2 size={15}/> Built for classrooms</span><span><CandlestickChart size={15}/> Interactive charts</span></div>
      </div>

      <div className="heroTerminal">
        <div className="terminalTop"><div><i/><i/><i/></div><span>MARKETLAB / MARKETS</span><em>SIMULATION</em></div>
        <div className="terminalQuote"><div><small>NASDAQ</small><h2>AAPL</h2><span>Apple Inc.</span></div><div><strong>$248.31</strong><b>+1.30%</b></div></div>
        <div className="fakeChart">
          <svg viewBox="0 0 700 300" preserveAspectRatio="none">
            <defs><linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6ea8fe" stopOpacity=".28"/><stop offset="100%" stopColor="#6ea8fe" stopOpacity="0"/></linearGradient></defs>
            <path d="M0 226 C35 218 42 246 70 214 S111 190 132 202 S172 159 198 171 S238 205 262 166 S302 143 326 157 S365 114 392 128 S438 167 460 118 S505 99 529 111 S568 83 594 94 S646 60 700 72 L700 300 L0 300Z" fill="url(#heroFill)"/>
            <path d="M0 226 C35 218 42 246 70 214 S111 190 132 202 S172 159 198 171 S238 205 262 166 S302 143 326 157 S365 114 392 128 S438 167 460 118 S505 99 529 111 S568 83 594 94 S646 60 700 72" fill="none" stroke="#72a8ff" strokeWidth="3"/>
          </svg>
          <div className="chartGridLines"><i/><i/><i/><i/></div>
        </div>
        <div className="terminalStats"><div><span>Buying power</span><b>$100,000</b></div><div><span>Class rank</span><b>#4</b></div><div><span>Total return</span><b className="up">+3.42%</b></div></div>
      </div>
    </section>

    <section className="landingTicker">{MARKET_INDEXES.map(i=><div key={i.symbol}><span>{i.name}</span><b>{i.value}</b><em className={i.change>=0?"up":"down"}>{pct(i.change)}</em></div>)}</section>

    <section id="features" className="featuresSection">
      <div className="sectionIntro"><small>ONE PLATFORM</small><h2>Everything a student needs to understand investing.</h2><p>Built to feel like a serious market tool, without the financial risk or overwhelming complexity.</p></div>
      <div className="featureGrid">
        <article><div className="featureIcon"><CandlestickChart/></div><h3>Professional charts</h3><p>Inspect candlesticks, volume, ranges, and price movement with an interactive chart built for exploration.</p></article>
        <article><div className="featureIcon"><BarChart3/></div><h3>Paper portfolios</h3><p>Buy and sell with classroom money, track cost basis, allocation, returns, and complete trade history.</p></article>
        <article><div className="featureIcon"><Trophy/></div><h3>Class leaderboard</h3><p>Turn investing lessons into an ongoing class competition ranked by portfolio performance.</p></article>
        <article><div className="featureIcon"><GraduationCap/></div><h3>Teacher controls</h3><p>Create rules, freeze trading, review activity, manage starting cash, and inspect student portfolios.</p></article>
        <article><div className="featureIcon"><BookOpen/></div><h3>Learn as you trade</h3><p>Short explanations and lessons connect market vocabulary to the exact tools students are using.</p></article>
        <article><div className="featureIcon"><ShieldCheck/></div><h3>Simulation first</h3><p>No deposits, no brokerage account, and no real securities. The experience is designed for learning.</p></article>
      </div>
    </section>

    <section id="classroom" className="classroomSection">
      <div className="classroomCopy"><small>FOR THE WHOLE CLASS</small><h2>A finance lesson students actually want to check.</h2><p>Give every student the same starting balance, then let the market make the lesson interactive. Teachers get oversight; students get the experience of managing a portfolio.</p><Link href="/teacher" className="textLink">Explore teacher tools <ArrowRight size={15}/></Link></div>
      <div className="classroomTable">
        <div className="miniTableHead"><span>STUDENT</span><span>PORTFOLIO</span><span>RETURN</span></div>
        {featured.slice(0,4).map((s,i)=><div className="miniTableRow" key={s.symbol}><div><b>{i+1}</b><i style={{background:s.color}}/><span>{["Mason R.","Jordan P.","Ashley Y.","Caleb G."][i]}</span></div><strong>{"$"}{(108420-i*1687).toLocaleString()}</strong><em className="up">+{(8.42-i*1.61).toFixed(2)}%</em></div>)}
      </div>
    </section>

    <footer className="landingFooter"><BrandLogo/><p>MarketLab is a classroom paper-trading simulation. It does not provide brokerage services or investment advice.</p><Link href="/trade">Launch app →</Link></footer>
  </main>;
}
