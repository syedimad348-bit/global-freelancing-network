const axios = require("axios");

const JOB_MAX_AGE_HOURS = 48;
const JOB_FRESH_HOURS = 6;

let cache = { jobs: [], updatedAt: null, warning: null };
let jsearchCallCount = 0;
const JSEARCH_MONTHLY_LIMIT = 185;

const PAKISTAN_CITIES = ["lahore", "karachi", "islamabad", "peshawar", "faisalabad", "rawalpindi", "multan", "sialkot"];
const REMOTE_KEYWORDS = ["remote", "worldwide", "global", "distributed", "work from home", "virtual"];
const HYBRID_KEYWORDS = ["hybrid", "hybrid remote"];

function classifyJob(job) {
  const combined = [job.location, job.title, job.company].join(" ").toLowerCase();
  const hasRemote = REMOTE_KEYWORDS.some((k) => combined.includes(k));
  const hasHybrid = HYBRID_KEYWORDS.some((k) => combined.includes(k));
  let remoteType = "remote";
  if (hasHybrid) remoteType = "hybrid";
  else if (!hasRemote) remoteType = "onsite";

  let country = "Worldwide";
  if (/pakistan/i.test(combined)) country = "Pakistan";
  else if (/united states|usa|\bus\b/i.test(combined)) country = "United States";
  else if (/united kingdom|uk|london/i.test(combined)) country = "United Kingdom";
  else if (/canada/i.test(combined)) country = "Canada";
  else if (/australia|sydney|melbourne/i.test(combined)) country = "Australia";

  return { remoteType, country };
}

const JSEARCH_QUERIES = [
  { q: "fullstack developer remote",          datePosted: "week", publisher: "upwork" },
  { q: "react developer remote",              datePosted: "week", publisher: "upwork" },
  { q: "web developer remote",                datePosted: "week", publisher: "upwork" },
  { q: "python developer remote",             datePosted: "week", publisher: "upwork" },
  { q: "mobile app developer remote",         datePosted: "week", publisher: "upwork" },
  { q: "graphic designer remote",             datePosted: "week", publisher: "upwork" },
  { q: "content writer remote",               datePosted: "week", publisher: "upwork" },
  { q: "data analyst remote",                 datePosted: "week", publisher: "upwork" },
  { q: "software engineer Lahore",            datePosted: "week" },
  { q: "web developer Karachi",               datePosted: "week" },
  { q: "frontend developer Islamabad",        datePosted: "week" },
  { q: "mobile developer Lahore",             datePosted: "week" },
  { q: "python developer Karachi",            datePosted: "week" },
  { q: "digital marketing Lahore",            datePosted: "week" },
  { q: "graphic designer Islamabad",          datePosted: "week" },
  { q: "seo specialist Karachi",              datePosted: "week" },
  { q: "ui ux designer Lahore",               datePosted: "week" },
  { q: "ai automation engineer remote",       datePosted: "week" },
  { q: "machine learning engineer remote",    datePosted: "week", publisher: "linkedin" },
  { q: "devops engineer remote",              datePosted: "week" },
  { q: "product manager remote",              datePosted: "week" },
  { q: "sales development representative",    datePosted: "week" },
  { q: "seo specialist remote",               datePosted: "week" },
  { q: "virtual assistant remote",            datePosted: "week" },
  { q: "shopify developer remote",            datePosted: "week" },
  { q: "nextjs developer remote",             datePosted: "week" },
  { q: "social media manager remote",         datePosted: "week" },
  { q: "animation motion graphics remote",      datePosted: "week" },
  { q: "3d modeling artist remote",             datePosted: "week" },
  { q: "cybersecurity analyst remote",        datePosted: "week" },
];

let jsearchRotateIdx = 0;

