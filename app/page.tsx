"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AreaSeries, CandlestickSeries, ColorType, createChart, HistogramSeries } from "lightweight-charts";
import { BarChart3, BookOpen, ChevronDown, Eye, LineChart, Search, Settings, Star, Trophy, Users, Wallet } from "lucide-react";

type SymbolRow = { symbol: string; name: string; price: number; change: number };
type Holding = { symbol: string; shares: number; avg: number };
type Trade = { id: number; symbol: string; side: "BUY" | "SELL"; shares: number; price: number; time: string };

const seed: SymbolRow[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 248.31, change: 1.30 },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 181.42, change: 1.72 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 432.08, change: -0.48 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 231.70, change: 0.16 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 514.22, change: -0.21 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 246.88, change: 0.64 },
];

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function buildCandles(start: number) {
  const out: { time: string; open: number; high: number; low: number; close: number }[] = [];
  let last = start * 0.975;
  const now = new Date();
  for (let i = 70; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const open = last;
    const close = Math.max(2, open * (1 + (Math.random() - 0.47) * 0.025));
    const high = Math.max(open, close) * (1 + Math.random() * 0.008);
    const low = Math.min(open, close) * (1 - Math.random() * 0.008);
    out.push({ time: d.toISOString().slice(0, 10), open, high, low, close });
    last = close;
  }
  return out;
}

