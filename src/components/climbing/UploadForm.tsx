"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { authorizeUpload, inspectVideoFile, putFileWithProgress, saveClimb } from "@/lib/api/climbing";
import { useSharedMedia } from "@/components/climbing/SharedMedia";
import { motionMs } from "@/lib/motion";
import { FILTER_GRADES, type ClimbGrade } from "@/lib/types/climbing";

type UploadStatus = "idle" | "authorizing" | "uploading" | "saving" | "success" | "error";

function fileContentType(file: File): string {
  if (file.type) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".mov")) return "video/quicktime";
  if (name.endsWith(".webm")) return "video/webm";
  if (name.endsWith(".m4v")) return "video/x-m4v";
  return "video/mp4";
}

function parseAttempts(value: string): number | undefined {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return undefined;
  return Math.round(parsed);
}

export function UploadForm() {
  const { enterFromUpload } = useSharedMedia();
  const abortRef = useRef<AbortController | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [grade, setGrade] = useState<ClimbGrade>("V3");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [gym, setGym] = useState("");
  const [location, setLocation] = useState("");
  const [attempts, setAttempts] = useState("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  const busy = status === "authorizing" || status === "uploading" || status === "saving";
  const statusLabel = useMemo(() => {
    switch (status) {
      case "authorizing":
        return "Authorizing upload";
      case "uploading":
        return `Uploading ${progress}%`;
      case "saving":
        return "Saving record";
      case "success":
        return "Uploaded";
      case "error":
        return error ?? "Upload failed";
      default:
        return file ? file.name : "Select a video";
    }
  }, [error, file, progress, status]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setStatus("error");
      setError("Select a video.");
      return;
    }
    if (!gym.trim()) {
      setStatus("error");
      setError("Gym is required.");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);

    try {
      let key = videoKey;
      const { duration, poster } = await inspectVideoFile(file);
      const contentType = fileContentType(file);
      let posterKey: string | undefined;

      if (!key) {
        setStatus("authorizing");
        const authorization = await authorizeUpload({
          fileName: file.name,
          contentType,
          grade,
          date,
        });
        setStatus("uploading");
        setProgress(0);
        await putFileWithProgress(
          authorization.uploadUrl,
          file,
          authorization.headers,
          setProgress,
          controller.signal,
        );
        key = authorization.videoKey;
        setVideoKey(key);

        if (poster) {
          await putFileWithProgress(
            authorization.posterUploadUrl,
            poster,
            authorization.posterHeaders,
            () => undefined,
            controller.signal,
          );
          posterKey = authorization.posterKey;
        }
      }

      setStatus("saving");
      const climb = await saveClimb({
        grade,
        date,
        gym: gym.trim(),
        location: location.trim() || undefined,
        attempts: parseAttempts(attempts),
        videoKey: key,
        posterKey,
        duration,
      });

      const localPoster = poster ? URL.createObjectURL(poster) : climb.posterUrl;
      setPosterPreview(localPoster ?? null);
      setSavedId(climb.id);
      setStatus("success");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        setStatus("idle");
        setError(null);
        return;
      }
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      abortRef.current = null;
    }
  }

  function onCancel() {
    abortRef.current?.abort();
    setStatus("idle");
    setProgress(0);
  }

  useLayoutEffect(() => {
    if (status !== "success" || !savedId) return;

    const start = () => {
      const node = previewRef.current;
      if (!node) return;
      enterFromUpload({
        id: savedId,
        posterUrl: posterPreview ?? undefined,
        from: node.getBoundingClientRect(),
      });
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      start();
      return;
    }

    const timer = window.setTimeout(start, motionMs.fast);
    return () => window.clearTimeout(timer);
  }, [enterFromUpload, posterPreview, savedId, status]);

  if (status === "success") {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <div
          ref={previewRef}
          className="aspect-video overflow-hidden bg-[var(--paper)]"
        >
          {posterPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={posterPreview} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--mute)]">Uploaded</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-8">
      <label className="block space-y-2">
        <span className="text-[11px] uppercase tracking-[0.28em]">Video</span>
        <input
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
          disabled={busy}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setVideoKey(null);
            setProgress(0);
            setStatus("idle");
            setError(null);
          }}
          className="block w-full text-sm file:mr-4 file:border-0 file:bg-[var(--ink)] file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.18em] file:text-[var(--paper)]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-[11px] uppercase tracking-[0.28em]">Grade</span>
        <select
          value={grade}
          disabled={busy}
          onChange={(event) => setGrade(event.target.value as ClimbGrade)}
          className="w-full border-b border-black bg-transparent py-2 text-sm outline-none"
        >
          {FILTER_GRADES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-[11px] uppercase tracking-[0.28em]">Date</span>
        <input
          type="date"
          value={date}
          disabled={busy}
          onChange={(event) => setDate(event.target.value)}
          className="w-full border-b border-black bg-transparent py-2 text-sm outline-none"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-[11px] uppercase tracking-[0.28em]">Gym</span>
        <input
          type="text"
          value={gym}
          disabled={busy}
          onChange={(event) => setGym(event.target.value)}
          className="w-full border-b border-black bg-transparent py-2 text-sm outline-none"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-[11px] uppercase tracking-[0.28em]">Location</span>
        <input
          type="text"
          value={location}
          disabled={busy}
          onChange={(event) => setLocation(event.target.value)}
          className="w-full border-b border-black bg-transparent py-2 text-sm outline-none"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-[11px] uppercase tracking-[0.28em]">Attempts</span>
        <input
          type="number"
          min={1}
          value={attempts}
          disabled={busy}
          onChange={(event) => setAttempts(event.target.value)}
          className="w-full border-b border-black bg-transparent py-2 text-sm outline-none"
        />
      </label>

      <div className="space-y-3">
        <div className="h-px w-full bg-black/10">
          <div className="h-px bg-[var(--ink)] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--mute)]">{statusLabel}</p>
      </div>

      <div className="flex items-center gap-6">
        {status === "error" ? (
          <button type="submit" className="text-[11px] uppercase tracking-[0.28em]">
            Retry
          </button>
        ) : (
          <button type="submit" disabled={busy} className="text-[11px] uppercase tracking-[0.28em] disabled:text-[var(--mute)]">
            Upload
          </button>
        )}

        {busy ? (
          <button type="button" onClick={onCancel} className="text-[11px] uppercase tracking-[0.28em] text-[var(--mute)]">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
