import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, Space_Mono, Geist } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
// import "./global.css";

// export const metadata: Metadata = {
//   title: "SabiMarket AI",
//   description:
//     "Voice-first market assistant for Nigerian traders — track sales, know today's best prices, no wahala.",
//   manifest: "/manifest.json",
//   appleWebApp: {
//     capable: true,
//     statusBarStyle: "black-translucent",
//     title: "SabiMarket AI",
//   },
//   icons: {
//     icon: "/icons/icon-192.png",
//     apple: "/icons/icon-192.png",
//   },
// };

// export const viewport: Viewport = {
//   themeColor: "#1E3A5F",
//   width: "device-width",
//   initialScale: 1,
//   maximumScale: 1,
//   viewportFit: "cover",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div>{children}</div>
      <BottomNav />
    </div>
  );
}
