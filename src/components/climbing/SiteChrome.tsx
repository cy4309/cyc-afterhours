import Link from "next/link";
import packageJson from "../../../package.json";

export function SiteChrome() {
  return (
    <header className="flex items-baseline justify-between px-4 py-3">
      <div className="flex items-baseline gap-2">
        <Link href="/" className="text-xs uppercase tracking-[0.28em]">
          cyc-afterhours
        </Link>
        <span className="text-[10px] tracking-[0.18em] text-neutral-400">{packageJson.version}</span>
      </div>
      <Link href="/upload" className="text-xs uppercase tracking-[0.22em] text-neutral-500 hover:text-black">
        Upload
      </Link>
    </header>
  );
}