function mapFolder(title = "", category = "") {
  const t = `${title} ${category}`.toLowerCase();
  if (/(video edit|premiere|after effect|davinci|filmmaker)/.test(t)) return "Video Editing";
  if (/(motion graphic|animation|animated|2d|3d|blender|maya|cinema 4d)/.test(t)) return "Animation & Motion";
  if (/(graphic design|illustrat|photoshop|brand design|visual design)/.test(t)) return "Graphic Design";
  if (/(ui.ux|ux design|user experience|user interface|product design|figma)/.test(t)) return "UI/UX Design";
  if (/(3d model|3d artist|cad|solidworks|rhino|zbrush)/.test(t)) return "3D Modeling";
  if (/(ai automat|ai chatbot|langchain|llm|gpt|openai|prompt engineer|nlp|deep learn)/.test(t)) return "AI & Automation";
  if (/(machine learn|data scien|mlops|pytorch|tensorflow)/.test(t)) return "Machine Learning";
  if (/(python|django|flask|fastapi|data engineer)/.test(t)) return "Python Development";
  if (/(react|next\.?js|vue|angular|svelte|frontend|front-end)/.test(t)) return "Web Development";
  if (/(full.?stack|fullstack|node\.?js|backend|back-end)/.test(t)) return "Full-Stack Development";
  if (/(mobile|ios|android|react native|flutter|swift|kotlin)/.test(t)) return "Mobile App Development";
  if (/(shopify|woocommerce|e.?commerce|ecommerce)/.test(t)) return "E-commerce & Shopify";
  if (/(wordpress|cms|webflow|wix)/.test(t)) return "WordPress & CMS";
  if (/(devops|kubernetes|docker|terraform|aws|azure|gcp|sre)/.test(t)) return "DevOps & Cloud";
  if (/(cybersecur|penetrat|infosec)/.test(t)) return "Cybersecurity";
  if (/(seo|search engine optim)/.test(t)) return "SEO";
  if (/(content writ|copywrite|copywriting|blog|editorial|technical writ)/.test(t)) return "Content & Copywriting";
  if (/(digital market|performance market|growth|paid ads|ppc)/.test(t)) return "Digital Marketing";
  if (/(social media|community manag|instagram|tiktok)/.test(t)) return "Social Media";
  if (/(data analyst|business intelligence|tableau|power bi)/.test(t)) return "Data Analytics";
  if (/(virtual assistant|executive assistant|admin)/.test(t)) return "Virtual Assistant";
  if (/(voice over|voiceover|narrator|podcast)/.test(t)) return "Voice Over";
  if (/(sales|account exec|bdr|sdr)/.test(t)) return "Sales";
  if (/(customer success|customer support|help desk)/.test(t)) return "Customer Support";
  if (/(finance|accountant|bookkeep|payroll|cpa)/.test(t)) return "Finance";
  if (/(hr |recruiter|talent|people ops)/.test(t)) return "HR & Recruiting";
  if (/(health|medical|wellness|nurse|clinical)/.test(t)) return "Health";
  if (/(freelance|contract|gig)/.test(t)) return "Freelance";
  if (/(software engineer|developer|engineer|programmer)/.test(t)) return "Software Engineering";
  return "General";
}

function uniqByUrl(items) {
  const seen = new Set();
  const now = new Date();
  const cutoff = new Date(now.getTime() - JOB_MAX_AGE_HOURS * 60 * 60 * 1000);
  return items.filter((item) => {
    if (!item.url || seen.has(item.url)) return false;
    const posted = item.postedAt ? new Date(item.postedAt) : null;
    const fetched = item.fetchedAt ? new Date(item.fetchedAt) : now;
    const ageBase = posted && !isNaN(posted.getTime()) ? posted : fetched;
    if (ageBase < cutoff) return false;
    seen.add(item.url);
    return true;
  });
}

function makeJob(overrides) {
  const now = new Date();
  const base = { fetchedAt: now.toISOString() };
  const merged = { ...base, ...overrides };
  if (!merged.postedAt) merged.postedAt = now.toISOString();
  if (typeof merged.postedAt === 'string') merged.postedAt = new Date(merged.postedAt);
  const classification = classifyJob(merged);
  return { ...merged, remoteType: merged.remoteType || classification.remoteType, country: merged.country || classification.country };
}

async function httpGet(url, options = {}) {
  try {
    const res = await axios.get(url, {
      timeout: 15000,
      headers: { "User-Agent": "GlobalFreelancingNetwork/1.0 (+https://globalfreelancing.net)" },
      ...options,
    });
    return res.data;
  } catch (err) {
    return null;
  }
}

function parseDate(value) {
  if (!value) return new Date();
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
}

