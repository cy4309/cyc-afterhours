"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import packageJson from "../../../package.json";

const STORAGE_KEY = "cyc_admin_chrome";
const EVENT = "cyc-admin-chrome";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(EVENT, onStoreChange);
  return () => window.removeEventListener(EVENT, onStoreChange);
}

function getSnapshot() {
  return sessionStorage.getItem(STORAGE_KEY) === "1";
}

function getServerSnapshot() {
  return false;
}

type SiteChromeProps = {
  isAdmin: boolean;
};

export function SiteChrome({ isAdmin }: SiteChromeProps) {
  const open = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, open ? "0" : "1");
    window.dispatchEvent(new Event(EVENT));
  }, [open]);

  return (
    <header className="flex items-baseline justify-between px-4 py-4">
      <Link
        href="/"
        data-site-wordmark
        className="text-kicker uppercase tracking-mark"
      >
        cyc-afterhours
      </Link>

      {isAdmin ? (
        <div className="flex items-baseline gap-6">
          {open ? (
            <>
              <span className="text-caption tracking-caption text-mute">
                v{packageJson.version}
              </span>
              <Link
                href="/upload"
                className="text-kicker uppercase tracking-kicker text-mute hover:text-ink"
              >
                Upload
              </Link>
            </>
          ) : null}
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? "Hide studio tools" : "Show studio tools"}
            className="cursor-pointer text-kicker tracking-kicker text-mute hover:text-ink"
            onClick={toggle}
          >
            ···
          </button>
        </div>
      ) : (
        <span />
      )}
    </header>
  );
}
