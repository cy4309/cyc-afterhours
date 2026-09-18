"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/climbing/Wordmark";
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
    <header className="flex items-center justify-between px-4 py-4">
      <Link href="/" data-site-wordmark>
        <Wordmark />
      </Link>

      {isAdmin ? (
        <div className="flex items-center gap-6">
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
            className="group cursor-pointer"
            onClick={toggle}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hold-2.png"
              alt=""
              width={18}
              height={18}
              className="size-[18px] origin-center transition-transform duration-fast ease-micro group-hover:scale-110 group-active:scale-125 motion-reduce:transform-none motion-reduce:transition-none"
            />
          </button>
        </div>
      ) : (
        <span />
      )}
    </header>
  );
}
