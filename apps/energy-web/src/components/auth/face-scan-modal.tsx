'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

type FaceScanModalProps = {
  open: boolean;
  durationMs?: number;
  onComplete: () => void;
  onClose: () => void;
};

export function FaceScanModal({
  open,
  durationMs = 3000,
  onComplete,
  onClose,
}: FaceScanModalProps) {
  const t = useTranslations('FaceScan');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [timeLeft, setTimeLeft] = useState(Math.ceil(durationMs / 1000));
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  useEffect(() => {
    if (!open) {
      setTimeLeft(Math.ceil(durationMs / 1000));
      setCameraError(null);
      setCompleted(false);
      stopStream();
      return;
    }

    let intervalId: number | null = null;
    let timeoutId: number | null = null;
    let mounted = true;

    const start = async () => {
      try {
        setCameraError(null);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch {
        if (!mounted) return;
        setCameraError(t('cameraUnavailable'));
      }

      intervalId = window.setInterval(() => {
        setTimeLeft((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);

      timeoutId = window.setTimeout(() => {
        setCompleted(true);
        stopStream();
        onComplete();
      }, durationMs);
    };

    void start();

    return () => {
      mounted = false;
      if (intervalId) window.clearInterval(intervalId);
      if (timeoutId) window.clearTimeout(timeoutId);
      stopStream();
    };
  }, [open, durationMs, onComplete, t]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div className="w-full max-w-xl rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
        <div className="text-lg font-semibold text-[var(--foreground)]">
          {t('title')}
        </div>
        <div className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {t('description')}
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-[var(--border)] bg-zinc-950">
          <div className="relative aspect-[4/3] w-full">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />

            <div className="pointer-events-none absolute inset-0 bg-black/20" />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-[78%] w-[52%] rounded-[999px] border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.28)]">
                <div className="absolute inset-x-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-emerald-300/80 shadow-[0_0_18px_rgba(110,231,183,0.95)]" />
              </div>
            </div>

            <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white">
              {completed
                ? t('scanComplete')
                : t('scanning', { seconds: timeLeft })}
            </div>
          </div>
        </div>

        {cameraError ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            {cameraError}
          </div>
        ) : null}

        <div className="mt-4 text-sm text-[var(--muted-foreground)]">
          {t('mockNotice')}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--muted)]/40"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}