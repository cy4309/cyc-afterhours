type WordmarkProps = {
  className?: string;
};

export function Wordmark({ className }: WordmarkProps) {
  return (
    <span
      className={["inline-flex items-center gap-1.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/cyc-logo.png"
        alt=""
        width={14}
        height={14}
        className="size-3.5 shrink-0"
      />
      <span className="text-kicker uppercase tracking-mark">cyc-afterhours</span>
    </span>
  );
}
