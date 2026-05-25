import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arc Starter Kit | Swap & Bridge stablecoins on Arc",
  description: "A fast, production-ready EVM dApp boilerplate utilizing Circle App Kit for swap, bridge, and unified balance Gateway operations.",
  keywords: ["Arc Network", "Circle App Kit", "USDC", "EURC", "CCTP", "Bridge", "Swap", "dApp boilerplate"],
  authors: [{ name: "Arc Developers" }],
  icons: {
    icon: "https://cdn.prod.website-files.com/685311a976e7c248b5dfde95/68921f69e5659feee825637e_9a3d143150a36125b5d7f0c2367c9ca6_arc-favicon-test.png",
  },
  openGraph: {
    title: "Arc Starter Kit | Circle App Kit Swap & Bridge",
    description: "Production-ready dApp boilerplate on Arc Network using USDC as native gas.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50 font-sans selection:bg-sky-500/30 selection:text-sky-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
