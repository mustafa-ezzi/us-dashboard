"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/push/client";
import { InstallPrompt } from "./InstallPrompt";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <>
      {children}
      <InstallPrompt />
    </>
  );
}
