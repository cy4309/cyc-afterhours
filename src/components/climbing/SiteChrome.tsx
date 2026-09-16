import Link from "next/link";

export function SiteChrome() {
  return (
    <header className="flex items-baseline justify-between gap-6">
      <Link href="/" className="text-sm uppercase tracking-[0.28em]">
        cyc-afterhours
      </Link>
      <Link href="/upload" className="text-xs uppercase tracking-[0.22em] text-neutral-400 hover:text-black">
        Upload
      </Link>
    </header>
  );
}
