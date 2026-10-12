// Single source of truth for free vs premium limits.
// Tweak the numbers here and every section honors them.

export const OWNER_EMAIL = 'syedimad348@gmail.com';

export const TIERS = {
  free: {
    name: 'Free',
    badge: 'Free',
    price: 0,
    color: 'slate',
    limits: {
      jobsPerDay:        50,   // visible jobs/day
      appliesPerDay:     10,   // apply button per day
      resumeAnalyses:    2,    // /month
      interviewSessions: 3,    // /month
      aiToolsView:       50,   // browse cap
      reels:             false,
      jobMatchAfterCV:   false,
      aiDetection:       false,
      voiceScoring:      false,
      sendMessages:      false,
      exportCSV:         false,
      proBadge:          false,
    },
  },
  pro: {
    name: 'Pro',
    badge: 'Pro',
    price: 6,
    color: 'brand',
    limits: {
      jobsPerDay:        Infinity,
      appliesPerDay:     Infinity,
      resumeAnalyses:    Infinity,
      interviewSessions: Infinity,
      aiToolsView:       Infinity,
      reels:             true,
      jobMatchAfterCV:   true,
      aiDetection:       true,
      voiceScoring:      true,
      sendMessages:      true,
      exportCSV:         true,
      proBadge:          true,
    },
  },
  premium: {
    name: 'Premium',
    badge: 'Premium',
    price: 18,
    color: 'violet',
    limits: {
      jobsPerDay:        Infinity,
      appliesPerDay:     Infinity,
      resumeAnalyses:    Infinity,
      interviewSessions: Infinity,
      aiToolsView:       Infinity,
      reels:             true,
      jobMatchAfterCV:   true,
      aiDetection:       true,
      voiceScoring:      true,
      sendMessages:      true,
      exportCSV:         true,
      proBadge:          true,
      humanReview:       true,
    },
  },
  demo: {
    name: 'Demo',
    badge: 'Demo',
    price: 0,
    color: 'emerald',
    limits: {  // demo gets pro caps so you can explore everything
      jobsPerDay:        Infinity,
      appliesPerDay:     Infinity,
      resumeAnalyses:    Infinity,
      interviewSessions: Infinity,
      aiToolsView:       Infinity,
      reels:             true,
      jobMatchAfterCV:   true,
      aiDetection:       true,
      voiceScoring:      true,
      sendMessages:      true,
      exportCSV:         true,
      proBadge:          true,
    },
  },
};

export function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
}

export function getTier(user) {
  const u = user || getUser();
  if (u?.email?.toLowerCase() === OWNER_EMAIL) return TIERS.premium;       // owner = full access
  return TIERS[u?.plan] || TIERS.free;
}

export function isOwner(user) {
  return (user || getUser())?.email?.toLowerCase() === OWNER_EMAIL;
}

export function canUse(featureKey, user) {
  const t = getTier(user);
  return !!t.limits[featureKey];
}

export function limitFor(featureKey, user) {
  const t = getTier(user);
  const v = t.limits[featureKey];
  return typeof v === 'number' ? v : (v ? Infinity : 0);
}
