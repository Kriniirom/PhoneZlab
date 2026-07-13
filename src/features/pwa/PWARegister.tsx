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
                window.location.reload();
              }
            });
          }
        });
      } else {
        // Clean, standard registration script that executes after load event
        const registerSW = () => {
          navigator.serviceWorker
            .register("/service-worker.js")
            .then((reg) => {
              console.log("Service Worker registered successfully with scope:", reg.scope);
            })
            .catch((err) => {
              console.error("Service Worker registration failed:", err);
            });
        };

        if (document.readyState === "complete") {
          registerSW();
        } else {
          window.addEventListener("load", registerSW);
          return () => window.removeEventListener("load", registerSW);
        }
      }
    }
  }, []);

  return null;
}
