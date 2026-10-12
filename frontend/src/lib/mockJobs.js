// Lightweight, deterministic-ish mock job generator.
// Posts are biased to be VERY fresh (most under 1h, none older than 5h)
// and the feed is regenerated on every page load so it always feels live.

const SOURCES = [
  { name: 'LinkedIn',   color: 'sky',     weight: 22, base: 'https://www.linkedin.com/jobs/',                       search: 'https://www.linkedin.com/jobs/search/?keywords=' },
  { name: 'Indeed',     color: 'indigo',  weight: 18, base: 'https://www.indeed.com/jobs',                          search: 'https://www.indeed.com/jobs?q=' },
  { name: 'Upwork',     color: 'emerald', weight: 16, base: 'https://www.upwork.com/nx/jobs/search/',               search: 'https://www.upwork.com/nx/jobs/search/?q=' },
  { name: 'Remotive',   color: 'violet',  weight: 12, base: 'https://remotive.com/remote-jobs',                     search: 'https://remotive.com/remote-jobs/search?search=' },
  { name: 'Arbeitnow',  color: 'amber',   weight: 10, base: 'https://www.arbeitnow.com/',                           search: 'https://www.arbeitnow.com/?search=' },
  { name: 'Adzuna',     color: 'rose',    weight: 12, base: 'https://www.adzuna.com/search',                        search: 'https://www.adzuna.com/search?q=' },
  { name: 'Freelancer', color: 'cyan',    weight: 10, base: 'https://www.freelancer.com/jobs/',                     search: 'https://www.freelancer.com/jobs/search/?keyword=' },
];

const COMPANIES = [
  'Stripe', 'Vercel', 'Linear', 'Notion', 'Figma', 'Anthropic', 'OpenAI', 'Cloudflare',
  'Datadog', 'Snowflake', 'GitLab', 'Asana', 'Plaid', 'Ramp', 'Brex', 'Mercury',
  'Webflow', 'Replit', 'Hugging Face', 'LangChain', 'Perplexity', 'Mistral', 'Scale AI',
  'Canva', 'HubSpot', 'Atlassian', 'Shopify', 'Square', 'Airtable', 'Coda', 'Discord',
  'Twitch', 'Reddit', 'Spotify', 'Roblox', 'Unity', 'Coinbase', 'Robinhood', 'Affirm',
  'Instacart', 'DoorDash', 'Uber', 'Lyft', 'Pinterest', 'Snap', 'Twilio', 'PagerDuty',
  'Elastic', 'MongoDB', 'Redis Labs', 'HashiCorp', 'Confluent', 'Databricks',
];

const ROLES = [
  { folder: 'Engineering', titles: [
    'Senior Frontend Engineer', 'Staff Backend Engineer', 'Full-Stack Engineer (TypeScript)',
    'Platform Engineer', 'Site Reliability Engineer', 'Mobile Engineer (React Native)',
    'iOS Engineer', 'Android Engineer', 'DevOps Engineer', 'Engineering Manager',
    'Principal Software Engineer', 'Junior Software Engineer',
  ]},
  { folder: 'AI / ML', titles: [
    'Machine Learning Engineer', 'AI Research Engineer', 'LLM Applications Engineer',
    'MLOps Engineer', 'Data Scientist (NLP)', 'Computer Vision Engineer', 'Prompt Engineer',
  ]},
  { folder: 'Data', titles: [
    'Senior Data Engineer', 'Analytics Engineer', 'Data Analyst', 'BI Engineer',
    'Data Platform Engineer',
  ]},
  { folder: 'Design', titles: [
    'Senior Product Designer', 'Brand Designer', 'Design Engineer', 'UX Researcher',
    'Motion Designer', 'Design Lead',
  ]},
  { folder: 'Product', titles: [
    'Product Manager', 'Senior PM, Growth', 'Group Product Manager', 'Technical PM',
  ]},
  { folder: 'Marketing', titles: [
    'Content Marketing Manager', 'Performance Marketing Lead', 'Lifecycle Marketing Manager',
    'Brand Marketing Manager', 'SEO Strategist',
  ]},
  { folder: 'Sales', titles: [
    'Account Executive (Mid-Market)', 'Enterprise AE', 'SDR', 'Sales Engineer',
    'Customer Success Manager',
  ]},
  { folder: 'Operations', titles: [
    'Recruiter', 'People Ops Manager', 'Finance Analyst', 'Business Operations Lead',
  ]},
];

