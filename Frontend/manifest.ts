// app/manifest.ts

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SabiMarket AI",
    short_name: "SabiM",
    description:
      "Voice-first market assistant for Nigerian traders — track sales, know today's best prices, no wahala.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAF3E6",
    theme_color: "#1E3A5F",
    icons: [
      {
        src: "/icons/apple_icon_1024.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/apple_icon_1024.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}