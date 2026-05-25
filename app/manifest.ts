import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Us Dashboard",
    short_name: "Us",
    description: "A private relationship dashboard for two.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF9FB",
    theme_color: "#E91E8C",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/notification-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/notification-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
