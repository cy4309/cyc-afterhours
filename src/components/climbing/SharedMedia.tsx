"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { motion, motionEase } from "@/lib/motion";

export type MediaRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type PageDirection = "prev" | "next";

type SharedPhase = "idle" | "opening" | "closing" | "paging" | "entering";

type SharedMediaState = {
  phase: SharedPhase;
  id: string | null;
  posterUrl?: string;
  incomingPosterUrl?: string;
  direction?: PageDirection;
  from: MediaRect | null;
  to: MediaRect | null;
  returnHref: string;
  hasTarget: boolean;
};

type SharedMediaContextValue = {
  state: SharedMediaState;
  openFromArchive: (input: {
    id: string;
    href: string;
    posterUrl?: string;
    from: DOMRect;
    returnHref: string;
  }) => void;
  completeOpen: (id: string, to: DOMRect) => void;
  closeToArchive: (input: { id: string; posterUrl?: string; from: DOMRect }) => void;
  completeClose: (id: string, to: DOMRect | null) => void;
  pageToNeighbor: (input: {
    toId: string;
    href: string;
    direction: PageDirection;
    fromPoster?: string;
    toPoster?: string;
    from: DOMRect;
  }) => void;
  enterFromUpload: (input: { id: string; posterUrl?: string; from: DOMRect }) => void;
  completeEnter: (id: string, to: DOMRect | null) => void;
};

const EMPTY: SharedMediaState = {
  phase: "idle",
  id: null,
  from: null,
  to: null,
  returnHref: "/",
  hasTarget: false,
};

const SharedMediaContext = createContext<SharedMediaContextValue | null>(null);

function toRect(rect: DOMRect): MediaRect {
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function PosterPane({ src }: { src?: string }) {
  return (
    <div className="h-full w-1/2 shrink-0 bg-black">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-contain" />
      ) : (
        <div className="h-full w-full bg-[var(--paper)]" />
      )}
    </div>
  );
}

function SharedMediaOverlay({
  state,
  onComplete,
}: {
  state: SharedMediaState;
  onComplete: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const paging = state.phase === "paging";
  const outgoingFirst = state.direction !== "prev";

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const from = state.from;
    if (!overlay || !from) return;

    gsap.set(overlay, {
      left: from.left,
      top: from.top,
      width: from.width,
      height: from.height,
    });

    if (!state.hasTarget) return;

    if (paging) {
      const strip = stripRef.current;
      if (!strip) return;
      const tween = gsap.fromTo(
        strip,
        { xPercent: outgoingFirst ? 0 : -50 },
        {
          xPercent: outgoingFirst ? -50 : 0,
          duration: motion.scene,
          ease: motionEase.scene,
          onComplete,
        },
      );
      return () => {
        tween.kill();
      };
    }

    const to = state.to;
    if (!to) return;

    const tween = gsap.to(overlay, {
      left: to.left,
      top: to.top,
      width: to.width,
      height: to.height,
      duration: motion.scene,
      ease: motionEase.scene,
      overwrite: "auto",
      onComplete,
    });

    return () => {
      tween.kill();
    };
  }, [onComplete, outgoingFirst, paging, state.from, state.hasTarget, state.to]);

  if (!state.from) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden
      className={`pointer-events-none fixed z-50 overflow-hidden ${
        paging ? "bg-black" : "bg-[var(--paper)]"
      }`}
    >
      {paging ? (
        <div ref={stripRef} className="flex h-full w-[200%]">
          {outgoingFirst ? (
            <>
              <PosterPane src={state.posterUrl} />
              <PosterPane src={state.incomingPosterUrl} />
            </>
          ) : (
            <>
              <PosterPane src={state.incomingPosterUrl} />
              <PosterPane src={state.posterUrl} />
            </>
          )}
        </div>
      ) : state.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={state.posterUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-[var(--paper)]" />
      )}
    </div>
  );
}

