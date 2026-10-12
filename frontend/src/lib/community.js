// Seeded community of realistic-looking people. Privacy-first: no real emails / phone.
// Each person has a public profile with bio, location, skills, links, recent post.

const PEOPLE = [
  { name: 'Aisha Khan',      role: 'Senior Frontend Engineer',           city: 'Karachi, PK',  skills: ['React','TypeScript','Tailwind','Next.js','GraphQL'], dpColor: 'from-brand-500 to-violet-500', followers: 1284, following: 312, verified: true,  pro: true,  bio: 'Building delightful UIs at a B2B SaaS. Open to remote roles in EU/US.', recent: 'Just shipped a design system migration that cut our bundle by 38%.' },
  { name: 'Hamza Ali',       role: 'Backend Engineer (Go + Rust)',        city: 'Lahore, PK',   skills: ['Go','Rust','PostgreSQL','Kafka','gRPC'],            dpColor: 'from-emerald-500 to-cyan-500',  followers: 942,  following: 188, verified: false, pro: true,  bio: 'Distributed systems nerd. Currently scaling payments infra at 50k QPS.', recent: 'Wrote up how we got p99 latency down to 14ms with Rust + Tokio.' },
  { name: 'Sara Iqbal',      role: 'Product Designer · 0→1 specialist',  city: 'Islamabad, PK',skills: ['Figma','User Research','Prototyping','Webflow'],   dpColor: 'from-pink-500 to-rose-500',     followers: 2103, following: 512, verified: true,  pro: false, bio: 'Designed 4 products from scratch. Looking for senior IC roles.', recent: 'New case study up: how we 3x’d activation in 6 weeks.' },
  { name: 'Bilal Ahmed',     role: 'ML Engineer · LLM fine-tuning',       city: 'Berlin, DE',   skills: ['PyTorch','Transformers','vLLM','CUDA','MLOps'],     dpColor: 'from-violet-500 to-fuchsia-500',followers: 3450, following: 401, verified: true,  pro: true,  bio: 'Fine-tuning open models for enterprise. Ex-DeepMind intern.', recent: 'Open-sourced a 7B finance-tuned model — 34k downloads in a week.' },
  { name: 'Mehak Raza',      role: 'Recruiter · helping juniors land jobs', city: 'Dubai, AE', skills: ['Tech Recruiting','Talent Sourcing','LinkedIn','ATS'], dpColor: 'from-amber-500 to-orange-500', followers: 5210, following: 1822, verified: true, pro: false, bio: 'Hiring across MENA & PK for FAANG-tier startups. DM me your CV.', recent: 'Have 14 frontend roles open at YC startups — comment for the list.' },
  { name: 'Ali Hussain',     role: 'DevOps · K8s + Terraform',            city: 'Toronto, CA',  skills: ['Kubernetes','Terraform','AWS','Argo','Prometheus'], dpColor: 'from-sky-500 to-indigo-500',    followers: 870,  following: 240, verified: false, pro: true,  bio: 'Platform engineer. I make on-call boring (in a good way).', recent: 'GitOps tip: separate your release controller from your deploy controller.' },
  { name: 'Zoya Sheikh',     role: 'Product Manager · SaaS',              city: 'London, UK',   skills: ['Roadmapping','SQL','OKRs','Discovery','A/B testing'], dpColor: 'from-brand-500 to-violet-500', followers: 1690, following: 443, verified: true,  pro: true,  bio: 'PM at a Series-B SaaS. Mentor at YC Startup School.', recent: 'Stop running 8-week roadmap planning. Try this 90-min weekly instead.' },
  { name: 'Usman Malik',     role: 'Mobile Engineer (React Native)',      city: 'Karachi, PK',  skills: ['React Native','Swift','Kotlin','Expo','Reanimated'], dpColor: 'from-pink-500 to-rose-500',    followers: 720,  following: 198, verified: false, pro: false, bio: 'Mobile dev — shipped 6 apps to App Store/Play. Open to contracts.', recent: 'Reanimated 4 + new arch is ridiculously good. Demo thread inside.' },
  { name: 'Nimra Qureshi',   role: 'Data Scientist',                       city: 'Singapore, SG',skills: ['Python','SQL','dbt','Snowflake','Looker'],          dpColor: 'from-emerald-500 to-cyan-500', followers: 1140, following: 267, verified: false, pro: true,  bio: 'Marketing analytics → causal inference. Currently at fintech.', recent: 'Stop measuring uplift wrong — here’s a CUPED primer in 5 minutes.' },
  { name: 'Hassan Butt',     role: 'Growth Marketer · B2B SaaS',          city: 'Lahore, PK',   skills: ['SEO','Content','Lifecycle','Webflow','HubSpot'],    dpColor: 'from-amber-500 to-orange-500', followers: 1340, following: 580, verified: false, pro: false, bio: 'Took a SaaS from $0 → $4M ARR in 18 months. Now consulting.', recent: 'Programmatic SEO playbook: 4 templates that brought 280k organic visits.' },
  { name: 'Fatima Siddiqui', role: 'Engineering Manager',                  city: 'Amsterdam, NL',skills: ['Leadership','Hiring','Architecture','Coaching'],    dpColor: 'from-violet-500 to-fuchsia-500',followers: 2980, following: 412, verified: true,  pro: true,  bio: 'EM of 3 squads. Help engineers grow into the next level.', recent: 'The first 90 days as an EM — what I’d do differently.' },
  { name: 'Ahmed Yousuf',    role: 'AI Tools Reviewer · Newsletter (40k)', city: 'Karachi, PK', skills: ['Writing','Curation','Prompt Engineering','Notion'],dpColor: 'from-sky-500 to-indigo-500',    followers: 6800, following: 901, verified: true,  pro: true,  bio: 'I test 40+ AI tools every month so you don’t have to.', recent: 'My ranking of the top 7 AI image tools in 2026 — winner is free.' },
  { name: 'Layla Raza',      role: 'Frontend Engineer (Vue 3)',           city: 'Dubai, AE',    skills: ['Vue','Nuxt','TypeScript','Pinia','Vitest'],          dpColor: 'from-pink-500 to-rose-500',    followers: 540,  following: 145, verified: false, pro: false, bio: 'Vue OSS contributor. Looking for remote senior roles.', recent: 'Migrated a 200k-LoC app to Vue 3 + Composition API. Lessons inside.' },
  { name: 'Omar Shaikh',     role: 'Founder · Bootstrapped SaaS',          city: 'Riyadh, SA',  skills: ['Stripe','Webflow','GTM','Founder-led sales'],        dpColor: 'from-emerald-500 to-cyan-500', followers: 4310, following: 220, verified: true,  pro: true,  bio: 'Built a $40k MRR SaaS solo. Helping other indie founders launch.', recent: 'Build → launch → revenue in 60 days. Sharing my exact playbook.' },
  { name: 'Maryam Hassan',   role: 'UX Researcher',                        city: 'Berlin, DE',  skills: ['Interviews','Usability Testing','Dovetail','Maze'], dpColor: 'from-brand-500 to-violet-500',  followers: 980,  following: 318, verified: false, pro: false, bio: 'Ex-Big Tech researcher. Now consulting w/ early-stage startups.', recent: 'Free template: discovery interview script that actually works.' },
  { name: 'Yusuf Daniyal',   role: 'iOS Engineer',                         city: 'Karachi, PK',  skills: ['Swift','SwiftUI','Combine','Core Data'],            dpColor: 'from-amber-500 to-orange-500', followers: 410,  following: 122, verified: false, pro: false, bio: 'iOS engineer building a meditation app. Open to senior IC roles.', recent: 'SwiftUI 6 + new Observation macro = 80% less boilerplate.' },
  { name: 'Iqra Hira',       role: 'Tech Recruiter · YC startups',        city: 'San Francisco, US', skills: ['Sourcing','Closing','Comp negotiation'],        dpColor: 'from-violet-500 to-fuchsia-500',followers: 7200, following: 2400, verified: true, pro: true,  bio: 'I help engineers double their TC. DM with your latest offer.', recent: 'Average L4 → L5 jump at top YC cos right now: $98k. Wild.' },
  { name: 'Saad Ahmed',      role: 'Cloud Architect · AWS',                city: 'Doha, QA',    skills: ['AWS','Terraform','Lambda','EKS','Networking'],      dpColor: 'from-sky-500 to-indigo-500',    followers: 1620, following: 290, verified: true,  pro: false, bio: 'Architecting multi-region AWS for fintech. AWS Hero.', recent: 'Cost-optimization: 4 AWS levers that cut our bill 42% in 1 quarter.' },
];

