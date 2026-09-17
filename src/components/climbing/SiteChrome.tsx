import Link from "next/link";
import packageJson from "../../../package.json";

type SiteChromeProps = {
  isAdmin: boolean;
};

export function SiteChrome({ isAdmin }: SiteChromeProps) {
  return (
    <header className="flex items-baseline justify-between px-4 py-4">
      <div className="flex items-baseline gap-2">
        <Link href="/" className="text-[11px] uppercase tracking-[0.32em]">
          cyc-afterhours
        </Link>
        <span className="text-[10px] tracking-[0.18em] text-[var(--mute)]">{packageJson.version}</span>
      </div>
      {isAdmin ? (
        <Link
          href="/upload"
          className="text-[11px] uppercase tracking-[0.28em] text-[var(--mute)] hover:text-[var(--ink)]"
        >
          Upload
        </Link>
      ) : (
        <span />
      )}
    </header>
  );
}