const LOCATIONS = [
  { city: 'Remote · Worldwide',   remote: true  },
  { city: 'Remote · EMEA',        remote: true  },
  { city: 'Remote · Americas',    remote: true  },
  { city: 'Remote · Asia',        remote: true  },
  { city: 'San Francisco, CA',    remote: false },
  { city: 'New York, NY',         remote: false },
  { city: 'London, UK',           remote: false },
  { city: 'Berlin, Germany',      remote: false },
  { city: 'Toronto, Canada',      remote: false },
  { city: 'Amsterdam, NL',        remote: false },
  { city: 'Dubai, UAE',           remote: false },
  { city: 'Singapore',            remote: false },
  { city: 'Karachi, Pakistan',    remote: false },
  { city: 'Lahore, Pakistan',     remote: false },
  { city: 'Islamabad, Pakistan',  remote: false },
];

const LEVELS = ['Junior', 'Mid', 'Senior', 'Staff', 'Lead'];
const TYPES  = ['Full-time', 'Contract', 'Part-time', 'Internship'];

const TAG_POOL = [
  'React', 'TypeScript', 'Node.js', 'Next.js', 'Python', 'Go', 'Rust', 'Java',
  'AWS', 'GCP', 'Azure', 'Kubernetes', 'Docker', 'GraphQL', 'PostgreSQL',
  'Tailwind', 'Figma', 'Swift', 'Kotlin', 'LLMs', 'PyTorch', 'TensorFlow',
];

function pick(arr, seed) { return arr[seed % arr.length]; }
function pickWeighted(items, seed) {
  const total = items.reduce((s, it) => s + it.weight, 0);
  let n = seed % total;
  for (const it of items) {
    if (n < it.weight) return it;
    n -= it.weight;
  }
  return items[0];
}
function rand(seed, salt = 1) {
  const x = Math.sin((seed + 1) * 9301 * salt + 49297) * 233280;
  return x - Math.floor(x);
}

export function generateMockJobs(count = 1000) {
  const jobs = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const source   = pickWeighted(SOURCES, i + 1);
    const role     = pick(ROLES, Math.floor(rand(i, 3) * 1000));
    const title    = pick(role.titles, Math.floor(rand(i, 7) * 1000));
    const company  = pick(COMPANIES, Math.floor(rand(i, 11) * 1000));
    const loc      = pick(LOCATIONS, Math.floor(rand(i, 13) * 1000));
    const level    = pick(LEVELS, Math.floor(rand(i, 17) * 1000));
    const type     = pick(TYPES, Math.floor(rand(i, 19) * 1000));
    // Freshness bias: ~70% under 60min, ~25% 60–180min, ~5% 180–300min. Auto-prune anything older than 5h.
    const r = rand(i + Math.floor(now / 60000), 23); // re-rolls each minute so feed feels live
    let ageMin;
    if      (r < 0.70) ageMin = 5  + Math.floor(r * 80);          // 5–60m
    else if (r < 0.95) ageMin = 60 + Math.floor((r - 0.7) * 480); // 60–180m
    else               ageMin = 180 + Math.floor((r - 0.95) * 2400); // 180–300m
    if (ageMin > 300) continue; // hard prune over 5h
    const salaryLo = 60 + Math.floor(rand(i, 29) * 120);
    const salaryHi = salaryLo + 20 + Math.floor(rand(i, 31) * 60);
    const tags = [];
    for (let t = 0; t < 4; t++) {
      const tag = pick(TAG_POOL, Math.floor(rand(i, 37 + t) * 1000));
      if (!tags.includes(tag)) tags.push(tag);
    }
    const queryStr = encodeURIComponent(title);
    jobs.push({
      id: `mock-${i}`,
      title,
      company,
      source: source.name,
      sourceColor: source.color,
      folder: role.folder,
      level,
      type,
      remote: loc.remote,
      location: loc.city,
      salary: `$${salaryLo}k–$${salaryHi}k`,
      salaryMin: salaryLo,
      salaryMax: salaryHi,
      tags,
      postedAt: new Date(now - ageMin * 60 * 1000).toISOString(),
      ageMinutes: ageMin,
      // Real, working URLs that point to the source's job search.
      url: `${source.search}${queryStr}`,
      sourceHome: source.base,
      description:
        `${company} is hiring a ${title}. You'll work with a senior team on production-grade software, ` +
        `using ${tags.slice(0, 3).join(', ')}. ${loc.remote ? 'Fully remote.' : `Onsite in ${loc.city}.`}`,
    });
  }
  return jobs;
}

export const SOURCE_LIST = SOURCES.map((s) => s.name);
export const FOLDER_LIST = ROLES.map((r) => r.folder);
export const LEVEL_LIST  = LEVELS;
export const TYPE_LIST   = TYPES;

export function formatRelative(iso) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