const COLORS = ['from-brand-500 to-violet-500','from-emerald-500 to-cyan-500','from-pink-500 to-rose-500','from-amber-500 to-orange-500','from-violet-500 to-fuchsia-500','from-sky-500 to-indigo-500'];

function rand(seed) { let x = seed; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; }

export const COMMUNITY = (() => {
  const rng = rand(7);
  // Real-named seeded set first
  const real = PEOPLE.map((p, i) => ({
    id: `u_${i + 1}`,
    handle: '@' + p.name.toLowerCase().replace(/\s+/g, ''),
    name: p.name, headline: p.role, city: p.city, bio: p.bio, recent: p.recent,
    skills: p.skills, dpColor: p.dpColor,
    followers: p.followers, following: p.following,
    activityScore: 60 + Math.floor(rng() * 40),
    lastOnlineMin: Math.floor(rng() * 60 * 6),
    verified: p.verified, pro: p.pro,
  }));
  // Pad with a few generic profiles for variety
  const F = ['Ayesha','Tariq','Nadia','Imran','Sana'];
  const L = ['Khan','Raza','Shah','Anwar','Jalil'];
  const extra = Array.from({ length: 18 }).map((_, i) => {
    const f = F[Math.floor(rng() * F.length)]; const l = L[Math.floor(rng() * L.length)];
    return {
      id: `u_${PEOPLE.length + i + 1}`,
      handle: `@${f}${l}`.toLowerCase(),
      name: `${f} ${l}`,
      headline: ['Software Engineer','Marketing Lead','Product Designer','Data Engineer','QA Lead'][Math.floor(rng()*5)],
      city: ['Karachi, PK','Lahore, PK','Dubai, AE','London, UK','Toronto, CA'][Math.floor(rng()*5)],
      bio: 'Open to new opportunities. Connect to chat.',
      recent: 'Updated my profile — actively interviewing.',
      skills: ['Communication','Teamwork','Problem solving'],
      dpColor: COLORS[Math.floor(rng() * COLORS.length)],
      followers: Math.floor(rng() * 800),
      following: Math.floor(rng() * 300),
      activityScore: Math.floor(rng() * 100),
      lastOnlineMin: Math.floor(rng() * 60 * 24),
      verified: rng() > 0.85,
      pro: rng() > 0.7,
    };
  });
  return [...real, ...extra];
})();

export function lastOnlineLabel(min) {
  if (min < 1) return 'Online now';
  if (min < 60) return `${min}m ago`;
  if (min < 24 * 60) return `${Math.floor(min / 60)}h ago`;
  return `${Math.floor(min / (60 * 24))}d ago`;
}

export function findPerson(id) { return COMMUNITY.find((u) => u.id === id); }
