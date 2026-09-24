"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent,
  type PointerEvent,
} from "react";

export function useInteractiveAutoplayVideo(volume = 0.3) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasRestartedRef = useRef(false);
  const hasHoverAttemptedRef = useRef(false);
  const hasSoundRef = useRef(false);
  const suppressNextClickRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.volume = volume;
    video.muted = true;
    void video.play().catch(() => undefined);
  }, [volume]);

  const enableSound = useCallback(
    (restart: boolean) => {
      const video = videoRef.current;

      if (!video || hasSoundRef.current) {
        return;
      }

      if (restart && !hasRestartedRef.current) {
        video.currentTime = 0;
        hasRestartedRef.current = true;
      }

      video.volume = volume;
      video.muted = false;

      void video
        .play()
        .then(() => {
          hasSoundRef.current = true;
        })
        .catch(() => {
          video.muted = true;
          void video.play().catch(() => undefined);
        });
    },
    [volume],
  );

  const handlePointerEnter = useCallback(
    (event: PointerEvent<HTMLVideoElement>) => {
      if (
        hasHoverAttemptedRef.current ||
        (event.pointerType !== "mouse" && event.pointerType !== "pen")
      ) {
        return;
      }

      hasHoverAttemptedRef.current = true;
      enableSound(true);
    },
    [enableSound],
  );

  const handlePointerDown = useCallback((event: PointerEvent<HTMLVideoElement>) => {
    if (hasSoundRef.current) {
      return;
    }

    suppressNextClickRef.current = true;
    event.preventDefault();
    enableSound(!hasRestartedRef.current);
  }, [enableSound]);

  const handleClick = useCallback((event: MouseEvent<HTMLVideoElement>) => {
    if (!suppressNextClickRef.current) {
      return;
    }

    suppressNextClickRef.current = false;
    event.preventDefault();

    requestAnimationFrame(() => {
      const video = videoRef.current;

      if (video) {
        void video.play().catch(() => undefined);
      }
    });
  }, []);

  const handlePointerCancel = useCallback(() => {
    suppressNextClickRef.current = false;
  }, []);

  return {
    videoRef,
    videoInteractionProps: {
      onPointerEnter: handlePointerEnter,
      onPointerDown: handlePointerDown,
      onPointerCancel: handlePointerCancel,
      onClick: handleClick,
    },
  };
}
