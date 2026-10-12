import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated illustration of a developer at a desk.
 *  - Default state: stressed, hunched, sweat drops, "DEADLINE" stickies flying
 *  - `relaxed` prop: posture relaxes, sweat fades, sparkles appear
 */
export default function StressedDev({ relaxed = false }) {
  return (
    <div className="relative w-full max-w-[460px] mx-auto select-none">
      {/* Soft backdrop glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[380px] h-[380px] rounded-full bg-brand-200/40 blur-[80px]" />
      </div>

      {/* Floating context tags */}
      <FloatingTag
        delay={0}
        className="-top-2 -left-2"
        tone={relaxed ? 'mint' : 'rose'}
        text={relaxed ? 'Offer received' : '37 unread emails'}
        emoji={relaxed ? '🎉' : '😩'}
      />
      <FloatingTag
        delay={0.6}
        className="top-10 -right-3"
        tone={relaxed ? 'brand' : 'amber'}
        text={relaxed ? 'Resume A+ score' : 'Deadline today'}
        emoji={relaxed ? '✨' : '⏰'}
      />
      <FloatingTag
        delay={1.2}
        className="bottom-16 -left-4"
        tone={relaxed ? 'sky' : 'rose'}
        text={relaxed ? '5 interviews booked' : '0 callbacks'}
        emoji={relaxed ? '📅' : '😞'}
      />

      <motion.svg
        viewBox="0 0 460 360"
        className="w-full h-auto drop-shadow-xl"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <defs>
          <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#EEF1FF" />
            <stop offset="100%" stopColor="#DCE2FF" />
          </linearGradient>
          <linearGradient id="desk" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E6E8EF" />
          </linearGradient>
          <linearGradient id="laptop" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#1F2540" />
            <stop offset="100%" stopColor="#0B1020" />
          </linearGradient>
          <linearGradient id="screen" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={relaxed ? '#3B50EE' : '#F43F5E'} />
            <stop offset="100%" stopColor={relaxed ? '#8B5CF6' : '#F59E0B'} />
          </linearGradient>
          <linearGradient id="hoodie" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3B50EE" />
            <stop offset="100%" stopColor="#222FA3" />
          </linearGradient>
          <linearGradient id="chair" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1F2540" />
            <stop offset="100%" stopColor="#0B1020" />
          </linearGradient>
          <radialGradient id="lampGlow">
            <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Floor */}
        <ellipse cx="230" cy="330" rx="200" ry="20" fill="url(#floor)" />

        {/* Lamp glow */}
        <circle cx="120" cy="160" r="80" fill="url(#lampGlow)" />

        {/* Desk lamp */}
        <g>
          <rect x="78" y="200" width="44" height="6" rx="3" fill="#5A6379" />
          <rect x="96" y="160" width="6" height="44" rx="3" fill="#5A6379" />
          <path d="M99 160 L82 130 L116 130 Z" fill="#1F2540" />
          <circle cx="99" cy="135" r="6" fill={relaxed ? '#FCD34D' : '#F59E0B'} />
        </g>

        {/* Desk */}
        <rect x="40" y="240" width="380" height="14" rx="4" fill="url(#desk)" stroke="#E6E8EF" />
        <rect x="60" y="254" width="6" height="60" rx="2" fill="#C4C9D8" />
        <rect x="394" y="254" width="6" height="60" rx="2" fill="#C4C9D8" />

        {/* Coffee mug */}
        <g>
          <rect x="350" y="208" width="32" height="34" rx="6" fill="#FFFFFF" stroke="#E6E8EF" />
          <path d="M382 218 q10 0 10 10 t-10 10" fill="none" stroke="#E6E8EF" strokeWidth="2" />
          <rect x="354" y="214" width="24" height="6" rx="3" fill="#8B5CF6" />
          {/* steam */}
          <motion.path
            d="M358 200 q4 -8 0 -16 q-4 -8 0 -16"
            stroke="#C4C9D8"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.2, 0.7, 0.2], y: [0, -4, 0] }}
            transition={{ duration: 2.6, repeat: Infinity }}
          />
          <motion.path
            d="M368 200 q4 -8 0 -16 q-4 -8 0 -16"
            stroke="#C4C9D8"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.2, 0.7, 0.2], y: [0, -5, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, delay: 0.4 }}
          />
        </g>

        {/* Sticky notes on wall */}
        <motion.g
          animate={{ rotate: relaxed ? -4 : -10 }}
          style={{ originX: '300px', originY: '110px' }}
        >
          <rect x="280" y="80" width="48" height="48" rx="3" fill="#FCD34D" />
          <rect x="288" y="92" width="32" height="3" rx="1.5" fill="#92400E" opacity="0.6" />
          <rect x="288" y="100" width="24" height="3" rx="1.5" fill="#92400E" opacity="0.5" />
          <rect x="288" y="108" width="28" height="3" rx="1.5" fill="#92400E" opacity="0.5" />
        </motion.g>
        <motion.g
          animate={{ rotate: relaxed ? 3 : 8 }}
          style={{ originX: '350px', originY: '110px' }}
        >
          <rect x="334" y="92" width="44" height="44" rx="3" fill={relaxed ? '#A7F3D0' : '#FCA5A5'} />
          <rect x="342" y="104" width="28" height="3" rx="1.5" fill="#7F1D1D" opacity="0.5" />
          <rect x="342" y="112" width="20" height="3" rx="1.5" fill="#7F1D1D" opacity="0.45" />
        </motion.g>

        {/* Chair back */}
        <rect x="180" y="180" width="80" height="100" rx="14" fill="url(#chair)" />
        {/* Chair leg */}
        <rect x="216" y="276" width="8" height="44" fill="#0B1020" />
        <path d="M180 320 L260 320" stroke="#0B1020" strokeWidth="6" strokeLinecap="round" />

        {/* Person */}
        <motion.g
          initial={false}
          animate={{
            y: relaxed ? 0 : 6,
            rotate: relaxed ? 0 : -3,
          }}
          style={{ originX: '230px', originY: '240px' }}
          transition={{ type: 'spring', stiffness: 140, damping: 18 }}
        >
          {/* Hoodie body */}
          <path
            d="M170 250 q0 -50 60 -50 q60 0 60 50 v30 h-120 z"
            fill="url(#hoodie)"
          />
          {/* Hood */}
          <path
            d="M180 210 q50 -40 100 0 q-10 -28 -50 -28 q-40 0 -50 28 z"
            fill="#222FA3"
          />
          {/* Neck */}
          <rect x="222" y="186" width="16" height="14" rx="6" fill="#E2C0A0" />
          {/* Head */}
          <ellipse cx="230" cy="172" rx="22" ry="24" fill="#F1D4B7" />
          {/* Hair */}
          <path d="M210 162 q5 -22 22 -22 q18 0 22 22 q-12 -8 -22 -8 q-10 0 -22 8z" fill="#1F2540" />

          {/* Eyes */}
          {relaxed ? (
            <>
              <path d="M218 172 q3 -3 6 0" stroke="#0B1020" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M236 172 q3 -3 6 0" stroke="#0B1020" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M222 184 q8 6 16 0" stroke="#0B1020" strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="221" cy="173" r="2" fill="#0B1020" />
              <circle cx="239" cy="173" r="2" fill="#0B1020" />
              {/* Eye-bags */}
              <path d="M218 178 q3 2 6 0" stroke="#5A6379" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <path d="M236 178 q3 2 6 0" stroke="#5A6379" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              {/* Frown */}
              <path d="M222 188 q8 -4 16 0" stroke="#0B1020" strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          )}

          {/* Sweat drops (stress only) */}
          {!relaxed && (
            <>
              <motion.path
                d="M254 168 q3 6 0 10 q-3 -4 0 -10z"
                fill="#60A5FA"
                animate={{ y: [0, 6, 0], opacity: [0.9, 0.4, 0.9] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              <motion.path
                d="M208 174 q-3 6 0 10 q3 -4 0 -10z"
                fill="#60A5FA"
                animate={{ y: [0, 6, 0], opacity: [0.7, 0.3, 0.7] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}

          {/* Arms reaching to laptop */}
          <path d="M188 250 q-10 -20 20 -28" stroke="url(#hoodie)" strokeWidth="20" strokeLinecap="round" fill="none" />
          <path d="M272 250 q10 -20 -20 -28" stroke="url(#hoodie)" strokeWidth="20" strokeLinecap="round" fill="none" />
          {/* Hands */}
          <circle cx="206" cy="222" r="9" fill="#F1D4B7" />
          <circle cx="254" cy="222" r="9" fill="#F1D4B7" />
        </motion.g>

        {/* Laptop on desk */}
        <g>
          {/* Base */}
          <rect x="170" y="232" width="120" height="10" rx="3" fill="url(#laptop)" />
          {/* Screen */}
          <motion.g
            animate={{ rotate: relaxed ? 0 : -2 }}
            style={{ originX: '230px', originY: '232px' }}
          >
            <rect x="178" y="172" width="104" height="62" rx="6" fill="url(#laptop)" />
            <rect x="184" y="178" width="92" height="50" rx="3" fill="url(#screen)" />
            {/* Screen content */}
            <rect x="190" y="184" width="34" height="4" rx="2" fill="white" opacity="0.85" />
            <rect x="190" y="192" width="60" height="3" rx="1.5" fill="white" opacity="0.55" />
            <rect x="190" y="199" width="48" height="3" rx="1.5" fill="white" opacity="0.45" />
            <rect x="190" y="206" width="54" height="3" rx="1.5" fill="white" opacity="0.45" />
            <rect x="190" y="214" width="22" height="8" rx="3" fill="white" opacity="0.95" />
            {/* Cursor blink */}
            <motion.rect
              x="248" y="184" width="2" height="6" fill="white"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.g>
        </g>

        {/* Sparkles when relaxed */}
        {relaxed && (
          <>
            <Sparkle x={150} y={140} delay={0} />
            <Sparkle x={310} y={150} delay={0.4} />
            <Sparkle x={130} y={210} delay={0.8} />
          </>
        )}
      </motion.svg>
    </div>
  );
}

function Sparkle({ x, y, delay = 0 }) {
  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay }}
      style={{ originX: `${x}px`, originY: `${y}px` }}
    >
      <path
        d={`M${x} ${y - 8} L${x + 2} ${y - 2} L${x + 8} ${y} L${x + 2} ${y + 2} L${x} ${y + 8} L${x - 2} ${y + 2} L${x - 8} ${y} L${x - 2} ${y - 2} Z`}
        fill="#FCD34D"
      />
    </motion.g>
  );
}

const tagTones = {
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
  mint: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
};

function FloatingTag({ className = '', text, emoji, tone = 'brand', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: [0, -6, 0] }}
      transition={{ y: { duration: 3, repeat: Infinity, delay }, opacity: { duration: 0.6, delay } }}
      className={[
        'absolute z-10 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-card backdrop-blur',
        tagTones[tone],
        className,
      ].join(' ')}
    >
      <span>{emoji}</span>
      <span>{text}</span>
    </motion.div>
  );
}
