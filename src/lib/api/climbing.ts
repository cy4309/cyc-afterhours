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
    error?: string;
  };

  if (!response.ok || !payload.uploadUrl || !payload.videoKey || !payload.headers) {
    throw new Error(payload.error || "Upload authorization failed.");
  }

  return {
    videoKey: payload.videoKey,
    uploadUrl: payload.uploadUrl,
    method: payload.method ?? "PUT",
    headers: payload.headers,
  };
}

export async function saveClimb(input: {
  grade: string;
  date: string;
  gym: string;
  location?: string;
  attempts?: number;
  videoKey: string;
  duration?: number;
}) {
  const response = await fetch("/api/climbs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "Unable to save climb.");
  }
}

export function putFileWithProgress(
  url: string,
  file: File,
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

export function readVideoDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(objectUrl);
      resolve(Number.isFinite(duration) ? duration : undefined);
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(undefined);
    };
    video.src = objectUrl;
  });
}
