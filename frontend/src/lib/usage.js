// Local-first usage tracker. Each new account starts at ZERO and grows from real activity.
// Adds: profile (avatar, bio, skills, experience, links), follow requests w/ accept/reject,
// auto-reply DMs, 24h auto-clean of messages.

const KEY = 'dr_usage_v1';
const MSG_TTL_MS = 24 * 3600 * 1000;

const empty = () => ({
  applies: [],
  interviews: [],
  resumeAnalyses: [],
  followers: [],          // people who follow ME (accepted)
  following: [],          // people I follow (accepted)
  followRequestsIn:  [],  // ids who want to follow me — I must accept
  followRequestsOut: [],  // ids I'm waiting on (auto-accepted later)
  messages: {},
  resumeText: '',
  profile: {
    name: '', headline: '', bio: '', location: '', dpUrl: '',
    skills: [], experience: [], education: [], links: { portfolio: '', github: '', linkedin: '' },
    publicHeadline: true, publicLocation: true,
  },
  reward500Claimed: false,
});

function pruneMessages(u) {
  const cutoff = Date.now() - MSG_TTL_MS;
  if (!u.messages) return u;
  const cleaned = {};
  for (const [uid, list] of Object.entries(u.messages)) {
    const fresh = (list || []).filter((m) => m.ts >= cutoff);
    if (fresh.length) cleaned[uid] = fresh;
  }
  u.messages = cleaned;
  return u;
}

export function loadUsage() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    const merged = { ...empty(), ...parsed, profile: { ...empty().profile, ...(parsed.profile || {}) } };
    return pruneMessages(merged);
  } catch { return empty(); }
}

export function saveUsage(u) {
  try { localStorage.setItem(KEY, JSON.stringify(u)); } catch {}
  try { window.dispatchEvent(new CustomEvent('usage-changed')); } catch {}
}

export function trackApply(job) {
  const u = loadUsage();
  u.applies.unshift({
    id: job.id || `${job.title}-${job.company}-${Date.now()}`,
    title: job.title, company: job.company, source: job.source,
    url: job.url, salary: job.salary || '', tags: job.tags || [], ts: Date.now(),
  });
  u.applies = u.applies.slice(0, 500);
  saveUsage(u);
}

export function appliesToday() {
  const u = loadUsage();
  return u.applies.filter((a) => a.ts >= startOfTodayMs()).length;
}

export function trackInterview(score, track) {
  const u = loadUsage();
  u.interviews.unshift({ ts: Date.now(), score, track });
  u.interviews = u.interviews.slice(0, 200);
  saveUsage(u);
}

export function trackResume(overall, text) {
  const u = loadUsage();
  u.resumeAnalyses.unshift({ ts: Date.now(), overall });
  u.resumeAnalyses = u.resumeAnalyses.slice(0, 50);
  if (text) u.resumeText = text.slice(0, 20000);
  saveUsage(u);
}

export function getInsights() {
  const u = loadUsage();
  const start7 = Date.now() - 7 * 24 * 3600 * 1000;
  const last7 = u.applies.filter((a) => a.ts >= start7);
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date();
  const week = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (6 - i));
    const start = new Date(d); start.setHours(0,0,0,0);
    const end = new Date(d);   end.setHours(23,59,59,999);
    const list = u.applies.filter((a) => a.ts >= start.getTime() && a.ts <= end.getTime());
    return { day: days[d.getDay()], applications: list.length, replies: 0 };
  });

  const numbers = u.applies
    .map((a) => { const m = (a.salary || '').match(/\$(\d{1,3})k/i); return m ? Number(m[1]) * 1000 : null; })
    .filter(Boolean);
  const avgSalary = numbers.length ? Math.round(numbers.reduce((s, n) => s + n, 0) / numbers.length) : 0;

  // Top sources
  const sourceMap = {};
  u.applies.forEach((a) => { sourceMap[a.source] = (sourceMap[a.source] || 0) + 1; });
  const topSources = Object.entries(sourceMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name, value]) => ({ name, value }));

  return {
    totalApplies: u.applies.length,
    last7Count: last7.length,
    interviewsCount: u.interviews.length,
    resumeAnalysesCount: u.resumeAnalyses.length,
    bestResume: u.resumeAnalyses.reduce((m, r) => Math.max(m, r.overall), 0),
    avgInterview: u.interviews.length
      ? Math.round(u.interviews.reduce((s, r) => s + r.score, 0) / u.interviews.length)
      : 0,
    week, avgSalary, topSources,
    followers: u.followers.length,
    following: u.following.length,
  };
}

