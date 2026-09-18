"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ScrollAreaProps = {
  children: ReactNode;
  className?: string;
};

export function ScrollArea({ children, className }: ScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ top: 0, height: 0, visible: false });

  const update = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const overflow = scrollHeight - clientHeight;
    if (overflow <= 0) {
      setThumb({ top: 0, height: 0, visible: false });
      return;
    }

    const height = Math.max(28, (clientHeight / scrollHeight) * clientHeight);
    const top = (scrollTop / overflow) * (clientHeight - height);
    setThumb({ top, height, visible: true });
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const frame = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [update]);

  return (
    <div className={["relative min-h-0", className].filter(Boolean).join(" ")}>
      <div
        ref={viewportRef}
        className="absolute inset-0 overflow-y-auto overscroll-contain"
      >
        {children}
      </div>
      {thumb.visible ? (
        <div
          className="pointer-events-none absolute right-1 top-0 h-full w-px"
          aria-hidden
        >
          <div
            className="absolute right-0 w-px bg-ink"
            style={{ top: thumb.top, height: thumb.height }}
          />
        </div>
      ) : null}
    </div>
  );
}
