import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from "../components/Header";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SyncX | Real-time AI Crypto Payments & Swaps",
  description: "SyncX is a premium, AI-powered consumer financial application delivering seamless stablecoin payments, swaps, and unified balance management with accessible gas fees.",
  keywords: ["SyncX", "Crypto Payments", "USDC", "Stablecoin Swaps", "AI Assistant", "Fintech"],
  authors: [{ name: "SyncX Team" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "SyncX – AI-powered Crypto Payments & Swaps",
    description: "Experience seamless, secure, and intelligent stablecoin transfers and swaps with SyncX.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-sky-500/10 selection:text-sky-900">
        <Header />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