function startOfTodayMs() { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); }

// ---- Follow requests ----
export function requestFollow(uid) {
  const u = loadUsage();
  if (u.following.includes(uid) || u.followRequestsOut.includes(uid)) return;
  u.followRequestsOut.push(uid);
  saveUsage(u);
  // Simulate the other person accepting after a short delay (4–8s)
  const delay = 4000 + Math.random() * 4000;
  setTimeout(() => {
    const u2 = loadUsage();
    u2.followRequestsOut = u2.followRequestsOut.filter((x) => x !== uid);
    if (!u2.following.includes(uid)) u2.following.push(uid);
    saveUsage(u2);
  }, delay);
}
export function unfollow(uid) {
  const u = loadUsage();
  u.following = u.following.filter((x) => x !== uid);
  u.followRequestsOut = u.followRequestsOut.filter((x) => x !== uid);
  saveUsage(u);
}
export function acceptFollowRequest(uid) {
  const u = loadUsage();
  u.followRequestsIn = u.followRequestsIn.filter((x) => x !== uid);
  if (!u.followers.includes(uid)) u.followers.push(uid);
  saveUsage(u);
}
export function rejectFollowRequest(uid) {
  const u = loadUsage();
  u.followRequestsIn = u.followRequestsIn.filter((x) => x !== uid);
  saveUsage(u);
}
// Simulate an inbound follow request (used when seeding demo activity)
export function seedInboundRequest(uid) {
  const u = loadUsage();
  if (!u.followRequestsIn.includes(uid) && !u.followers.includes(uid)) u.followRequestsIn.push(uid);
  saveUsage(u);
}

// ---- Messages w/ auto-reply + 24h TTL ----
const REPLIES = [
  'Hey! Great to connect 👋 What are you working on these days?',
  'Thanks for reaching out — happy to chat! Tell me more.',
  'Cool! Saw your profile — solid background. Want to jump on a quick call?',
  'Appreciate the message. Drop your portfolio when you can?',
  'Always open to talking shop. What roles are you eyeing?',
  'Same here — networking is everything. Let’s keep in touch!',
];

export function sendMessage(toUserId, text) {
  const u = loadUsage();
  if (!u.messages[toUserId]) u.messages[toUserId] = [];
  u.messages[toUserId].push({ from: 'me', to: toUserId, text, ts: Date.now() });
  saveUsage(u);
  // Auto-reply after 1.4–3s
  const delay = 1400 + Math.random() * 1600;
  setTimeout(() => {
    const u2 = loadUsage();
    if (!u2.messages[toUserId]) u2.messages[toUserId] = [];
    const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
    u2.messages[toUserId].push({ from: toUserId, to: 'me', text: reply, ts: Date.now() });
    saveUsage(u2);
  }, delay);
}

export function clearOldMessages() {
  const u = loadUsage();
  pruneMessages(u);
  saveUsage(u);
}

// ---- Profile ----
export function updateProfile(patch) {
  const u = loadUsage();
  u.profile = { ...u.profile, ...patch };
  saveUsage(u);
}
export function addSkill(skill) {
  const u = loadUsage();
  const s = (skill || '').trim(); if (!s) return;
  if (!u.profile.skills.includes(s)) u.profile.skills.push(s);
  saveUsage(u);
}
export function removeSkill(skill) {
  const u = loadUsage();
  u.profile.skills = u.profile.skills.filter((x) => x !== skill);
  saveUsage(u);
}
export function addExperience(item) {
  const u = loadUsage();
  u.profile.experience.unshift({ id: `e_${Date.now()}`, ...item });
  saveUsage(u);
}
export function removeExperience(id) {
  const u = loadUsage();
  u.profile.experience = u.profile.experience.filter((x) => x.id !== id);
  saveUsage(u);
}
