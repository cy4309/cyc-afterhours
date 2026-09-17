export async function authorizeUpload(input: {
  fileName: string;
  contentType: string;
  grade: string;
  date: string;
}) {
  const response = await fetch("/api/uploads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as {
    videoKey?: string;
    uploadUrl?: string;
    method?: "PUT";
    headers?: Record<string, string>;
    posterKey?: string;
    posterUploadUrl?: string;
    posterHeaders?: Record<string, string>;
    error?: string;
  };

  if (
    !response.ok ||
    !payload.uploadUrl ||
    !payload.videoKey ||
    !payload.headers ||
    !payload.posterKey ||
    !payload.posterUploadUrl ||
    !payload.posterHeaders
  ) {
    throw new Error(payload.error || "Upload authorization failed.");
  }

  return {
    videoKey: payload.videoKey,
    uploadUrl: payload.uploadUrl,
    method: payload.method ?? "PUT",
    headers: payload.headers,
    posterKey: payload.posterKey,
    posterUploadUrl: payload.posterUploadUrl,
    posterHeaders: payload.posterHeaders,
  };
}

export async function saveClimb(input: {
  grade: string;
  date: string;
  gym: string;
  location?: string;
  attempts?: number;
  videoKey: string;
  posterKey?: string;
  duration?: number;
}): Promise<{ id: string; posterUrl?: string }> {
  const response = await fetch("/api/climbs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as {
    climb?: { id: string; posterUrl?: string };
    error?: string;
  };

  if (!response.ok || !payload.climb?.id) {
    throw new Error(payload.error || "Unable to save climb.");
  }

  return payload.climb;
}

export async function deleteClimb(id: string): Promise<void> {
  const response = await fetch(`/api/climbs/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || "Unable to delete climb.");
  }
}

export function putFileWithProgress(
  url: string,
  file: Blob,
  headers: Record<string, string>,
  onProgress: (percent: number) => void,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    const abort = () => xhr.abort();
    signal.addEventListener("abort", abort);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      signal.removeEventListener("abort", abort);
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
        return;
      }
      reject(new Error(`Upload failed (${xhr.status}).`));
    };

    xhr.onerror = () => {
      signal.removeEventListener("abort", abort);
      reject(new Error("Network error during upload."));
    };

    xhr.onabort = () => {
      signal.removeEventListener("abort", abort);
      reject(new DOMException("Upload cancelled.", "AbortError"));
    };

    xhr.send(file);
  });
}

export function inspectVideoFile(file: File): Promise<{ duration?: number; poster?: Blob }> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    let finished = false;
    const finish = (result: { duration?: number; poster?: Blob }) => {
      if (finished) return;
      finished = true;
      URL.revokeObjectURL(objectUrl);
      resolve(result);
    };

    const capture = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const duration = Number.isFinite(video.duration) ? video.duration : undefined;
      if (!width || !height) {
        finish({ duration });
        return;
      }

      const scale = Math.min(1, 1280 / width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        finish({ duration });
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (poster) => finish({ duration, poster: poster ?? undefined }),
        "image/jpeg",
        0.82,
      );
    };

    video.onloadeddata = () => {
      const target = Math.min(0.12, Number.isFinite(video.duration) ? video.duration * 0.02 : 0.12);
      video.currentTime = target;
    };
    video.onseeked = () => capture();
    video.onerror = () => finish({});
    video.src = objectUrl;
  });
}
