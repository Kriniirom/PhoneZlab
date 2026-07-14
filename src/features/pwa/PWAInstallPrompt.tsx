"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    // Only run in client-side environment
    if (typeof window === "undefined") return;

    // 1. Check if the app is already running in standalone (PWA) mode
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true;
      
    if (isStandalone) return;

    // 2. Check if user already dismissed or installed the prompt
    const isDismissed = localStorage.getItem("pwa-install-prompt-dismissed") === "true";
    if (isDismissed) return;

    // 3. Setup auto-hide timeout handler
    let hideTimer: NodeJS.Timeout;

    const triggerPromptDisplay = () => {
      setIsVisible(true);
      // Auto-hide the banner after 8 seconds
      hideTimer = setTimeout(() => {
        setIsVisible(false);
        localStorage.setItem("pwa-install-prompt-dismissed", "true");
      }, 8000);
    };

    // 4. Handle development mode simulation
    const searchParams = new URLSearchParams(window.location.search);
    if (process.env.NODE_ENV === "development" && searchParams.get("simulate-pwa-prompt") === "true") {
      setIsSimulated(true);
      // Mock the prompt event
      const mockEvent = {
        prompt: async () => {
          alert("PWA installation triggered! (Simulated Mode)");
        },
        userChoice: Promise.resolve({ outcome: "accepted" as const, platform: "" }),
      } as unknown as BeforeInstallPromptEvent;
      
      setDeferredPrompt(mockEvent);
      // Delay slightly for dramatic/smooth entry
      const entryTimer = setTimeout(triggerPromptDisplay, 1000);
      return () => {
        clearTimeout(entryTimer);
        clearTimeout(hideTimer);
      };
    }

    // 5. Listen for the native beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the browser's default prompt from appearing
      e.preventDefault();
      // Store the event so we can trigger it later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install banner
      triggerPromptDisplay();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Trigger the prompt
    await deferredPrompt.prompt();

    // In simulated mode, we can mock userChoice
    const outcome = isSimulated 
      ? "accepted" 
      : (await deferredPrompt.userChoice).outcome;

    console.log(`PWA install prompt outcome: ${outcome}`);

    // Clean up
    setDeferredPrompt(null);
    setIsVisible(false);

    // Save dismissal status so we don't display it again
    localStorage.setItem("pwa-install-prompt-dismissed", "true");
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa-install-prompt-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && deferredPrompt && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="fixed top-4 left-4 right-4 z-[9999] mx-auto max-w-lg md:max-w-xl"
        >
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-white/20 dark:border-neutral-800/40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl shadow-2xl transition-all ring-1 ring-black/5 dark:ring-white/5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden shadow-md bg-white p-1 border border-neutral-100 dark:border-neutral-800">
                <Image
                  src="/icon-192.png"
                  alt="PhoneZlab App Icon"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                  Install PhoneZlab App {isSimulated && <span className="text-[10px] text-yellow-500 font-mono ml-1">(Demo)</span>}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  Add to home screen for absolute ease.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium text-xs shadow-md shadow-blue-500/10 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Download size={14} />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
                aria-label="Dismiss prompt"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
