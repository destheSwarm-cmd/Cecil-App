import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashProps {
  onFinish: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onFinish }) => {
  const [phase, setPhase] = useState<'filling' | 'logo' | 'complete'>('filling');

  useEffect(() => {
    // 0.8s: liquid filled -> show logo & typography
    const t1 = setTimeout(() => {
      setPhase('logo');
    }, 850);

    // 2.5s: transition to Home
    const t2 = setTimeout(() => {
      setPhase('complete');
      onFinish();
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A4A35] text-white select-none cursor-pointer overflow-hidden"
    >
      {/* Background Volumetric Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(29,158,117,0.35)_0%,rgba(10,74,53,1)_70%)] pointer-events-none" />

      {/* Floating Ambient Sparks / Particles */}
      <div className="absolute top-1/4 left-1/5 w-1.5 h-1.5 rounded-full bg-[#EF9F27]/60 animate-ping" />
      <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-[#1D9E75]/40 animate-pulse" />
      <div className="absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full bg-white/40 animate-ping delay-500" />

      <div className="relative z-10 flex flex-col items-center max-w-xs px-6 text-center">
        {/* Beer Glass Animation */}
        <div className="relative w-28 h-36 mb-6 flex items-center justify-center">
          {/* Glass Contour SVG */}
          <svg
            viewBox="0 0 100 130"
            className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Glass Handle */}
            <path
              d="M74 42 C92 42 94 88 74 94"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            {/* Glass Base & Stem Outline */}
            <path
              d="M24 20 L28 110 C28 116 36 120 50 120 C64 120 72 116 72 110 L76 20 Z"
              fill="rgba(255,255,255,0.06)"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Clip Path for Liquid inside Glass */}
            <clipPath id="glassInterior">
              <path d="M26 22 L29 108 C30 114 38 117 50 117 C62 117 70 114 71 108 L74 22 Z" />
            </clipPath>

            <g clipPath="url(#glassInterior)">
              {/* Amber Liquid Level */}
              <rect
                x="20"
                y="20"
                width="60"
                height="100"
                fill="url(#amberGradient)"
                className="liquid-rise origin-bottom"
              />

              {/* Liquid Wave Highlight */}
              <ellipse
                cx="50"
                cy="44"
                rx="23"
                ry="4"
                fill="#F7C85C"
                opacity="0.8"
              />

              {/* Foam Head */}
              <rect
                x="24"
                y="34"
                width="52"
                height="16"
                rx="4"
                fill="#FFFDF0"
                className="foam-rise origin-bottom"
              />
              <circle cx="36" cy="35" r="5" fill="#FFFDF0" />
              <circle cx="50" cy="33" r="6" fill="#FFFFFF" />
              <circle cx="63" cy="35" r="5" fill="#FFFDF0" />

              {/* Rising Carbonation Bubbles */}
              <circle cx="42" cy="85" r="1.5" fill="#FFF" opacity="0.7">
                <animate
                  attributeName="cy"
                  from="110"
                  to="45"
                  dur="1.4s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="56" cy="95" r="2" fill="#FFF" opacity="0.6">
                <animate
                  attributeName="cy"
                  from="110"
                  to="48"
                  dur="1.8s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="48" cy="70" r="1.2" fill="#FFF" opacity="0.8">
                <animate
                  attributeName="cy"
                  from="110"
                  to="42"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>

            {/* Glass Highlighting Reflection */}
            <path
              d="M32 28 L34 102"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF9F27" />
                <stop offset="60%" stopColor="#C97B14" />
                <stop offset="100%" stopColor="#8C4905" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Brand Title with Soft Bounce Scale Transition */}
        <div
          className={`transition-all duration-700 ease-out transform ${
            phase === 'logo' || phase === 'complete'
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-95'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm text-[11px] font-semibold uppercase tracking-wider text-[#EF9F27] mb-2.5">
            <span>Tembisa • South Africa</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            Cecil&apos;s Pub <span className="text-[#EF9F27]">Manager</span>
          </h1>

          <p className="text-sm text-emerald-100/80 font-medium mb-6">
            Tavern Operations Assistant
          </p>

          {/* Powered by CoreIQ signature */}
          <div className="inline-flex items-center justify-center gap-1.5 text-xs text-emerald-200/90 font-medium tracking-wide">
            <span className="text-[10px] uppercase text-emerald-300/70 tracking-widest">
              Powered by
            </span>
            <div className="flex items-center gap-1 font-semibold text-white bg-black/25 px-2.5 py-0.5 rounded-md border border-emerald-400/20 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#1D9E75] animate-pulse" />
              <span className="tracking-wide">CoreIQ</span>
            </div>
          </div>
        </div>

        {/* Tap to skip hint */}
        <div className="mt-8 text-[11px] text-emerald-300/50 tracking-wider uppercase font-medium">
          Tap anywhere to start
        </div>
      </div>
    </div>
  );
};
