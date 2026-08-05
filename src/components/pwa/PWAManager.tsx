import React from "react";
import { Download, RefreshCw, Share, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setupPWA } from "@/pwa/registerSW";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

const PWAManager: React.FC = () => {
  const [updateReady, setUpdateReady] = React.useState(false);
  const applyUpdate = React.useRef<null | (() => void)>(null);
  const [installEvent, setInstallEvent] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = React.useState(false);
  const [dismissedInstall, setDismissedInstall] = React.useState(false);
  const [installed, setInstalled] = React.useState(() => isStandalone());

  React.useEffect(() => {
    let cancelled = false;
    setupPWA(() => setUpdateReady(true)).then((update) => {
      if (!cancelled) applyUpdate.current = update;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const showIOSBanner =
    !installed && !dismissedInstall && isIOS() && !installEvent && import.meta.env.PROD;
  const showAndroidBanner = !installed && !dismissedInstall && !!installEvent;

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  return (
    <>
      {updateReady && (
        <div className="fixed inset-x-3 bottom-3 z-[60] safe-area-bottom">
          <div className="card-soft mx-auto flex max-w-md items-center gap-3 border border-border p-3 shadow-card">
            <RefreshCw className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-headline">Update available</p>
              <p className="text-caption">A newer version of Gutly is ready.</p>
            </div>
            <Button size="sm" className="h-9 min-h-0" onClick={() => applyUpdate.current?.()}>
              Reload
            </Button>
          </div>
        </div>
      )}

      {(showAndroidBanner || showIOSBanner) && !updateReady && (
        <div className="fixed inset-x-3 bottom-3 z-[55] safe-area-bottom">
          <div className="card-soft mx-auto flex max-w-md items-center gap-3 border border-border p-3 shadow-card">
            <img
              src="/pwa-192x192.png"
              alt=""
              width={36}
              height={36}
              loading="lazy"
              className="h-9 w-9 rounded-lg"
            />
            <div className="min-w-0 flex-1">
              <p className="text-headline">Install Gutly</p>
              <p className="text-caption truncate">Add it to your home screen.</p>
            </div>
            {showAndroidBanner ? (
              <Button size="sm" className="h-9 min-h-0 gap-1" onClick={handleInstall}>
                <Download className="h-4 w-4" /> Install
              </Button>
            ) : (
              <Button size="sm" className="h-9 min-h-0" onClick={() => setShowIOSGuide(true)}>
                How
              </Button>
            )}
            <button
              type="button"
              aria-label="Dismiss install prompt"
              className="min-h-0 min-w-0 rounded-full p-1 text-muted-foreground"
              onClick={() => setDismissedInstall(true)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Dialog open={showIOSGuide} onOpenChange={setShowIOSGuide}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Gutly to your Home Screen</DialogTitle>
            <DialogDescription>Works in Safari on iPhone and iPad.</DialogDescription>
          </DialogHeader>
          <ol className="space-y-3 text-subhead">
            <li className="flex items-center gap-3">
              <Share className="h-5 w-5 text-primary" aria-hidden />
              <span>1. Tap the Share button in Safari's toolbar.</span>
            </li>
            <li className="flex items-center gap-3">
              <Plus className="h-5 w-5 text-primary" aria-hidden />
              <span>2. Choose “Add to Home Screen”.</span>
            </li>
            <li className="flex items-center gap-3">
              <Download className="h-5 w-5 text-primary" aria-hidden />
              <span>3. Tap “Add” — Gutly opens full screen, no address bar.</span>
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PWAManager;