async function parseRSS(xml, itemSpec) {
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  const all = [];
  for (const item of items) {
    try {
      const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || [])[1]
                  || (item.match(/<title>(.*?)<\/title>/) || [])[1] || "";
      const link  = (item.match(/<link>(.*?)<\/link>/) || [])[1] || "";
      const pub   = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || "";
      const desc  = (item.match(/<description>(.*?)<\/description>/) || [])[1] || "";
      if (!title || !link) continue;
      const parts = title.split(" at ");
      const jobTitle = parts[0]?.trim() || title;
      const company = parts[1]?.trim() || "Company";
      all.push(itemSpec({ title: jobTitle, company, link, pub, desc }));
    } catch {
      // skip malformed item
    }
  }
  return all;
}

async function fetchRemotive() {
  const data = await httpGet("https://remotive.com/api/remote-jobs?limit=100");
  if (!data) return [];
  return (data.jobs || []).map((j) => makeJob({
    _id: `remotive-${encodeURIComponent(j.url)}`,
    title: j.title, company: j.company_name || "Company",
    location: j.candidate_required_location || "Remote",
    url: j.url, source: "Remotive",
    type: j.job_type || "Remote",
    category: j.category || "Tech",
    folder: mapFolder(j.title, j.category || ""),
    postedAt: j.publication_date || null,
  }));
}

async function fetchRemoteOK() {
  const data = await httpGet("https://remoteok.com/api", {
    headers: { "User-Agent": "GlobalFreelancingNetwork/1.0" },
  });
  if (!data) return [];
  return Array.isArray(data) ? data.filter((j) => j.id && j.position).slice(0, 120).map((j) => makeJob({
    _id: `remoteok-${j.id}`,
    title: j.position, company: j.company || "Company",
    location: "Remote",
    url: j.url ? `https://remoteok.com${j.url}` : `https://remoteok.com/remote-jobs/${j.id}`,
    source: "RemoteOK", type: "Remote",
    category: (j.tags || [])[0] || "Tech",
    folder: mapFolder(j.position, (j.tags || []).join(" ")),
    salary: j.salary_min && j.salary_max
      ? `$${Math.round(j.salary_min / 1000)}k–$${Math.round(j.salary_max / 1000)}k` : "",
    postedAt: j.date || null,
  })) : [];
}

async function fetchArbeitnow() {
  const all = [];
  for (let page = 1; page <= 4; page++) {
    const data = await httpGet(`https://www.arbeitnow.com/api/job-board-api?page=${page}`);
    if (!data) break;
    const jobs = data.data || [];
    if (!jobs.length) break;
    all.push(...jobs.map((j) => makeJob({
      _id: `arbeit-${encodeURIComponent(j.url)}`,
      title: j.title, company: j.company_name || "Company",
      location: j.location || "Remote", url: j.url,
      source: "Arbeitnow", type: j.job_types?.[0] || "Full-time",
      category: j.tags?.[0] || "Tech",
      folder: mapFolder(j.title, (j.tags || []).join(" ")),
      postedAt: j.created_at || null,
    })));
  }
  return all;
}

async function fetchJobicy() {
  const data = await httpGet("https://jobicy.com/api/v2/remote-jobs?count=100");
  if (!data) return [];
  return (data.jobs || []).map((j) => makeJob({
    _id: `jobicy-${encodeURIComponent(j.url)}`,
    title: j.jobTitle, company: j.companyName || "Company",
    location: j.jobGeo || "Remote", url: j.url,
    source: "Jobicy", type: j.jobType || "Full-time",
    category: j.jobIndustry?.[0] || "Tech",
    folder: mapFolder(j.jobTitle, (j.jobIndustry || []).join(" ")),
    postedAt: j.jobPublished || null,
  }));
}

async function fetchWeWorkRemotely() {
  const feeds = [
    { url: "https://weworkremotely.com/remote-jobs.rss", cat: "Tech" },
    { url: "https://weworkremotely.com/categories/remote-programming-jobs.rss", cat: "Programming" },
    { url: "https://weworkremotely.com/categories/remote-design-jobs.rss", cat: "Design" },
    { url: "https://weworkremotely.com/categories/remote-marketing-jobs.rss", cat: "Marketing" },
    { url: "https://weworkremotely.com/categories/remote-sales-jobs.rss", cat: "Sales" },
    { url: "https://weworkremotely.com/categories/remote-customer-jobs.rss", cat: "Customer Support" },
  ];
  const all = [];
  for (const feed of feeds) {
    const xml = await httpGet(feed.url, {
      headers: { "Accept": "application/rss+xml, text/xml" },
    });
    if (!xml) continue;
    const jobs = await parseRSS(xml, ({ title, company, link, pub }) => makeJob({
      _id: `wwr-${encodeURIComponent(link)}`,
      title, company, location: "Remote", url: link,
      source: "WeWorkRemotely", type: "Remote", category: feed.cat,
      folder: mapFolder(title, feed.cat),
      postedAt: parseDate(pub),
    }));
    all.push(...jobs);
  }
  return all;
}

