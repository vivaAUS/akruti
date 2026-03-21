"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  function togglePlay() {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  }

  return (
    <header className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden pt-24">

      <div className="relative z-10 text-center max-w-4xl px-6 flex flex-col items-center">
        {/* Tagline with decorative lines */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-16 h-px bg-akruti-border/60" />
          <span className="text-[0.6875rem] tracking-[0.25em] uppercase text-akruti-muted font-medium font-body">
            Atelier of Precision
          </span>
          <div className="w-16 h-px bg-akruti-border/60" />
        </div>

        {/* Brand headline */}
        <h1 className="font-headline text-7xl md:text-[8rem] leading-[0.9] tracking-tighter mb-10 text-akruti-dark select-none">
          AKRUTI
        </h1>

        {/* Video player */}
        <div
          onClick={togglePlay}
          className="relative w-full max-w-lg mx-auto aspect-video mb-12 bg-white group cursor-pointer overflow-hidden"
          role="button"
          aria-label={playing ? "Pause" : "Play"}
        >
          <video
            ref={videoRef}
            src="/hero2.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Play/pause overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            }`}
            style={{ background: "rgba(28,27,27,0.25)" }}
          >
            <div
              className="w-16 h-16 flex items-center justify-center"
              style={{ background: "rgba(252,248,248,0.15)", backdropFilter: "blur(6px)" }}
            >
              {playing ? (
                <Pause className="w-7 h-7 text-white" />
              ) : (
                <Play className="w-7 h-7 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[0.625rem] tracking-[0.3em] uppercase text-akruti-dark/40 font-body">
            Scroll to Explore
          </span>
          <div
            className="w-px h-16"
            style={{ background: "linear-gradient(to bottom, #7b580b, transparent)" }}
          />
        </div>
      </div>
    </header>
  );
}
