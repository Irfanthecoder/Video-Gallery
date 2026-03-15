/**
 * Client-side check that a File is a real video. Catches e.g. .txt renamed to .mp4.
 */
const VALIDATE_TIMEOUT_MS = 15_000;

export function validateVideoFile(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    const cleanup = () => {
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("error", onError);
      video.src = "";
      video.load();
      URL.revokeObjectURL(url);
      clearTimeout(timeoutId);
    };

    const onLoaded = () => {
      const valid = video.videoWidth > 0 && video.videoHeight > 0;
      cleanup();
      resolve(valid);
    };

    const onError = () => {
      cleanup();
      resolve(false);
    };

    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("error", onError);
    video.src = url;

    const timeoutId = setTimeout(() => {
      cleanup();
      resolve(false);
    }, VALIDATE_TIMEOUT_MS);
  });
}
