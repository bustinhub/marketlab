import type { Metadata } from "next";
import "./globals.css";
import { TradingProvider } from "@/components/TradingProvider";

export const metadata: Metadata = {
  title: { default:"MarketLab — Classroom Paper Trading", template:"%s · MarketLab" },
  description:"A classroom paper-trading platform with interactive charts, portfolios, leaderboards, and teacher tools.",
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body><TradingProvider>{children}</TradingProvider></body></html>;
}