export default function Home() {
  const chartEl = useRef<HTMLDivElement | null>(null);
  const [stocks, setStocks] = useState(seed);
  const [selected, setSelected] = useState("AAPL");
  const [query, setQuery] = useState("");
  const [cash, setCash] = useState(100000);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [shares, setShares] = useState("1");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [chartType, setChartType] = useState<"candles" | "area">("candles");
  const [tab, setTab] = useState<"trade" | "portfolio" | "leaderboard">("trade");

  const stock = stocks.find((s) => s.symbol === selected) ?? stocks[0];
  const holding = holdings.find((h) => h.symbol === selected);
  const positionsValue = holdings.reduce((sum, h) => {
    const p = stocks.find((s) => s.symbol === h.symbol)?.price ?? h.avg;
    return sum + h.shares * p;
  }, 0);
  const equity = cash + positionsValue;
  const totalReturn = ((equity - 100000) / 100000) * 100;

  useEffect(() => {
    const t = setInterval(() => {
      setStocks((prev) =>
        prev.map((s) => {
          const next = Math.max(1, s.price * (1 + (Math.random() - 0.5) * 0.0018));
          return { ...s, price: next, change: s.change + (Math.random() - 0.5) * 0.04 };
        })
      );
    }, 1200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!chartEl.current) return;
    chartEl.current.innerHTML = "";
    const chart = createChart(chartEl.current, {
      autoSize: true,
      height: 520,
      layout: { background: { type: ColorType.Solid, color: "#0b0f14" }, textColor: "#8b98a5" },
      grid: { vertLines: { color: "#151b23" }, horzLines: { color: "#151b23" } },
      rightPriceScale: { borderColor: "#202733" },
      timeScale: { borderColor: "#202733", timeVisible: true },
      crosshair: { vertLine: { color: "#526174" }, horzLine: { color: "#526174" } },
    });
    const candles = buildCandles(stock.price);
    if (chartType === "candles") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#20c997",
        downColor: "#f05d68",
        borderUpColor: "#20c997",
        borderDownColor: "#f05d68",
        wickUpColor: "#20c997",
        wickDownColor: "#f05d68",
      });
      series.setData(candles);
    } else {
      const series = chart.addSeries(AreaSeries, {
        lineColor: "#65b5ff",
        topColor: "rgba(101,181,255,.25)",
        bottomColor: "rgba(101,181,255,.02)",
      });
      series.setData(candles.map((c) => ({ time: c.time, value: c.close })));
    }
    const volume = chart.addSeries(HistogramSeries, { priceScaleId: "", priceFormat: { type: "volume" } });
    volume.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    volume.setData(candles.map((c) => ({ time: c.time, value: Math.round(400000 + Math.random() * 4000000), color: c.close >= c.open ? "rgba(32,201,151,.28)" : "rgba(240,93,104,.28)" })));
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [selected, chartType]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return stocks.filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)).slice(0, 5);
  }, [query, stocks]);

  function execute() {
    const qty = Number(shares);
    if (!Number.isFinite(qty) || qty <= 0) return;
    const cost = qty * stock.price;

    if (side === "BUY") {
      if (cost > cash) return;
      setCash((v) => v - cost);
      setHoldings((prev) => {
        const existing = prev.find((h) => h.symbol === stock.symbol);
        if (!existing) return [...prev, { symbol: stock.symbol, shares: qty, avg: stock.price }];
        const totalShares = existing.shares + qty;
        const avg = (existing.avg * existing.shares + stock.price * qty) / totalShares;
        return prev.map((h) => h.symbol === stock.symbol ? { ...h, shares: totalShares, avg } : h);
      });
    } else {
      if (!holding || qty > holding.shares) return;
      setCash((v) => v + cost);
      setHoldings((prev) => prev.map((h) => h.symbol === stock.symbol ? { ...h, shares: h.shares - qty } : h).filter((h) => h.shares > 0.000001));
    }

    setTrades((prev) => [{
      id: Date.now(),
      symbol: stock.symbol,
      side,
      shares: qty,
      price: stock.price,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }, ...prev]);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><div className="mark">M</div><span>MarketLab</span><em>SIM</em></div>
        <div className="searchWrap">
          <Search size={17} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search stocks, ETFs..." />
          <kbd>Ctrl K</kbd>
          {results.length > 0 && <div className="searchMenu">{results.map((r) => <button key={r.symbol} onClick={() => { setSelected(r.symbol); setQuery(""); }}>{r.symbol}<span>{r.name}</span><b>{money(r.price)}</b></button>)}</div>}
        </div>
        <div className="marketOpen"><span /> Market open</div>
        <button className="avatar">ST</button>
      </header>

      <div className="appGrid">
        <aside className="leftbar">
          <button className={tab === "trade" ? "nav active" : "nav"} onClick={() => setTab("trade")}><LineChart size={18}/> Markets</button>
          <button className={tab === "portfolio" ? "nav active" : "nav"} onClick={() => setTab("portfolio")}><Wallet size={18}/> Portfolio</button>
          <button className={tab === "leaderboard" ? "nav active" : "nav"} onClick={() => setTab("leaderboard")}><Trophy size={18}/> Leaderboard</button>
          <button className="nav"><BookOpen size={18}/> Learn</button>
          <div className="navDivider" />
          <div className="classCard"><small>CLASS</small><strong>Personal Finance</strong><span>Period 3 · PF3-2026</span><div><Users size={15}/> 24 students</div></div>
          <button className="nav bottom"><Settings size={18}/> Settings</button>
        </aside>

        <section className="workspace">
          {tab === "trade" && <>
            <div className="quoteHead">
              <div>
                <div className="tickerLine"><div className="tickerBadge">{stock.symbol.slice(0,1)}</div><h1>{stock.symbol}</h1><span>{stock.name}</span><Star size={18}/></div>
                <div className="bigPrice">{money(stock.price)} <span className={stock.change >= 0 ? "up" : "down"}>{stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%</span></div>
                <p>Simulated live market data · updates every ~1.2 sec</p>
              </div>
              <div className="headActions"><button><Eye size={16}/> Watchlist</button><button><BarChart3 size={16}/> Compare</button></div>
            </div>

            <div className="chartToolbar">
              <div className="ranges"><button className="selected">1D</button><button>5D</button><button>1M</button><button>3M</button><button>6M</button><button>YTD</button><button>1Y</button><button>5Y</button></div>
              <div className="chartSwitch"><button className={chartType === "candles" ? "selected" : ""} onClick={() => setChartType("candles")}>Candles</button><button className={chartType === "area" ? "selected" : ""} onClick={() => setChartType("area")}>Line</button></div>
            </div>
            <div className="chart" ref={chartEl} />
            <div className="metricStrip"><div><span>Open</span><strong>{money(stock.price * .994)}</strong></div><div><span>Day range</span><strong>{money(stock.price * .985)} – {money(stock.price * 1.011)}</strong></div><div><span>52W range</span><strong>{money(stock.price * .68)} – {money(stock.price * 1.15)}</strong></div><div><span>Volume</span><strong>42.8M</strong></div><div><span>Market cap</span><strong>$3.69T</strong></div></div>
          </>}

          {tab === "portfolio" && <div className="pagePad">
            <div className="pageTitle"><div><small>PORTFOLIO</small><h1>{money(equity)}</h1><p className={totalReturn >= 0 ? "up" : "down"}>{totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(2)}% all time</p></div></div>
            <div className="portfolioCards"><div><span>Buying power</span><strong>{money(cash)}</strong></div><div><span>Invested</span><strong>{money(positionsValue)}</strong></div><div><span>Positions</span><strong>{holdings.length}</strong></div></div>
            <div className="tableCard"><h2>Holdings</h2>{holdings.length === 0 ? <p className="empty">No positions yet. Head to Markets and place a simulated trade.</p> : <table><thead><tr><th>Symbol</th><th>Shares</th><th>Avg cost</th><th>Market value</th><th>Return</th></tr></thead><tbody>{holdings.map((h) => { const p = stocks.find((s) => s.symbol === h.symbol)?.price ?? h.avg; const ret = ((p-h.avg)/h.avg)*100; return <tr key={h.symbol}><td><b>{h.symbol}</b></td><td>{h.shares.toFixed(4)}</td><td>{money(h.avg)}</td><td>{money(p*h.shares)}</td><td className={ret >= 0 ? "up" : "down"}>{ret.toFixed(2)}%</td></tr>})}</tbody></table>}</div>
            <div className="tableCard"><h2>Recent trades</h2>{trades.length === 0 ? <p className="empty">No trades yet.</p> : trades.map((t) => <div className="tradeRow" key={t.id}><span className={t.side === "BUY" ? "buyTag" : "sellTag"}>{t.side}</span><b>{t.symbol}</b><span>{t.shares.toFixed(4)} shares @ {money(t.price)}</span><time>{t.time}</time></div>)}</div>
          </div>}

          {tab === "leaderboard" && <div className="pagePad">
            <div className="pageTitle"><div><small>CLASS COMPETITION</small><h1>Leaderboard</h1><p>Personal Finance · Period 3</p></div><span className="season">23 days remaining</span></div>
            <div className="leaderCard">
              {[
                ["1","Mason R.",106879,6.88],
                ["2","You",equity,totalReturn],
                ["3","Caleb G.",104228,4.23],
                ["4","Jordan P.",102918,2.92],
                ["5","Avery L.",101443,1.44]
              ].sort((a,b)=>Number(b[2])-Number(a[2])).map((r,i)=><div className={r[1] === "You" ? "leader you" : "leader"} key={String(r[1])}><div className="rank">{i+1}</div><div className="person"><div className="miniAvatar">{String(r[1]).slice(0,1)}</div><div><b>{r[1]}</b><span>{r[1] === "You" ? "Your portfolio" : "Student"}</span></div></div><strong>{money(Number(r[2]))}</strong><span className={Number(r[3]) >= 0 ? "up" : "down"}>{Number(r[3]) >= 0 ? "+" : ""}{Number(r[3]).toFixed(2)}%</span></div>)}
            </div>
          </div>}
        </section>

        <aside className="rightbar">
          <div className="accountMini"><span>Portfolio value</span><strong>{money(equity)}</strong><em className={totalReturn >= 0 ? "up" : "down"}>{totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(2)}%</em></div>
          <div className="watchHead"><strong>Watchlist</strong><button>+</button></div>
          <div className="watchCols"><span>Symbol</span><span>Last</span><span>Chg%</span></div>
          {stocks.map((s) => <button key={s.symbol} className={selected === s.symbol ? "watch active" : "watch"} onClick={() => {setSelected(s.symbol);setTab("trade")}}><div><span className="dot"/><b>{s.symbol}</b></div><span>{s.price.toFixed(2)}</span><span className={s.change >= 0 ? "up" : "down"}>{s.change >= 0 ? "+" : ""}{s.change.toFixed(2)}%</span></button>)}

          <div className="ticket">
            <div className="ticketTabs"><button className={side === "BUY" ? "buy active" : ""} onClick={() => setSide("BUY")}>Buy</button><button className={side === "SELL" ? "sell active" : ""} onClick={() => setSide("SELL")}>Sell</button></div>
            <label>Order type<button className="selectish">Market <ChevronDown size={14}/></button></label>
            <label>Shares<input value={shares} onChange={(e) => setShares(e.target.value)} inputMode="decimal"/></label>
            <div className="estimate"><span>Est. total</span><strong>{money((Number(shares)||0)*stock.price)}</strong></div>
            <div className="estimate"><span>{side === "BUY" ? "Buying power" : "Shares owned"}</span><strong>{side === "BUY" ? money(cash) : (holding?.shares ?? 0).toFixed(4)}</strong></div>
            <button className={side === "BUY" ? "execute buyBtn" : "execute sellBtn"} onClick={execute}>Review {side.toLowerCase()} order</button>
            <small>Paper trading only. No real money or securities are involved.</small>
          </div>
        </aside>
      </div>
    </main>
  );
}
