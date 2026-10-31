import { memo, useEffect, useRef, useState } from "react";
import GlassDisc from "../components/GlassDisc";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const clock = (seconds) => {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const HIDE_CONTROLS_AFTER = 2500;
const SEEK_STEP = 5;

// Only one video plays at a time; starting one pauses the last.
let playingVideo = null;

const PlayIcon = ({ className }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
    <path d="M3.5 1.8v12.4c0 .6.7 1 1.2.7l9.6-6.2c.5-.3.5-1 0-1.3L4.7 1.1c-.5-.3-1.2.1-1.2.7Z" />
  </svg>
);

const PauseIcon = ({ className }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
    <rect x="3" y="1.5" width="3.5" height="13" rx="1" />
    <rect x="9.5" y="1.5" width="3.5" height="13" rx="1" />
  </svg>
);

const SoundIcon = ({ muted, className }) => (
  <svg viewBox="0 0 16 16" className={className}>
    <path fill="currentColor" d="M1.5 5.5h3L8.5 2v12l-4-3.5h-3z" />
    {muted ? (
      <path stroke="currentColor" strokeWidth="1.5" d="M1 15 15 1" />
    ) : (
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M11 5.2a4 4 0 0 1 0 5.6M13 3.2a7 7 0 0 1 0 9.6"
      />
    )}
  </svg>
);

/**
 * A portrait video with the site's own controls. Nothing downloads until the
 * visitor presses play; until then only the lazy-loaded poster shows.
 */
const VideoPlayer = memo(function VideoPlayer({
  title,
  src,
  poster,
  duration,
  className = "",
}) {
  const videoRef = useRef(null);
  const railRef = useRef(null);
  const fillRef = useRef(null);
  const knobRef = useRef(null);
  const timeRef = useRef(null);
  const sliderRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [idle, setIdle] = useState(false);
  const idleTimer = useRef(0);

  const total = () => videoRef.current.duration || duration;

  // Progress is written straight to the DOM every frame, so playback never re-renders React.
  const paint = (time = videoRef.current.currentTime) => {
    const progress = clamp(time / total(), 0, 1) || 0;
    fillRef.current.style.transform = `scaleX(${progress})`;
    knobRef.current.style.left = `${progress * 100}%`;
    // These change once a second, so they skip the layout work on the other frames.
    const label = `${clock(time)} of ${clock(total())}`;
    if (timeRef.current.textContent !== label) {
      timeRef.current.textContent = label;
      sliderRef.current.setAttribute("aria-valuenow", Math.floor(time));
      sliderRef.current.setAttribute("aria-valuetext", label);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    let frame = 0;
    const loop = () => {
      paint();
      frame = requestAnimationFrame(loop);
    };

    const onPlay = () => {
      if (playingVideo && playingVideo !== video) playingVideo.pause();
      playingVideo = video;
      setStarted(true);
      setPlaying(true);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(loop);
    };
    const onPause = () => {
      setPlaying(false);
      cancelAnimationFrame(frame);
      paint();
    };
    // Back to the poster, ready to play again from the start.
    const onEnded = () => {
      video.currentTime = 0;
      setStarted(false);
      paint(0);
    };
    const onSeeked = () => paint();
    const onVolume = () => setMuted(video.muted);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("loadedmetadata", onSeeked);
    video.addEventListener("volumechange", onVolume);

    // Scrolling away pauses the video rather than leaving it talking off screen.
    const observer = new IntersectionObserver(
      ([entry]) => !entry.isIntersecting && video.pause(),
      { threshold: 0.2 },
    );
    observer.observe(video);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadedmetadata", onSeeked);
      video.removeEventListener("volumechange", onVolume);
      if (playingVideo === video) playingVideo = null;
    };
    // paint only reads refs, so the listeners never need rebinding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While playing, the controls fade out after a moment without interaction.
  useEffect(() => {
    clearTimeout(idleTimer.current);
    if (playing && !idle) {
      idleTimer.current = setTimeout(() => setIdle(true), HIDE_CONTROLS_AFTER);
    }
    return () => clearTimeout(idleTimer.current);
  }, [playing, idle]);

  // Any interaction with visible controls keeps them up a little longer.
  const keepControls = () => {
    if (!playing || idle) return;
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), HIDE_CONTROLS_AFTER);
  };

  // A mouse moving over the video brings hidden controls back.
  const onPointerMove = (event) => {
    if (event.pointerType !== "mouse") return;
    if (idle) setIdle(false);
    else keepControls();
  };

  // The file is attached on first use: browsers can fetch a video that has a src even
  // with preload="none", so the page would otherwise download every video up front.
  const load = () => {
    const video = videoRef.current;
    if (!video.getAttribute("src")) video.src = src;
    return video;
  };

  const toggle = () => {
    const video = load();
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  // A tap on hidden controls only brings them back; the next tap plays or pauses.
  const onSurface = () => {
    if (playing && idle) setIdle(false);
    else toggle();
  };

  const seek = (time) => {
    const video = load();
    const target = clamp(time, 0, total());
    video.currentTime = target;
    paint(target);
    if (!started) video.play().catch(() => {});
  };

  const seekToPointer = (clientX) => {
    // Measured on the knob's rail, so the knob stays under the pointer while dragging.
    const { left, width } = railRef.current.getBoundingClientRect();
    seek(((clientX - left) / width) * total());
  };

  const onTrackDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    seekToPointer(event.clientX);
  };

  const onTrackMove = (event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      seekToPointer(event.clientX);
    }
  };

  const onTrackKey = (event) => {
    const step = { ArrowRight: SEEK_STEP, ArrowLeft: -SEEK_STEP }[event.key];
    if (!step) return;
    event.preventDefault();
    seek(videoRef.current.currentTime + step);
  };

  const controlsHidden = playing && idle;

  return (
    <div
      onPointerMove={onPointerMove}
      onPointerDown={keepControls}
      className={`relative overflow-hidden bg-black select-none ${controlsHidden ? "cursor-none" : ""} ${className}`}
    >
      <video
        ref={videoRef}
        preload="none"
        playsInline
        onClick={onSurface}
        className="absolute inset-0 size-full object-cover"
      />
      {!started && (
        <img
          loading="lazy"
          src={poster}
          alt=""
          onClick={onSurface}
          className="absolute inset-0 size-full object-cover"
        />
      )}

      {/* The title shows before playback only; the video opens with its own question on screen. */}
      {!started && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-linear-to-b from-black/70 to-transparent" />
          <p className="pointer-events-none absolute top-12 left-8 font-['Geist'] text-12 leading-none font-medium tracking-[-0.02em] text-white">
            {title}
          </p>
        </>
      )}

      {!playing && (
        <button
          type="button"
          onClick={toggle}
          aria-label={`Play: ${title}`}
          className="absolute top-1/2 left-1/2 -translate-1/2 rounded-full"
        >
          <GlassDisc className="size-56">
            <span className="relative flex size-28 items-center justify-center rounded-full bg-white text-black">
              <PlayIcon className="ml-2 w-12" />
            </span>
          </GlassDisc>
        </button>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 to-transparent px-8 pt-40 pb-4 text-white transition-opacity duration-300 ${controlsHidden ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        <div
          ref={sliderRef}
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={0}
          onPointerDown={onTrackDown}
          onPointerMove={onTrackMove}
          onKeyDown={onTrackKey}
          className="relative flex h-20 cursor-pointer touch-none items-center"
        >
          <div className="h-6 w-full rounded-full bg-white/40" />
          <div
            ref={fillRef}
            // A transform, not Tailwind's scale-x (the scale property), which would multiply
            // with the transform paint() writes and pin the fill at zero.
            className="absolute inset-x-0 h-6 origin-left transform-[scaleX(0)] rounded-full bg-white"
          />
          {/* The knob's centre travels a rail inset by its radius, so it never overhangs the track's ends. */}
          <div
            ref={railRef}
            className="pointer-events-none absolute inset-x-10 inset-y-0 flex items-center"
          >
            {/* A white dot in a ring of the same glass as the play button. */}
            <div ref={knobRef} className="absolute left-0 -translate-x-1/2">
              <GlassDisc className="size-20">
                <span className="relative size-15 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)]" />
              </GlassDisc>
            </div>
          </div>
        </div>

        {/* The play and mute icons sit flush with the ends of the track. */}
        <div className="mt-6 flex h-24 items-center">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className="flex h-full items-center"
          >
            {playing ? (
              <PauseIcon className="w-17" />
            ) : (
              <PlayIcon className="w-17" />
            )}
          </button>
          <span className="mx-8 h-16 w-2 rounded-full bg-white/25" />
          <span
            ref={timeRef}
            className="font-['Geist-Mono'] text-11 leading-none tracking-[0.04em]"
          >
            {`0:00 of ${clock(duration)}`}
          </span>
          <button
            type="button"
            onClick={() => (videoRef.current.muted = !muted)}
            aria-label={muted ? "Unmute" : "Mute"}
            className="ml-auto flex h-full items-center"
          >
            <SoundIcon muted={muted} className="w-15" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer;
