import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from "../components/Header";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SyncX | Crypto Payments & Swap",
  description: "SyncX is a premium fintech app delivering AI-powered crypto payments, swaps and balances on Arc Network with USDC as native gas.",
  keywords: ["SyncX", "Crypto Payments", "USDC", "Arc Network", "AI Assistant"],
  authors: [{ name: "SyncX Team" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "SyncX – AI-powered crypto payments",
    description: "Experience seamless crypto payments and AI assistance with SyncX.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50 font-sans selection:bg-sky-500/30 selection:text-sky-200">
        <Header />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
