"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/climbing/Wordmark";

function HoldMark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/hold-2-illus.png"
      alt=""
      width={28}
      height={28}
      className="size-7 origin-center animate-breathe drop-shadow-md transition-transform duration-fast ease-micro group-hover:scale-125 group-hover:animate-none group-active:scale-90 motion-reduce:animate-none motion-reduce:transform-none motion-reduce:transition-none"
    />
  );
}

export function SiteChrome() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pathWhenOpened, setPathWhenOpened] = useState(pathname);
  if (pathname !== pathWhenOpened) {
    setPathWhenOpened(pathname);
    setOpen(false);
  }

  const home = pathname === "/";

  return (
    <header
      className={`flex w-full items-start justify-between px-4 py-4 ${
        home
          ? "absolute inset-x-0 top-0 z-20"
          : "relative mx-auto max-w-[720px]"
      }`}
    >
      <Link href="/" data-site-wordmark>
        <Wordmark />
      </Link>

      <div className="flex flex-col items-end justify-center gap-2">
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="group cursor-pointer p-2"
          onClick={() => setOpen((current) => !current)}
        >
          <HoldMark />
        </button>

        {open ? (
          <>
            <Link
              href="/archive"
              className="bg-white p-2 text-kicker uppercase tracking-kicker text-mute hover:text-ink"
            >
              Archive
            </Link>
            <Link
              href="/upload"
              className="bg-white p-2 text-kicker uppercase tracking-kicker text-mute hover:text-ink"
            >
              Upload
            </Link>
          </>
        ) : null}
      </div>
    </header>
  );
}
