import type { Metadata } from "next";
import "./globals.css";
import "../public/ui.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ClassroomProvider } from "@/components/ClassroomProvider";
import { TradingProvider } from "@/components/TradingProvider";

export const metadata: Metadata = {
  title:{default:"MarketLab",template:"%s · MarketLab"},
  description:"Classroom paper trading.",
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>
    <AuthProvider>
      <ClassroomProvider>
        <TradingProvider>{children}</TradingProvider>
      </ClassroomProvider>
    </AuthProvider>
  </body></html>;
}
