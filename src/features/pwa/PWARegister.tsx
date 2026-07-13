"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "development") {
        // Unregister service worker in development to prevent Next.js HMR/Fast Refresh loops
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let registration of registrations) {
            registration.unregister().then((success) => {
              if (success) {
                console.log("Dev Service Worker unregistered successfully to allow Fast Refresh.");
                // Force reload once to clear active service worker control
                window.location.reload();
              }
            });
          }
        });
      } else {
        // Register service worker normally in production
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Service Worker registered successfully with scope:", reg.scope);
          })
          .catch((err) => {
            console.error("Service Worker registration failed:", err);
          });
      }
    }
  }, []);

  return null;
}
