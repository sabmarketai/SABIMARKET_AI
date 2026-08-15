import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, Space_Mono, Geist } from "next/font/google";
import "./global.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import Providers from "@/providers/providers";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SabiMarket AI",
  description:
    "Voice-first market assistant for Nigerian traders — track sales, know today's best prices, no wahala.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SabiMarket AI",
  },
  icons: {
    icon: "/icons/apple_icon_1024.png",
    apple: "/icons/apple_icon_1024.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E3A5F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        fraunces.variable,
        manrope.variable,
        spaceMono.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="font-sans">
        <Providers>
          <Toaster position="top-center" richColors />
          <div className="mx-auto flex min-h-dvh flex-col bg-white p-4 text-foreground shadow-card">
            <main className="flex-1 overflow-y-auto pb-24">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