async function fetchRemoteCo() {
  const xml = await httpGet("https://remote.co/feed/", {
    headers: { "Accept": "application/rss+xml, text/xml" },
  });
  if (!xml) return [];
  return parseRSS(xml, ({ title, company, link, pub }) => makeJob({
    _id: `remoteco-${encodeURIComponent(link)}`,
    title, company, location: "Remote", url: link,
    source: "Remote.co", type: "Remote", category: "Tech",
    folder: mapFolder(title, "Tech"),
    postedAt: parseDate(pub),
  }));
}

async function fetchSkipTheDrive() {
  const xml = await httpGet("https://skipthedrive.com/feed.xml", {
    headers: { "Accept": "application/rss+xml, text/xml" },
  });
  if (!xml) return [];
  return parseRSS(xml, ({ title, company, link, pub }) => {
    let location = "Remote";
    const lowerCompany = (company || "").toLowerCase();
    if (PAKISTAN_CITIES.some((city) => lowerCompany.includes(city))) {
      location = company.replace(/\s+/g, " ").trim();
    }
    return makeJob({
      _id: `skip-${encodeURIComponent(link)}`,
      title, company, location, url: link,
      source: "Skip The Drive", type: "Remote", category: "Tech",
      folder: mapFolder(title, "Tech"),
      postedAt: parseDate(pub),
    });
  });
}

async function fetchWorkingNomads() {
  const xml = await httpGet("https://workingnomads.com/jobs/feed/");
  if (!xml) return [];
  return parseRSS(xml, ({ title, company, link, pub }) => makeJob({
    _id: `wgn-${encodeURIComponent(link)}`,
    title, company, location: "Remote", url: link,
    source: "Working Nomads", type: "Remote", category: "Tech",
    folder: mapFolder(title, "Tech"),
    postedAt: parseDate(pub),
  }));
}

async function fetchJobspresso() {
  const xml = await httpGet("https://jobspresso.co/feed/");
  if (!xml) return [];
  return parseRSS(xml, ({ title, company, link, pub }) => makeJob({
    _id: `jspresso-${encodeURIComponent(link)}`,
    title, company, location: "Remote", url: link,
    source: "Jobspresso", type: "Remote", category: "Tech",
    folder: mapFolder(title, "Tech"),
    postedAt: parseDate(pub),
  }));
}

async function fetchWellfound() {
  const xml = await httpGet("https://wellfound.com/jobs/feed/rss", {
    headers: { "Accept": "application/rss+xml, text/xml" },
  });
  if (!xml) return [];
  return parseRSS(xml, ({ title, company, link, pub }) => makeJob({
    _id: `wellfound-${encodeURIComponent(link)}`,
    title, company, location: "Remote", url: link,
    source: "Wellfound", type: "Contract", category: "Startup",
    folder: mapFolder(title, "Startup"),
    postedAt: parseDate(pub),
  }));
}