export function SharedMediaProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<SharedMediaState>(EMPTY);
  const stateRef = useRef(state);
  stateRef.current = state;

  const commit = useCallback((next: SharedMediaState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const openFromArchive = useCallback(
    (input: {
      id: string;
      href: string;
      posterUrl?: string;
      from: DOMRect;
      returnHref: string;
    }) => {
      if (prefersReducedMotion()) {
        router.push(input.href);
        return;
      }

      commit({
        phase: "opening",
        id: input.id,
        posterUrl: input.posterUrl,
        from: toRect(input.from),
        to: null,
        returnHref: input.returnHref,
        hasTarget: false,
      });
      router.push(input.href);
    },
    [commit, router],
  );

  const completeOpen = useCallback((id: string, to: DOMRect) => {
    const current = stateRef.current;
    if (current.phase !== "opening" || current.id !== id || current.hasTarget) return;

    requestAnimationFrame(() => {
      const prev = stateRef.current;
      if (prev.phase !== "opening" || prev.id !== id) return;
      commit({ ...prev, to: toRect(to), hasTarget: true });
    });
  }, [commit]);

  const closeToArchive = useCallback(
    (input: { id: string; posterUrl?: string; from: DOMRect }) => {
      const returnHref = stateRef.current.returnHref || "/";
      if (prefersReducedMotion()) {
        router.push(returnHref);
        return;
      }

      commit({
        phase: "closing",
        id: input.id,
        posterUrl: input.posterUrl ?? stateRef.current.posterUrl,
        from: toRect(input.from),
        to: null,
        returnHref,
        hasTarget: false,
      });
      router.push(returnHref);
    },
    [commit, router],
  );

  const completeClose = useCallback((id: string, to: DOMRect | null) => {
    const current = stateRef.current;
    if (current.phase !== "closing" || current.id !== id || current.hasTarget) return;

    if (!to) {
      commit(EMPTY);
      return;
    }

    requestAnimationFrame(() => {
      const prev = stateRef.current;
      if (prev.phase !== "closing" || prev.id !== id) return;
      commit({ ...prev, to: toRect(to), hasTarget: true });
    });
  }, [commit]);

  const pageToNeighbor = useCallback(
    (input: {
      toId: string;
      href: string;
      direction: PageDirection;
      fromPoster?: string;
      toPoster?: string;
      from: DOMRect;
    }) => {
      if (stateRef.current.phase !== "idle") return;

      if (prefersReducedMotion()) {
        router.push(input.href);
        return;
      }

      commit({
        phase: "paging",
        id: input.toId,
        posterUrl: input.fromPoster,
        incomingPosterUrl: input.toPoster,
        direction: input.direction,
        from: toRect(input.from),
        to: null,
        returnHref: stateRef.current.returnHref || "/",
        hasTarget: false,
      });
      router.push(input.href);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const prev = stateRef.current;
          if (prev.phase !== "paging" || prev.id !== input.toId) return;
          commit({ ...prev, hasTarget: true });
        });
      });
    },
    [commit, router],
  );

  const enterFromUpload = useCallback(
    (input: { id: string; posterUrl?: string; from: DOMRect }) => {
      if (prefersReducedMotion()) {
        router.push("/");
        router.refresh();
        return;
      }

      if (stateRef.current.phase !== "idle") return;

      commit({
        phase: "entering",
        id: input.id,
        posterUrl: input.posterUrl,
        from: toRect(input.from),
        to: null,
        returnHref: "/",
        hasTarget: false,
      });
      router.push("/");
      router.refresh();

      window.setTimeout(() => {
        const current = stateRef.current;
        if (current.phase === "entering" && current.id === input.id && !current.hasTarget) {
          commit(EMPTY);
        }
      }, 2500);
    },
    [commit, router],
  );

  const completeEnter = useCallback(
    (id: string, to: DOMRect | null) => {
      const current = stateRef.current;
      if (current.phase !== "entering" || current.id !== id || current.hasTarget) return;
      if (!to) return;

      requestAnimationFrame(() => {
        const prev = stateRef.current;
        if (prev.phase !== "entering" || prev.id !== id) return;
        commit({ ...prev, to: toRect(to), hasTarget: true });
      });
    },
    [commit],
  );

  const finish = useCallback(() => {
    const current = stateRef.current;
    if (!current.hasTarget) return;
    commit(EMPTY);
  }, [commit]);

  const value = useMemo(
    () => ({
      state,
      openFromArchive,
      completeOpen,
      closeToArchive,
      completeClose,
      pageToNeighbor,
      enterFromUpload,
      completeEnter,
    }),
    [
      state,
      openFromArchive,
      completeOpen,
      closeToArchive,
      completeClose,
      pageToNeighbor,
      enterFromUpload,
      completeEnter,
    ],
  );

  return (
    <SharedMediaContext.Provider value={value}>
      {children}
      {state.phase !== "idle" ? <SharedMediaOverlay state={state} onComplete={finish} /> : null}
    </SharedMediaContext.Provider>
  );
}

export function useSharedMedia(): SharedMediaContextValue {
  const value = useContext(SharedMediaContext);
  if (!value) {
    throw new Error("useSharedMedia must be used within SharedMediaProvider.");
  }
  return value;
}
