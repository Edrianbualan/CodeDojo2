"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";

type InstallPrompt = Event & {
  prompt(): Promise<unknown>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const displayMode = "(display-mode: standalone)";
const subscribeDisplayMode = (listener: () => void) => {
  const query = matchMedia(displayMode);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};
const isStandalone = () =>
  matchMedia(displayMode).matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;
const serverStandalone = () => false;

const subscribeConnection = (listener: () => void) => {
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  return () => {
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
  };
};
const isOnline = () => navigator.onLine;

const InstallContext = createContext<() => void>(() => {});

const destinations = [
  { href: "/", label: "Home", icon: "⌂", routes: /^\/$/ },
  { href: "/learn", label: "Learn", icon: "▤", routes: /^\/learn(\/|$)/ },
  {
    href: "/practice/setup",
    label: "Practice",
    icon: "▦",
    routes: /^\/practice(\/|$)/,
  },
  {
    href: "/dojolab",
    label: "DojoLab",
    icon: ">_",
    routes: /^\/dojolab(\/|$)/,
  },
  {
    href: "/dashboard",
    label: "Account",
    icon: "◉",
    routes:
      /^\/(dashboard|login|register|onboarding|profile|settings|reset-password|forgot-password)(\/|$)/,
  },
];

function NavigationIcon({ icon }: { icon: string }) {
  const { pending } = useLinkStatus();
  return (
    <span aria-hidden="true" className={pending ? "app-loading" : undefined}>
      {pending ? "■" : icon}
    </span>
  );
}

function MobileNavigation() {
  const pathname = usePathname();
  return (
    <nav className="app-mobile-nav" aria-label="Mobile navigation">
      {destinations.map(({ href, icon, label, routes }) => (
        <Link
          key={href}
          href={href}
          aria-current={routes.test(pathname) ? "page" : undefined}
        >
          <NavigationIcon icon={icon} />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function InstallAppButton({ className }: { className?: string }) {
  const install = useContext(InstallContext);
  const standalone = useSyncExternalStore(
    subscribeDisplayMode,
    isStandalone,
    serverStandalone,
  );
  if (standalone) return null;
  return (
    <button
      type="button"
      className={`app-install-button ${className ?? ""}`}
      onClick={install}
    >
      Install App
    </button>
  );
}

export function AppExperience({ children }: { children: React.ReactNode }) {
  const pendingPrompt = useRef<InstallPrompt>(null);
  const instructions = useRef<HTMLDialogElement>(null);
  const online = useSyncExternalStore(
    subscribeConnection,
    isOnline,
    () => true,
  );

  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault();
      pendingPrompt.current = event as InstallPrompt;
    };
    const installed = () => {
      pendingPrompt.current = null;
      instructions.current?.close();
    };
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installed);

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      void navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch((error: unknown) =>
          console.warn("CodeDojo offline setup is unavailable.", error),
        );
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  function showInstructions() {
    const ios =
      /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
      (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    const dialog = instructions.current;
    if (dialog && !dialog.open) {
      dialog.dataset.device = ios
        ? "ios"
        : /Android/i.test(navigator.userAgent)
          ? "android"
          : "desktop";
      dialog.showModal();
    }
  }

  function install() {
    const prompt = pendingPrompt.current;
    if (!prompt) {
      showInstructions();
      return;
    }
    pendingPrompt.current = null;
    void (async () => {
      try {
        await prompt.prompt();
        await prompt.userChoice;
      } catch {
        showInstructions();
      }
    })();
  }

  return (
    <InstallContext.Provider value={install}>
      {!online && (
        <div className="app-offline-banner" role="status">
          You’re offline. <a href="/offline">Open Offline Academy</a>
        </div>
      )}
      {children}
      <MobileNavigation />
      <dialog
        ref={instructions}
        className="app-install-dialog"
        aria-labelledby="app-install-title"
      >
        <h2 id="app-install-title">Install CodeDojo</h2>
        <ol data-platform="ios">
          <li>Open this page in Safari.</li>
          <li>
            Tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>
            .
          </li>
          <li>
            Enable <strong>Open as Web App</strong> if shown, then tap{" "}
            <strong>Add</strong>.
          </li>
        </ol>
        <ol data-platform="android">
          <li>Open this page in Chrome.</li>
          <li>
            Open the browser menu and choose <strong>Install app</strong> or{" "}
            <strong>Add to Home screen</strong>.
          </li>
          <li>Confirm and launch CodeDojo from your home screen.</li>
        </ol>
        <ol data-platform="desktop">
          <li>
            In Chrome or Edge, open the install icon in the address bar or look
            for Install in the browser menu.
          </li>
          <li>
            In Safari on Mac, choose <strong>File</strong>, then{" "}
            <strong>Add to Dock</strong> if available.
          </li>
          <li>
            Open CodeDojo from your device’s apps when installation finishes.
          </li>
        </ol>
        <form method="dialog">
          <button type="submit" className="button outline">
            Close
          </button>
        </form>
      </dialog>
    </InstallContext.Provider>
  );
}
