import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AdiSweeper — Free Online Minesweeper Game",
    template: "%s | AdiSweeper",
  },
  description:
    "Play AdiSweeper — a free, fast, and modern Minesweeper game. Choose Easy, Medium, or Hard difficulty, beat the clock, and compete on the global leaderboard.",
  keywords: [
    "minesweeper",
    "free minesweeper",
    "online minesweeper",
    "adisweeper",
    "minesweeper game",
    "browser minesweeper",
    "minesweeper leaderboard",
  ],
  openGraph: {
    title: "AdiSweeper — Free Online Minesweeper Game",
    description:
      "Play AdiSweeper — a free, fast, and modern Minesweeper game online.",
    type: "website",
    locale: "en_US",
    siteName: "AdiSweeper",
  },
  twitter: {
    card: "summary_large_image",
    title: "AdiSweeper — Free Online Minesweeper Game",
    description: "Play Minesweeper online for free. Compete on the global leaderboard.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
