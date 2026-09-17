export function money(n:number,currency="USD"){
  try{return n.toLocaleString("en-US",{style:"currency",currency})}
  catch{return "$"+n.toFixed(2)}
}

export function pct(n:number){
  return (n>=0?"+":"")+n.toFixed(2)+"%";
}

export const DEFAULT_WATCHLIST=["AAPL","NVDA","TSLA","MSFT","AMZN"];
