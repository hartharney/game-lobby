import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Harneys Game Lobby",
  description:
    "Join the Harneys Game Lobby — a fun, multi-user game where players guess a winning number in real time!",
  keywords: [
    "game lobby",
    "multi-player game",
    "number guessing game",
    "Harneys",
    "online game",
  ],
  authors: [{ name: "Harneys", url: "https://harneys.com" }],
  creator: "Harneys",
  openGraph: {
    title: "Harneys Game Lobby",
    description:
      "Join the Harneys Game Lobby — guess the winning number and compete live with other players!",
    url: "https://harneys-game.com",
    siteName: "Harneys Game Lobby",
    images: [
      {
        url: "/images/lobby-preview.png",
        width: 1200,
        height: 630,
        alt: "Harneys Game Lobby Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Harneys Game Lobby",
    description:
      "A fun, live multi-user game — guess the winning number and compete with others in real time!",
    images: ["/images/lobby-preview.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  themeColor: "#0f172a",
  manifest: "/site.webmanifest",
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
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: "#4ade80",
                color: "white",
              },
            },
            error: {
              style: {
                background: "#ef4444",
                color: "white",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
