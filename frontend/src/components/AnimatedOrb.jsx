import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedOrb() {
  return (
    <div className="relative w-full aspect-square max-w-[460px] mx-auto select-none">
      {/* outer glow */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.55), rgba(56,189,248,0.35) 40%, rgba(2,6,23,0) 70%)',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* spinning ring 1 */}
      <motion.svg
        viewBox="0 0 400 400"
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
      >
        <defs>
          <linearGradient id="ringA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse
          cx="200"
          cy="200"
          rx="180"
          ry="60"
          fill="none"
          stroke="url(#ringA)"
          strokeWidth="1.5"
          transform="rotate(20 200 200)"
        />
        <ellipse
          cx="200"
          cy="200"
          rx="180"
          ry="60"
          fill="none"
          stroke="url(#ringA)"
          strokeWidth="1"
          opacity="0.5"
          transform="rotate(-30 200 200)"
        />
      </motion.svg>

      {/* spinning ring 2 (opposite) */}
      <motion.svg
        viewBox="0 0 400 400"
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
      >
        <defs>
          <linearGradient id="ringB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
            <stop offset="50%" stopColor="#c4b5fd" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="170" fill="none" stroke="url(#ringB)" strokeWidth="1" strokeDasharray="2 6" />
        <circle cx="200" cy="200" r="140" fill="none" stroke="url(#ringB)" strokeWidth="1" opacity="0.6" />
      </motion.svg>

      {/* core sphere */}
      <motion.div
        className="absolute left-1/2 top-1/2 w-[58%] h-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 35% 30%, #c7d2fe 0%, #6366f1 25%, #1e3a8a 60%, #0b1230 100%)',
          boxShadow:
            '0 30px 80px -20px rgba(56,189,248,0.55), inset -20px -30px 60px rgba(2,6,23,0.6), inset 14px 18px 40px rgba(199,210,254,0.55)',
        }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* inner shine */}
        <div
          className="absolute inset-0 rounded-full mix-blend-screen opacity-70"
          style={{
            background:
              'radial-gradient(circle at 70% 75%, rgba(56,189,248,0.45), transparent 45%)',
          }}
        />
        {/* play button */}
        <button
          type="button"
          aria-label="Play intro video"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-900 ml-1" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </motion.div>

      {/* floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-sky-300/70"
          style={{
            left: `${15 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{ y: [0, -14, 0], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
        />
      ))}
    </div>
  );
}