async function fetchJSearchBatch() {
  if (!process.env.RAPIDAPI_KEY) return [];
  if (jsearchCallCount >= JSEARCH_MONTHLY_LIMIT) {
    console.log(`JSearch monthly limit reached (${jsearchCallCount}/${JSEARCH_MONTHLY_LIMIT}), skipping`);
    return [];
  }

  const QUERIES_PER_RUN = 1;
  const batch = [];
  for (let i = 0; i < QUERIES_PER_RUN; i++) {
    batch.push(JSEARCH_QUERIES[(jsearchRotateIdx + i) % JSEARCH_QUERIES.length]);
  }
  jsearchRotateIdx = (jsearchRotateIdx + QUERIES_PER_RUN) % JSEARCH_QUERIES.length;

  const all = [];
  for (const q of batch) {
    if (jsearchCallCount >= JSEARCH_MONTHLY_LIMIT) break;
    try {
      const res = await axios.get("https://jsearch.p.rapidapi.com/search", {
        params: {
          query: q.q,
          page: "1",
          num_pages: "2",
          date_posted: q.datePosted || "week",
          remote_jobs_only: "false",
        },
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
        timeout: 20000,
      });
      jsearchCallCount++;
      const jobs = res.data.data || [];
      for (const job of jobs) {
        const url = job.job_apply_link || job.job_google_link;
        if (!url) continue;
        const publisher = (job.job_publisher || "").toLowerCase();
        let source = "Indeed";
        if (publisher.includes("linkedin"))     source = "LinkedIn";
        else if (publisher.includes("upwork")) source = "Upwork";
        else if (publisher.includes("glassdoor")) source = "Glassdoor";
        else if (publisher.includes("zip"))    source = "ZipRecruiter";
        else if (publisher.includes("lever"))  source = "Lever";
        else if (publisher.includes("greenhouse")) source = "Greenhouse";
        else if (job.job_publisher)             source = job.job_publisher;

        const location = job.job_city
          ? `${job.job_city}, ${job.job_country}`
          : (job.job_country || "Worldwide");

        all.push(makeJob({
          _id: `jsearch-${encodeURIComponent(url)}`,
          title: job.job_title,
          company: job.employer_name || "Company",
          location, url, source,
          type: job.job_employment_type || "Full-time",
          category: q.q,
          folder: mapFolder(job.job_title, q.q),
          salary: job.job_min_salary
            ? `$${Math.round(job.job_min_salary)}${job.job_max_salary ? `–$${Math.round(job.job_max_salary)}` : "+"}`
            : "",
          postedAt: job.job_posted_at_datetime_utc || null,
        }));
      }
      await new Promise((r) => setTimeout(r, 400));
    } catch (e) {
      console.log(`JSearch error (${q.q}):`, e.message);
    }
  }
  console.log(`JSearch batch done — ${jsearchCallCount}/${JSEARCH_MONTHLY_LIMIT} used, ${all.length} jobs`);
  return all;
}

// ── Source definitions: name → fetcher function ────────────────────────────────
const SOURCES = [
  ["Remotive",        fetchRemotive],
  ["RemoteOK",        fetchRemoteOK],
  ["WeWorkRemotely",  fetchWeWorkRemotely],
  ["Arbeitnow",       fetchArbeitnow],
  ["Jobicy",          fetchJobicy],
  ["Remote.co",       fetchRemoteCo],
  ["Skip The Drive",  fetchSkipTheDrive],
  ["WorkingNomads",   fetchWorkingNomads],
  ["Jobspresso",      fetchJobspresso],
  ["Wellfound",       fetchWellfound],
  ["JSearch",         fetchJSearchBatch],
];

async function refreshLiveJobCache() {
  const sourceNames = SOURCES.map(([n]) => n);
  const fetchers    = SOURCES.map(([, fn]) => fn);
  const failed = [];

  const results = await Promise.allSettled(fetchers.map((fn) => fn()));

  const jobs = [];
  results.forEach((r, idx) => {
    if (r.status === "fulfilled") jobs.push(...r.value);
    else {
      failed.push(sourceNames[idx]);
      console.log(`✗ ${sourceNames[idx]}: ${r.reason?.message || 'unknown error'}`);
    }
  });

  cache.jobs = uniqByUrl(jobs)
    .sort((a, b) => {
      const ta = a.postedAt ? new Date(a.postedAt).getTime() : 0;
      const tb = b.postedAt ? new Date(b.postedAt).getTime() : 0;
      return tb - ta;
    });
  cache.updatedAt = new Date().toISOString();
  cache.warning = failed.length ? `Temporarily unavailable: ${failed.join(", ")}` : null;
  console.log(`Live cache: ${cache.jobs.length} jobs | JSearch: ${jsearchCallCount}/${JSEARCH_MONTHLY_LIMIT} | failed: ${failed.length ? failed.join(",") : "none"} | sources: ${sourceNames.join(", ")}`);
  return cache;
}

function getLiveJobCache() { return cache; }
function getJSearchCount() { return jsearchCallCount; }
module.exports = { refreshLiveJobCache, getLiveJobCache, getJSearchCount };
