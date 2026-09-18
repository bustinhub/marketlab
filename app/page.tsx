import Link from "next/link";
import { ArrowRight, BarChart3, GraduationCap, ShieldCheck, Trophy } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { StockLogo } from "@/components/StockLogo";

export default function Home(){
  return <main className="landing simpleLanding homeV2">
    <nav className="landingNav">
      <BrandLogo/>
      <div className="landingActions">
        <Link href="/login" className="ghostButton">Sign in</Link>
        <Link href="/trade" className="primaryButton">Open markets</Link>
      </div>
    </nav>

    <section className="simpleHero homeHeroV2">
      <div className="simpleHeroCopy">
        <h1>MarketLab</h1>
        <p>Real market data, paper portfolios, and classroom competition in one clean trading workspace.</p>
        <div className="heroActions">
          <Link href="/login" className="primaryButton large">Get started <ArrowRight size={16}/></Link>
          <Link href="/trade" className="ghostButton large">Browse markets</Link>
        </div>
        <div className="heroMeta">
          <span>Paper trading</span>
          <i/>
          <span>Live market charts</span>
          <i/>
          <span>Teacher controls</span>
        </div>
      </div>

      <div className="homeMarketPreview" aria-label="MarketLab market preview">
        <div className="previewTop">
          <BrandLogo compact/>
          <div className="previewTabs"><b>Markets</b><span>Portfolio</span><span>Classes</span></div>
        </div>

        <div className="previewInstrument">
          <div className="previewIdentity">
            <StockLogo symbol="AAPL" size={38}/>
            <div><b>Apple Inc.</b><span>AAPL · NASDAQ</span></div>
          </div>
          <div className="previewQuote">
            <b>$336.13</b>
            <span>-0.26%</span>
          </div>
        </div>

        <div className="previewChart">
          <svg viewBox="0 0 720 310" preserveAspectRatio="none" aria-hidden="true">
            <g stroke="#202024" strokeWidth="1">
              <line x1="0" y1="52" x2="720" y2="52"/><line x1="0" y1="104" x2="720" y2="104"/>
              <line x1="0" y1="156" x2="720" y2="156"/><line x1="0" y1="208" x2="720" y2="208"/>
              <line x1="0" y1="260" x2="720" y2="260"/>
              <line x1="120" y1="0" x2="120" y2="310"/><line x1="240" y1="0" x2="240" y2="310"/>
              <line x1="360" y1="0" x2="360" y2="310"/><line x1="480" y1="0" x2="480" y2="310"/>
              <line x1="600" y1="0" x2="600" y2="310"/>
            </g>
            <g strokeWidth="2">
              <line x1="42" y1="202" x2="42" y2="264" stroke="#26a69a"/><rect x="35" y="218" width="14" height="28" fill="#26a69a"/>
              <line x1="76" y1="188" x2="76" y2="244" stroke="#ef5350"/><rect x="69" y="202" width="14" height="26" fill="#ef5350"/>
              <line x1="110" y1="172" x2="110" y2="232" stroke="#26a69a"/><rect x="103" y="190" width="14" height="28" fill="#26a69a"/>
              <line x1="144" y1="152" x2="144" y2="216" stroke="#26a69a"/><rect x="137" y="169" width="14" height="31" fill="#26a69a"/>
              <line x1="178" y1="164" x2="178" y2="226" stroke="#ef5350"/><rect x="171" y="178" width="14" height="29" fill="#ef5350"/>
              <line x1="212" y1="142" x2="212" y2="204" stroke="#26a69a"/><rect x="205" y="160" width="14" height="27" fill="#26a69a"/>
              <line x1="246" y1="126" x2="246" y2="190" stroke="#26a69a"/><rect x="239" y="143" width="14" height="31" fill="#26a69a"/>
              <line x1="280" y1="136" x2="280" y2="198" stroke="#ef5350"/><rect x="273" y="151" width="14" height="30" fill="#ef5350"/>
              <line x1="314" y1="116" x2="314" y2="184" stroke="#26a69a"/><rect x="307" y="137" width="14" height="30" fill="#26a69a"/>
              <line x1="348" y1="98" x2="348" y2="168" stroke="#26a69a"/><rect x="341" y="118" width="14" height="34" fill="#26a69a"/>
              <line x1="382" y1="110" x2="382" y2="174" stroke="#ef5350"/><rect x="375" y="126" width="14" height="31" fill="#ef5350"/>
              <line x1="416" y1="90" x2="416" y2="158" stroke="#26a69a"/><rect x="409" y="112" width="14" height="30" fill="#26a69a"/>
              <line x1="450" y1="76" x2="450" y2="146" stroke="#26a69a"/><rect x="443" y="98" width="14" height="31" fill="#26a69a"/>
              <line x1="484" y1="88" x2="484" y2="154" stroke="#ef5350"/><rect x="477" y="103" width="14" height="33" fill="#ef5350"/>
              <line x1="518" y1="72" x2="518" y2="136" stroke="#26a69a"/><rect x="511" y="90" width="14" height="30" fill="#26a69a"/>
              <line x1="552" y1="54" x2="552" y2="122" stroke="#26a69a"/><rect x="545" y="74" width="14" height="32" fill="#26a69a"/>
              <line x1="586" y1="66" x2="586" y2="128" stroke="#ef5350"/><rect x="579" y="80" width="14" height="31" fill="#ef5350"/>
              <line x1="620" y1="44" x2="620" y2="112" stroke="#26a69a"/><rect x="613" y="63" width="14" height="32" fill="#26a69a"/>
              <line x1="654" y1="34" x2="654" y2="98" stroke="#26a69a"/><rect x="647" y="51" width="14" height="30" fill="#26a69a"/>
            </g>
            <g opacity=".35">
              <rect x="35" y="272" width="14" height="23" fill="#26a69a"/><rect x="69" y="278" width="14" height="17" fill="#ef5350"/>
              <rect x="103" y="268" width="14" height="27" fill="#26a69a"/><rect x="137" y="260" width="14" height="35" fill="#26a69a"/>
              <rect x="171" y="275" width="14" height="20" fill="#ef5350"/><rect x="205" y="265" width="14" height="30" fill="#26a69a"/>
              <rect x="239" y="270" width="14" height="25" fill="#26a69a"/><rect x="273" y="278" width="14" height="17" fill="#ef5350"/>
              <rect x="307" y="258" width="14" height="37" fill="#26a69a"/><rect x="341" y="252" width="14" height="43" fill="#26a69a"/>
              <rect x="375" y="276" width="14" height="19" fill="#ef5350"/><rect x="409" y="264" width="14" height="31" fill="#26a69a"/>
              <rect x="443" y="254" width="14" height="41" fill="#26a69a"/><rect x="477" y="272" width="14" height="23" fill="#ef5350"/>
              <rect x="511" y="266" width="14" height="29" fill="#26a69a"/><rect x="545" y="250" width="14" height="45" fill="#26a69a"/>
              <rect x="579" y="274" width="14" height="21" fill="#ef5350"/><rect x="613" y="256" width="14" height="39" fill="#26a69a"/>
              <rect x="647" y="246" width="14" height="49" fill="#26a69a"/>
            </g>
          </svg>
          <div className="previewPriceLine"><span>336.13</span></div>
        </div>

        <div className="previewFooter">
          <div><b>1D</b><span>5D</span><span>1M</span><span>6M</span><span>1Y</span></div>
          <em>Paper trading · No real money</em>
        </div>
      </div>
    </section>

    <section className="simpleFeatures homeFeaturesV2">
      <article><BarChart3 size={19}/><b>Real prices & charts</b><span>Search U.S. stocks and ETFs and inspect real market candles.</span></article>
      <article><Trophy size={19}/><b>Class leaderboards</b><span>Rank students by actual paper-portfolio performance.</span></article>
      <article><GraduationCap size={19}/><b>Teacher controls</b><span>Create classes, share codes, pause trading, and manage rosters.</span></article>
      <article><ShieldCheck size={19}/><b>Paper trading only</b><span>No brokerage account and no real money.</span></article>
    </section>
  </main>;
}
