import React, { useState, useEffect } from 'react';
import { Droplet, ChevronRight, Activity } from 'lucide-react';

export default function IntroScreen({ onEnter }) {
  const [stage, setStage] = useState('initial'); // 'initial' -> 'shrinking' -> 'revealed' -> 'closing'

  useEffect(() => {
    // Stage 1: Droplet starts large in center, smoothly starts shrinking at 350ms
    const shrinkTimer = setTimeout(() => {
      setStage('shrinking');
    }, 350);

    // Stage 2: 'BloodPulse' text fully revealed at 1400ms
    const revealTimer = setTimeout(() => {
      setStage('revealed');
    }, 1400);

    // Stage 3: Auto-transition to main dashboard at 3600ms
    const autoEnterTimer = setTimeout(() => {
      handleComplete();
    }, 3600);

    return () => {
      clearTimeout(shrinkTimer);
      clearTimeout(revealTimer);
      clearTimeout(autoEnterTimer);
    };
  }, []);

  const handleComplete = () => {
    setStage('closing');
    setTimeout(() => {
      onEnter();
    }, 550);
  };

  return (
    <div
      onClick={handleComplete}
      className={`fixed inset-0 z-50 bg-[#03060E] text-white flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 h-[100dvh] w-screen overflow-hidden select-none cursor-pointer transition-all duration-700 ease-out transform-gpu will-change-transform will-change-opacity ${
        stage === 'closing' ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Background Radial Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,_rgba(220,38,38,0.24)_0%,_rgba(3,6,14,0.98)_70%)]"></div>

      {/* Subtle Grid Ambient Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"></div>

      {/* Top Header Telemetry (Responsive) */}
      <header className="w-full max-w-5xl flex items-center justify-between pointer-events-none opacity-80 z-20 pt-1 sm:pt-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div>
          <span className="font-mono text-[9px] sm:text-xs tracking-widest text-rose-400 font-bold uppercase">
            BLOODPULSE // EMERGENCY OPS
          </span>
        </div>
        <span className="font-mono text-[9px] sm:text-xs text-slate-500 uppercase tracking-wider hidden xs:inline">
          Click anywhere to skip
        </span>
      </header>

      {/* Center Animation Stage (Fluid & Responsive on all screens) */}
      <main className="relative flex flex-col items-center justify-center z-10 my-auto w-full max-w-3xl px-2">
        
        {/* Pulsing Concentric Radar Rings */}
        <div className="absolute flex items-center justify-center pointer-events-none">
          <div className="w-[min(70vw,20rem)] h-[min(70vw,20rem)] sm:w-[26rem] sm:h-[26rem] md:w-[32rem] md:h-[32rem] rounded-full border border-red-600/20 animate-radar-ripple opacity-30"></div>
          <div className="w-[min(85vw,24rem)] h-[min(85vw,24rem)] sm:w-[30rem] sm:h-[30rem] md:w-[36rem] md:h-[36rem] rounded-full border border-rose-500/15 animate-pulse-ring"></div>
          <div className="w-[min(50vw,14rem)] h-[min(50vw,14rem)] sm:w-[18rem] sm:h-[18rem] md:w-[22rem] md:h-[22rem] rounded-full border border-red-500/30"></div>
        </div>

        {/* The Glowing Droplet Symbol: Smoothly Decreases in Size */}
        <div
          className={`relative z-20 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu will-change-transform ${
            stage === 'initial'
              ? 'scale-110 sm:scale-135 md:scale-150 translate-y-0'
              : 'scale-[0.62] sm:scale-[0.70] md:scale-75 -translate-y-2 sm:-translate-y-4'
          }`}
        >
          {/* Pure Seamless Glowing Vector Droplet with Flame Core */}
          <div className="relative flex items-center justify-center animate-glow-flame">
            <svg
              viewBox="0 0 100 120"
              className="w-28 h-36 xs:w-32 xs:h-40 sm:w-44 sm:h-56 md:w-48 md:h-60 transition-transform duration-300 transform-gpu"
            >
              <defs>
                <radialGradient id="dropGrad" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#ff4d4d" />
                  <stop offset="45%" stopColor="#e11d48" />
                  <stop offset="85%" stopColor="#be123c" />
                  <stop offset="100%" stopColor="#881337" />
                </radialGradient>
                <radialGradient id="flameGrad" cx="50%" cy="60%" r="50%">
                  <stop offset="0%" stopColor="#1a0208" />
                  <stop offset="70%" stopColor="#0a0104" />
                  <stop offset="100%" stopColor="#030002" />
                </radialGradient>
              </defs>

              {/* Main Outer Droplet Body */}
              <path
                d="M50 6 C50 6 15 54 15 80 C15 99.3 30.7 115 50 115 C69.3 115 85 99.3 85 80 C85 54 50 6 50 6 Z"
                fill="url(#dropGrad)"
              />

              {/* Specular Highlight on Droplet Peak */}
              <path
                d="M50 14 C48 24 35 55 32 75 C31 60 42 30 50 14 Z"
                fill="rgba(255, 255, 255, 0.28)"
                opacity="0.7"
              />

              {/* Inner Flame Icon Cutout */}
              <path
                d="M50 46 C42 58 35 69 35 80 C35 91 43 99 52 99 C48 93 47 86 50 80 C52.5 75 57 71 58 66 C59.5 61 58 54 50 46 Z"
                fill="url(#flameGrad)"
              />
            </svg>

            {/* Ambient Floor Glow underneath Droplet */}
            <div className="absolute -bottom-4 sm:-bottom-6 w-32 sm:w-44 h-6 sm:h-8 bg-red-600/50 rounded-full blur-xl pointer-events-none"></div>
          </div>
        </div>

        {/* Typography Revealed Behind the Droplet */}
        <div
          className={`relative z-10 text-center transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu will-change-transform will-change-opacity ${
            stage === 'initial'
              ? 'opacity-0 scale-90 translate-y-8 blur-md pointer-events-none'
              : 'opacity-100 scale-100 translate-y-0 blur-0'
          }`}
        >
          {/* Main Title 'BloodPulse' */}
          <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-black tracking-wider uppercase font-sans text-white drop-shadow-[0_0_35px_rgba(239,68,68,0.75)] animate-text-shimmer">
            Blood<span className="text-red-500">Pulse</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold tracking-widest text-slate-300 mt-1.5 sm:mt-2 uppercase px-2">
            Rapid Emergency Donor Response Network
          </p>

          {/* Tamil Nadu Coverage Badge */}
          <div className="mt-2.5 sm:mt-3 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-red-950/50 border border-red-800/40 text-rose-300 font-mono text-[9px] sm:text-xs shadow-lg max-w-[90vw] truncate">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
            <span className="truncate">38 DISTRICTS CONNECTED • LIVE DISPATCH READY</span>
          </div>
        </div>
      </main>

      {/* Bottom Launch Button (Responsive) */}
      <footer
        className={`w-full max-w-xs flex flex-col items-center gap-2 z-20 pb-2 sm:pb-4 transition-all duration-700 transform-gpu ${
          stage === 'revealed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleComplete();
          }}
          className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm py-3 sm:py-3.5 px-6 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2 tracking-wider uppercase border border-red-400/40 transition active:scale-95 cursor-pointer"
        >
          <Droplet className="w-4 h-4 fill-current text-white animate-pulse" />
          <span>ENTER PORTAL</span>
          <ChevronRight className="w-4 h-4" />
        </button>
        <p className="text-[9px] sm:text-[10px] text-slate-500 tracking-wide">Click anywhere to skip</p>
      </footer>
    </div>
  );
}
