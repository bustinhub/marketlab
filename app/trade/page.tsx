import { TradeScreen } from "@/components/TradeScreen";

export default async function TradePage({searchParams}:{searchParams:Promise<{symbol?:string}>}){
  const params=await searchParams;
  return <TradeScreen initialSymbol={params.symbol??"AAPL"}/>;
}
