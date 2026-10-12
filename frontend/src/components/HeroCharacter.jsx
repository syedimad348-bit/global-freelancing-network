import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STRESSED_THOUGHTS = [
  "I don't have a job 😟",
  "200+ apps, 0 replies…",
  "Is my resume bad?",
  "Recruiter ghosted me again",
  "Should I quit?",
  "Where to even apply?",
];

const HAPPY_THOUGHTS = [
  "Got an interview! 🎉",
  "Resume scored A+ 🚀",
  "Offer secured! 💼",
];

export default function HeroCharacter({ relaxed = false }) {
  const [thoughtIdx, setThoughtIdx] = useState(0);
  const thoughts = relaxed ? HAPPY_THOUGHTS : STRESSED_THOUGHTS;

  useEffect(() => {
    const id = setInterval(() => setThoughtIdx((i) => (i + 1) % thoughts.length), 2600);
    return () => clearInterval(id);
  }, [thoughts.length]);

  return (
    <div className="relative w-full max-w-[520px] mx-auto select-none">
      {/* atmospheric glow */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-0 rounded-[40%] blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(84,104,255,0.45), rgba(236,72,153,0.18) 40%, transparent 70%)',
        }}
        animate={{ opacity: [0.6, 0.95, 0.6], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* lamp glow */}
      <motion.div
        aria-hidden
        className="absolute -top-4 left-6 w-32 h-32 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(253,186,116,0.55), transparent 70%)' }}
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* character with stress shake (or relaxed bobbing) */}
      <motion.div
        animate={
          relaxed
            ? { y: [0, -10, 0], rotate: 0 }
            : { y: [0, -3, 0], rotate: [-1.2, 1.2, -1.2] }
        }
        transition={{
          duration: relaxed ? 5 : 1.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10"
      >
        <img
          src="/static/hero-character.png"
          alt="3D character thinking about how to find a job"
          className="w-full h-auto drop-shadow-[0_30px_40px_rgba(2,6,23,0.55)]"
        />

        {/* sweat drops while stressed */}
        {!relaxed && (
          <>
            <motion.span
              className="absolute top-[28%] left-[63%] w-2.5 h-3.5 bg-sky-300 rounded-b-full"
              style={{ borderTopLeftRadius: '50%', borderTopRightRadius: '50%', filter: 'blur(0.3px)' }}
              animate={{ y: [0, 18, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: 0.0 }}
            />
            <motion.span
              className="absolute top-[24%] right-[28%] w-2 h-3 bg-sky-300 rounded-b-full"
              style={{ borderTopLeftRadius: '50%', borderTopRightRadius: '50%' }}
              animate={{ y: [0, 16, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }}
            />
          </>
        )}
      </motion.div>

      {/* thought bubble — top-right */}
      <div className="absolute top-2 -right-4 sm:right-2 z-20 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={thoughtIdx + (relaxed ? 'h' : 's')}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className={[
              'relative max-w-[180px] px-4 py-2.5 rounded-2xl text-xs font-bold shadow-xl border backdrop-blur-md',
              relaxed
                ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-100'
                : 'bg-white/[0.10] border-white/15 text-white/90',
            ].join(' ')}
          >
            {thoughts[thoughtIdx]}
            {/* tail */}
            <span
              aria-hidden
              className={[
                'absolute -bottom-2 left-6 w-3 h-3 rotate-45 border-b border-r',
                relaxed ? 'bg-emerald-500/15 border-emerald-400/30' : 'bg-white/[0.10] border-white/15',
              ].join(' ')}
            />
            <span
              aria-hidden
              className="absolute -bottom-5 left-3 w-2 h-2 rounded-full bg-white/15 border border-white/15"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* floating chips */}
      {!relaxed && (
        <>
          <FloatingChip className="top-1/3 -left-2 hidden sm:flex" delay={0.4}>
            <span className="text-rose-300">!</span> Rejected · 47
          </FloatingChip>
          <FloatingChip className="bottom-10 right-0" delay={0.8}>
            <span className="text-amber-300">⚠</span> Resume score: 58
          </FloatingChip>
        </>
      )}
      {relaxed && (
        <>
          <FloatingChip className="top-1/3 -left-2 hidden sm:flex" delay={0.4}>
            <span className="text-emerald-300">★</span> Resume A+
          </FloatingChip>
          <FloatingChip className="bottom-10 right-0" delay={0.8}>
            <span className="text-violet-300">◆</span> Interview ready
          </FloatingChip>
        </>
      )}
    </div>
  );
}

function FloatingChip({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: [0, -6, 0] }}
      transition={{
        opacity: { duration: 0.6, delay },
        y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay },
      }}
      className={[
        'absolute z-20 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold',
        'bg-white/8 border border-white/15 backdrop-blur-md text-white/85 shadow-lg shadow-black/20',
        className,
      ].join(' ')}
    >
      {children}
    </motion.div>
  );
}
