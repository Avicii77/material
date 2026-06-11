import type { Metadata } from "next";
import { Inter_Tight, Noto_Sans_KR } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans-kr",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReCos",
  description: "화장품 원료 C2C 매칭 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${interTight.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-bg text-ink antialiased">
        <div className="bg-band py-[9px] text-center text-[11px] uppercase tracking-[0.14em] text-[#cfd3d6]">
          RECOS · COSMETIC RAW MATERIAL CIRCULAR MARKET
        </div>
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
