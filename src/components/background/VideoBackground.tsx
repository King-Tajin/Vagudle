import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  src: string;
  posterSrc?: string;
  audioEnabled: boolean;
  objectPosition?: string;
  label?: string;
};

type LoadingOverlayProps = {
  posterSrc?: string;
  objectPosition: string;
  label: string;
  progress: number;
  indeterminate: boolean;
};

const LoadingOverlay = ({
  posterSrc,
  objectPosition,
  label,
  progress,
  indeterminate,
}: LoadingOverlayProps) => (
  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
    {posterSrc && (
      <img
        src={posterSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        style={{ objectPosition }}
      />
    )}
    <div className="relative flex flex-col items-center gap-4">
      <p className="font-pixel text-crown-gold tracking-widest text-lg">
        {label}
      </p>
      <div className="w-48 h-3 border-2 border-obsidian-600 bg-obsidian-800 overflow-hidden">
        <div
          className={
            indeterminate
              ? "h-full bg-crown-gold animate-pulse w-full"
              : "h-full bg-crown-gold transition-all duration-150"
          }
          style={indeterminate ? undefined : { width: `${progress}%` }}
        />
      </div>
      <p className="font-pixel text-obsidian-500 text-sm tracking-widest">
        {indeterminate ? "LOADING..." : `${progress}%`}
      </p>
    </div>
  </div>
);

export const VideoBackground = ({
  src,
  posterSrc,
  audioEnabled,
  objectPosition = "50% 50%",
  label = "LOADING BACKGROUND",
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [indeterminate, setIndeterminate] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let createdUrl: string | null = null;

    setObjectUrl(null);
    setProgress(0);
    setIndeterminate(false);
    setHasError(false);

    const load = async () => {
      try {
        const response = await fetch(src);
        if (!response.ok || !response.body) {
          if (!cancelled) setHasError(true);
          return;
        }

        const totalHeader = response.headers.get("content-length");
        const total = totalHeader ? parseInt(totalHeader, 10) : 0;
        if (!total) setIndeterminate(true);

        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (cancelled) return;
          if (done) break;
          if (value) {
            chunks.push(value);
            received += value.length;
            if (total)
              setProgress(Math.min(99, Math.round((received / total) * 100)));
          }
        }

        const blob = new Blob(chunks, {
          type: response.headers.get("content-type") || "video/mp4",
        });
        createdUrl = URL.createObjectURL(blob);

        if (cancelled) {
          URL.revokeObjectURL(createdUrl);
          return;
        }
        setProgress(100);
        setObjectUrl(createdUrl);
      } catch {
        if (!cancelled) setHasError(true);
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !objectUrl) return;

    const unlockAudio = () => {
      if (!audioEnabled) return;
      video.muted = false;
      video.play().catch(() => {});
    };

    if (audioEnabled) {
      video.muted = false;
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    } else {
      video.muted = true;
      video.play().catch(() => {});
    }

    document.addEventListener("pointerdown", unlockAudio);
    document.addEventListener("keydown", unlockAudio);
    document.addEventListener("touchstart", unlockAudio);

    const onVisibilityChange = () => {
      if (document.hidden) video.pause();
      else video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("pointerdown", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [audioEnabled, objectUrl]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ background: "#0d1322", zIndex: 0 }}
    >
      {objectUrl && (
        <video
          ref={videoRef}
          src={objectUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ objectPosition }}
        />
      )}
      {!objectUrl &&
        !hasError &&
        createPortal(
          <div
            className="fixed inset-0 pointer-events-none"
            style={{ background: "#0d1322", zIndex: 30 }}
          >
            <LoadingOverlay
              posterSrc={posterSrc}
              objectPosition={objectPosition}
              label={label}
              progress={progress}
              indeterminate={indeterminate}
            />
          </div>,
          document.body
        )}
    </div>
  );
};
