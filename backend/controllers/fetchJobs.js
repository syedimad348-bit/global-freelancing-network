const axios = require("axios");
const Job = require("../models/Job");
const User = require("../models/User");
const { beginSync, sourceDone, endSync } = require("../services/jobSyncState");

// ── JSearch request counter (in-memory, resets on restart) ──────────────────
let jsearchMonthlyCount = 0;
const JSEARCH_MONTHLY_LIMIT = 185;

// ── Job expiry + cleanup configuration ───────────────────────────────────────
const JOB_MAX_AGE_HOURS = 48;
const JOB_FRESH_HOURS = 48;
const SALVED_JOB_MAX_AGE_HOURS = 48;

// ── Remote/country/remote-type detection helpers ──────────────────────────────
const PAKISTAN_CITIES = ["lahore", "karachi", "islamabad", "peshawar", "faisalabad", "rawalpindi", "multan", "guiadrak", "sialkot"];
const REMOTE_KEYWORDS = ["remote", "worldwide", "global", "distributed", "work from home", "virtual", "home office"];
const HYBRID_KEYWORDS = ["hybrid", "hybrid remote", "remote-first", "mix of office"];

// Sources that are exclusively remote/flexible � their jobs default to remote
const REMOTE_SOURCES = new Set([
  "Remotive", "RemoteOK", "WeWorkRemotely", "Remote.co", "Skip The Drive",
  "Working Nomads", "Jobspresso", "Wellfound", "Himalayas", "AI Dev Jobs",
  "Artificial Intelligence Jobs", "MarketersHire", "MarketingJobsBoard",
  "Dribbble", "ProBlogger", "Freelancer", "Upwork",
]);

function classifyJob(job, sourceHint = "") {
  const location = (job.location || "").toLowerCase();
  const title = (job.title || "").toLowerCase();
  const company = (job.company || "").toLowerCase();
  const combined = [location, title, company].join(" ");

  const hasRemote = REMOTE_KEYWORDS.some((k) => combined.includes(k));
  const hasHybrid = HYBRID_KEYWORDS.some((k) => combined.includes(k));
  const isRemoteSource = REMOTE_SOURCES.has(sourceHint);

  let remoteType = "remote";
  if (hasHybrid) remoteType = "hybrid";
  else if (hasRemote) remoteType = "remote";
  else if (isRemoteSource) remoteType = "remote";
  else remoteType = "unknown";

  const lowerLocation = (job.location || "").toLowerCase();
  let country = "";
  if (/pakistan/i.test(lowerLocation)) {
    country = "Pakistan";
  } else if (/usa|united states|america|us\b/i.test(lowerLocation)) {
    country = "United States";
  } else if (/uk|united kingdom|britain|london/i.test(lowerLocation)) {
    country = "United Kingdom";
  } else if (/canada/i.test(lowerLocation)) {
    country = "Canada";
  } else if (/australia|sydney|melbourne/i.test(lowerLocation)) {
    country = "Australia";
  } else {
    country = "Worldwide";
  }

  return { remoteType, country };
}

function normalizeFolder(text = "") {
  const t = text.toLowerCase();
  if (/(video edit|premiere|after effect|davinci|filmmaker)/.test(t)) return "Video Editing";
  if (/(motion graphic|animation|animated|2d|3d|blender|maya|cinema 4d)/.test(t)) return "Animation & Motion";
  if (/(graphic design|illustrat|photoshop|brand design|visual design)/.test(t)) return "Graphic Design";
  if (/(ui.ux|ux design|user experience|user interface|product design|figma|sketch)/.test(t)) return "UI/UX Design";
  if (/(3d model|3d artist|cad|solidworks|rhino|zbrush)/.test(t)) return "3D Modeling";
  if (/(ai automat|ai chatbot|langchain|llm|gpt|openai|prompt engineer|nlp|deep learn)/.test(t)) return "AI & Automation";
  if (/(machine learn|data scien|mlops|pytorch|tensorflow|computer vision)/.test(t)) return "Machine Learning";
  if (/(python|django|flask|fastapi|data engineer)/.test(t)) return "Python Development";
  if (/(react|next\.?js|vue|angular|svelte|frontend|front-end|front end)/.test(t)) return "Web Development";
  if (/(full.?stack|fullstack|node\.?js|backend|back-end)/.test(t)) return "Full-Stack Development";
  if (/(mobile|ios|android|react native|flutter|swift|kotlin)/.test(t)) return "Mobile App Development";
  if (/(shopify|woocommerce|e.?commerce|ecommerce|magento)/.test(t)) return "E-commerce & Shopify";
  if (/(wordpress|cms|webflow|wix)/.test(t)) return "WordPress & CMS";
  if (/(devops|kubernetes|docker|terraform|cloud|aws|azure|gcp|sre|platform engineer)/.test(t)) return "DevOps & Cloud";
  if (/(cybersecur|penetrat|infosec|soc analyst|ethical hack)/.test(t)) return "Cybersecurity";
  if (/(seo|search engine optim)/.test(t)) return "SEO";
  if (/(content writ|copywrite|copywriting|blog|editorial|technical writ)/.test(t)) return "Content & Copywriting";
  if (/(digital market|performance market|growth market|paid ads|ppc|sem)/.test(t)) return "Digital Marketing";
  if (/(social media|community manag|instagram|tiktok|youtube)/.test(t)) return "Social Media";
  if (/(data analyst|business intelligence|bi |tableau|power bi|looker)/.test(t)) return "Data Analytics";
  if (/(virtual assistant|executive assistant|admin|operations)/.test(t)) return "Virtual Assistant";
  if (/(voice over|voiceover|narrator|podcast)/.test(t)) return "Voice Over";
  if (/(sales|account exec|bdr|sdr|business dev)/.test(t)) return "Sales";
  if (/(customer success|customer support|help desk|cx )/.test(t)) return "Customer Support";
  if (/(finance|accountant|bookkeep|payroll|cpa)/.test(t)) return "Finance";
  if (/(hr |recruiter|talent|people ops)/.test(t)) return "HR & Recruiting";
  if (/(health|medical|wellness|nurse|clinical)/.test(t)) return "Health";
  if (/(freelance|contract|gig)/.test(t)) return "Freelance";
  if (/(software engineer|developer|engineer|programmer)/.test(t)) return "Software Engineering";
  return "General";
}

// ── Safe URL builder: never lose the original link ───────────────────────────
function makeJobUrl(rawUrl, source, fallback) {
  try {
    return rawUrl || fallback || `https://${source}.com`;
  } catch {
    return fallback || "https://example.com";
  }
}

// ── Parse RSS date robustly ───────────────────────────────────────────────────
function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d;
  return null;
}

async function saveJob(data) {
  try {
    if (!data.url || !data.title) return false;
    const normalizedUrl = data.url.trim();
    const exists = await Job.findOne({ url: normalizedUrl });
    if (exists) {
      await Job.updateOne(
        { url: normalizedUrl },
        {
          $set: {
            fetchedAt: new Date(),
            sourceHealth: Math.min((exists.sourceHealth || 1) + 1, 3),
            sourceFailures: Math.max((exists.sourceFailures || 0) - 1, 0),
          },
        }
      );
      return false;
    }
    const { remoteType, country } = classifyJob(data, data.source);
    const folder = normalizeFolder(`${data.title} ${data.category || ""}`);
    await Job.create({
      ...data,
      url: normalizedUrl,
      folder,
      remoteType,
      country,
      tags: [...new Set([folder, data.source, data.type, remoteType, country].filter(Boolean))],
      postedAt: data.postedAt ? new Date(data.postedAt) : null,
      fetchedAt: new Date(),
    });
    return true;
  } catch (e) {
    return false;
  }
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

// ── REMOTIVE ──────────────────────────────────────────────────────────────────
async function fetchRemotive() {
  const data = await httpGet("https://remotive.com/api/remote-jobs?limit=100");
  if (!data) return 0;
  const jobs = data.jobs || [];
  let saved = 0;
  for (const job of jobs) {
    const ok = await saveJob({
      title: job.title, company: job.company_name || "Company",
      location: job.candidate_required_location || "Remote",
      url: job.url, source: "Remotive",
      type: job.job_type || "Full-time",
      category: job.category || "Tech",
      postedAt: job.publication_date ? new Date(job.publication_date) : null,
    });
    if (ok) saved++;
  }
  return saved;
}

// ── REMOTEOK ──────────────────────────────────────────────────────────────────
async function fetchRemoteOK() {
  const data = await httpGet("https://remoteok.com/api", {
    headers: { "User-Agent": "GlobalFreelancingNetwork/1.0" },
  });
  if (!data) return 0;
  const jobs = Array.isArray(data) ? data.filter((j) => j.id && j.position) : [];
  let saved = 0;
  for (const job of jobs) {
    const url = makeJobUrl(job.url, "RemoteOK", `https://remoteok.com/remote-jobs/${job.id}`);
    const ok = await saveJob({
      title: job.position, company: job.company || "Company",
      location: "Remote", url, source: "RemoteOK", type: "Remote",
      category: (job.tags || [])[0] || "Tech",
      salary: job.salary_min && job.salary_max
        ? `$${Math.round(job.salary_min / 1000)}k–$${Math.round(job.salary_max / 1000)}k` : "",
      postedAt: job.date ? new Date(job.date) : null,
    });
    if (ok) saved++;
  }
  return saved;
}

// ── WE WORK REMOTELY (RSS, curated remote) ───────────────────────────────────
async function fetchWeWorkRemotely() {
  const feeds = [
    { url: "https://weworkremotely.com/remote-jobs.rss", cat: "Tech" },
    { url: "https://weworkremotely.com/categories/remote-design-jobs.rss", cat: "Design" },
    { url: "https://weworkremotely.com/categories/remote-programming-jobs.rss", cat: "Programming" },
    { url: "https://weworkremotely.com/categories/remote-marketing-jobs.rss", cat: "Marketing" },
    { url: "https://weworkremotely.com/categories/remote-sales-jobs.rss", cat: "Sales" },
    { url: "https://weworkremotely.com/categories/remote-customer-jobs.rss", cat: "Customer Support" },
  ];
  let saved = 0;
  for (const feed of feeds) {
    const xml = await httpGet(feed.url, {
      headers: { "Accept": "application/rss+xml, text/xml" },
    });
    if (!xml) {
      console.log(`WWR feed skipped (${feed.cat}): unavailable`);
      continue;
    }
    const jobs = await parseRSS(xml, ({ title, company, link, pub }) => ({
      title, company, location: "Remote", url: link,
      source: "WeWorkRemotely", type: "Remote", category: feed.cat,
      postedAt: parseDate(pub),
    }));
    for (const job of jobs) {
      if (await saveJob(job)) saved++;
    }
  }
  return saved;
}

// ── ARBEITNOW ─────────────────────────────────────────────────────────────────
async function fetchArbeitnow() {
  let all = [];
  for (let page = 1; page <= 4; page++) {
    const data = await httpGet(`https://www.arbeitnow.com/api/job-board-api?page=${page}`);
    if (!data) break;
    const jobs = data.data || [];
    if (!jobs.length) break;
    all = all.concat(
      jobs.map((j) => ({
        title: j.title, company: j.company_name || "Company",
        location: j.location || "Remote", url: j.url,
        source: "Arbeitnow", type: j.job_types?.[0] || "Full-time",
        category: j.tags?.[0] || "Tech",
        postedAt: j.created_at ? new Date(j.created_at) : null,
      }))
    );
  }
  let saved = 0;
  for (const job of all) {
    if (await saveJob(job)) saved++;
  }
  return saved;
}

// ── JOBICY ────────────────────────────────────────────────────────────────────
async function fetchJobicy() {
  const data = await httpGet("https://jobicy.com/api/v2/remote-jobs?count=100");
  if (!data) return 0;
  const jobs = data.jobs || [];
  let saved = 0;
  for (const job of jobs) {
    const ok = await saveJob({
      title: job.jobTitle, company: job.companyName || "Company",
      location: job.jobGeo || "Remote", url: job.url, source: "Jobicy",
      type: job.jobType || "Full-time",
      category: job.jobIndustry?.[0] || "Tech",
      postedAt: job.jobPublished ? new Date(job.jobPublished) : null,
      salary: job.salaryMin && job.salaryMax
        ? `${job.salaryCurrency || "USD"} ${job.salaryMin}-${job.salaryMax}/${job.salaryPeriod || "year"}` : "",
    });
    if (ok) saved++;
  }
  return saved;
}

// ── REMOTE.CO (RSS) ───────────────────────────────────────────────────────────
async function fetchRemoteCo() {
  const xml = await httpGet("https://remote.co/feed/");
  if (!xml) {
    console.log("Remote.co skipped: feed unavailable");
    return 0;
  }
  const jobs = await parseRSS(xml, ({ title, company, link, pub }) => ({
    title, company, location: "Remote", url: link,
    source: "Remote.co", type: "Remote", category: "Tech",
    postedAt: parseDate(pub),
  }));
  let saved = 0;
  for (const job of jobs) {
    if (await saveJob(job)) saved++;
  }
  return saved;
}

// ── SKIP THE DRIVE (RSS — tech + Pakistan-friendly) ───────────────────────────
async function fetchSkipTheDrive() {
  const xml = await httpGet("https://skipthedrive.com/feed.xml", {
    headers: { "Accept": "application/rss+xml, text/xml" },
  });
  if (!xml) {
    console.log("Skip The Drive skipped: feed unavailable");
    return 0;
  }
  const jobs = await parseRSS(xml, ({ title, company, link, pub }) => {
    let location = "Remote";
    if (/(pakistan|lahore|karachi|islamabad|peshawar|rawalpindi)/i.test(company)) {
      location = company.replace(/\s+/g, " ");
    } else if (link.includes("pakistan")) {
      location = "Pakistan (Remote)";
    }
    return {
      title, company, location, url: link,
      source: "Skip The Drive", type: "Remote", category: "Tech",
      postedAt: parseDate(pub),
    };
  });
  let saved = 0;
  for (const job of jobs) {
    if (await saveJob(job)) saved++;
  }
  return saved;
}

// ── WORKING NOMADS (RSS) ──────────────────────────────────────────────────────
async function fetchWorkingNomads() {
  const xml = await httpGet("https://workingnomads.com/jobs/feed/");
  if (!xml) {
    console.log("Working Nomads skipped: feed unavailable");
    return 0;
  }
  const jobs = await parseRSS(xml, ({ title, company, link, pub }) => ({
    title, company, location: "Remote", url: link,
    source: "Working Nomads", type: "Remote", category: "Tech",
    postedAt: parseDate(pub),
  }));
  let saved = 0;
  for (const job of jobs) {
    if (await saveJob(job)) saved++;
  }
  return saved;
}

// ── JOBSPRESSO (RSS) ──────────────────────────────────────────────────────────
async function fetchJobspresso() {
  const xml = await httpGet("https://jobspresso.co/feed/");
  if (!xml) {
    console.log("Jobspresso skipped: feed unavailable");
    return 0;
  }
  const jobs = await parseRSS(xml, ({ title, company, link, pub }) => ({
    title, company, location: "Remote", url: link,
    source: "Jobspresso", type: "Remote", category: "Tech",
    postedAt: parseDate(pub),
  }));
  let saved = 0;
  for (const job of jobs) {
    if (await saveJob(job)) saved++;
  }
  return saved;
}

// ── WELLFOUND / ANGELLIST (RSS) ───────────────────────────────────────────────
async function fetchWellfound() {
  const xml = await httpGet("https://wellfound.com/jobs/feed/rss");
  if (!xml) {
    console.log("Wellfound skipped: feed unavailable");
    return 0;
  }
  const jobs = await parseRSS(xml, ({ title, company, link, pub }) => ({
    title, company, location: "Remote", url: link,
    source: "Wellfound", type: "Contract", category: "Startup",
    postedAt: parseDate(pub),
  }));
  let saved = 0;
  for (const job of jobs) {
    if (await saveJob(job)) saved++;
  }
  return saved;
}

// ── ADZUNA (paid API — requires ADZUNA_APP_ID/ADZUNA_APP_KEY) ──────────────────
async function fetchAdzuna() {
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) return 0;
  console.log("Fetching from Adzuna...");
  const countries = ["us", "gb", "au", "ca"];
  const queries = ["software developer", "web developer", "react developer", "data scientist"];
  let saved = 0;
  for (const country of countries) {
    for (const query of queries) {
      try {
        const res = await httpGet(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`, {
          params: { app_id: process.env.ADZUNA_APP_ID, app_key: process.env.ADZUNA_APP_KEY, results_per_page: 10, what: query },
        });
        if (!res || !res.results) continue;
        for (const job of res.results) {
          const ok = await saveJob({
            title: job.title, company: job.company?.display_name || "Company",
            location: job.location?.display_name || country.toUpperCase(),
            url: job.redirect_url, source: "Adzuna", type: "Full-time", category: query,
            salary: job.salary_min ? `$${Math.round(job.salary_min)}` : "",
            postedAt: job.created ? new Date(job.created) : null,
          });
          if (ok) saved++;
        }
      } catch (e) {
        /* skip failed country/query */
      }
    }
  }
  return saved;
}

// ── JSEARCH (RapidAPI — LinkedIn, Upwork, Indeed, Glassdoor) ──────────────────
const JSEARCH_FREELANCE_QUERIES = [
  { q: "video editor freelance",            datePosted: "week", publisher: "upwork" },
  { q: "graphic designer freelance",        datePosted: "week", publisher: "upwork" },
  { q: "web developer freelance",           datePosted: "week", publisher: "upwork" },
  { q: "content writer freelance",          datePosted: "week", publisher: "upwork" },
  { q: "digital marketing freelance",       datePosted: "week", publisher: "upwork" },
  { q: "ui ux designer freelance",          datePosted: "week", publisher: "upwork" },
  { q: "mobile app developer freelance",    datePosted: "week", publisher: "upwork" },
  { q: "data analyst freelance",            datePosted: "week", publisher: "upwork" },
  { q: "frontend developer freelance",      datePosted: "week", publisher: "upwork" },
  { q: "react native developer freelance",  datePosted: "week", publisher: "upwork" },
];

const JSEARCH_PAKISTAN_QUERIES = [
  { q: "software developer Lahore", datePosted: "week" },
  { q: "web developer Karachi",     datePosted: "week" },
  { q: "frontend developer Islamabad", datePosted: "week" },
  { q: "mobile app developer Lahore", datePosted: "week" },
  { q: "react developer Islamabad", datePosted: "week" },
  { q: "python developer Karachi",  datePosted: "week" },
  { q: "digital marketing Karachi", datePosted: "week" },
  { q: "graphic designer Lahore",   datePosted: "week" },
];

const JSEARCH_GLOBAL_REMOTE_QUERIES = [
  { q: "fullstack developer remote", datePosted: "week" },
  { q: "python developer remote",    datePosted: "week" },
  { q: "react developer remote",     datePosted: "week" },
  { q: "ai automation engineer",     datePosted: "week" },
  { q: "product designer remote",    datePosted: "week" },
];

let jsearchRotateIdx = 0;

async function fetchJSearch() {
  if (!process.env.RAPIDAPI_KEY) return 0;
  if (jsearchMonthlyCount >= JSEARCH_MONTHLY_LIMIT) {
    console.log(`JSearch monthly limit (${JSEARCH_MONTHLY_LIMIT}) reached — skipping`);
    return 0;
  }

  const batches = [
    { label: "Upwork freelance", queries: JSEARCH_FREELANCE_QUERIES },
    { label: "Pakistan local", queries: JSEARCH_PAKISTAN_QUERIES },
    { label: "Global remote", queries: JSEARCH_GLOBAL_REMOTE_QUERIES },
  ];

  let saved = 0;
  for (const batch of batches) {
    if (jsearchMonthlyCount >= JSEARCH_MONTHLY_LIMIT) break;
    const q = batch.queries[(jsearchRotateIdx + saved) % batch.queries.length] || batch.queries[saved % batch.queries.length];

    try {
      const params = {
        query: q.q,
        page: "1",
        num_pages: "2",
        date_posted: q.datePosted || "week",
        remote_jobs_only: "false",
      };
      const res = await httpGet("https://jsearch.p.rapidapi.com/search", {
        params,
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      });
      if (!res || !res.data) continue;
      jsearchMonthlyCount++;
      for (const job of res.data.data || []) {
        const url = job.job_apply_link || job.job_google_link;
        if (!url) continue;
        const publisher = (job.job_publisher || "").toLowerCase();
        let source = "Indeed";
        if (publisher.includes("linkedin"))   source = "LinkedIn";
        else if (publisher.includes("upwork")) source = "Upwork";
        else if (publisher.includes("glassdoor")) source = "Glassdoor";
        else if (publisher.includes("zip"))    source = "ZipRecruiter";
        else if (job.job_publisher)            source = job.job_publisher;

        const countryHint = q.q.split(" ").pop();
        const location = job.job_city
          ? `${job.job_city}, ${job.job_country}`
          : (job.job_country || "Worldwide");
        const ok = await saveJob({
          title: job.job_title,
          company: job.employer_name || "Company",
          location,
          url,
          source,
          type: job.job_employment_type || "Full-time",
          category: q.q,
          salary: job.job_min_salary
            ? `$${Math.round(job.job_min_salary)}${job.job_max_salary ? `–$${Math.round(job.job_max_salary)}` : "+"}`
            : "",
          postedAt: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : null,
        });
        if (ok) saved++;
      }
      await new Promise((r) => setTimeout(r, 400));
    } catch (e) {
      console.log(`JSearch error (${q.q}):`, e.message);
    }
  }
  console.log(`JSearch done. Requests this session: ${jsearchMonthlyCount}/${JSEARCH_MONTHLY_LIMIT}. New jobs: ${saved}`);
  return saved;
}

// ── 48-HOUR JOB EXPIRY CLEANUP ────────────────────────────────────────────────
async function expireOldJobs() {
  try {
    const cutoff = new Date(Date.now() - JOB_MAX_AGE_HOURS * 60 * 60 * 1000);
    // Increase buffer timeout for large collections / new DBs
    const result = await Job.deleteMany({ fetchedAt: { $lt: cutoff } }).maxTimeMS(30000);
    if (result.deletedCount) console.log(`Expired ${result.deletedCount} jobs older than ${JOB_MAX_AGE_HOURS}h`);
  } catch (err) {
    console.log("Job expiry error:", err.message);
  }
}

// ── 48-HOUR SAVED-JOB CLEANUP ─────────────────────────────────────────────────
// savedJobs is an array of Job ObjectIds; we remove references to jobs whose
// fetchedAt is older than 48 hours so stale bookmarks don't linger.
async function expireOldSavedJobs() {
  try {
    const User = require("../models/User");
    const cutoff = new Date(Date.now() - SALVED_JOB_MAX_AGE_HOURS * 60 * 60 * 1000);
    const staleJobIds = await Job.find({ fetchedAt: { $lt: cutoff } }).select("_id");
    if (staleJobIds.length) {
      await User.updateMany(
        {},
        { $pull: { savedJobs: { $in: staleJobIds.map((j) => j._id) } } }
      );
    }
  } catch (err) {
    console.log("Saved job expiry error:", err.message);
  }
}

// ── MAIN ───────────────────────────────────────────────────────────────────────
async function fetchAllJobs() {
  console.log("\n=== Global Freelancing Network job fetch starting ===");
  beginSync();
  await expireOldJobs();
  await expireOldSavedJobs();

  const fetchers = [
    ["Remotive",          fetchRemotive],
    ["RemoteOK",          fetchRemoteOK],
    ["WeWorkRemotely",    fetchWeWorkRemotely],
    ["Arbeitnow",         fetchArbeitnow],
    ["Jobicy",            fetchJobicy],
    ["Remote.co",         fetchRemoteCo],
    ["Skip The Drive",    fetchSkipTheDrive],
    ["Working Nomads",    fetchWorkingNomads],
    ["Jobspresso",        fetchJobspresso],
    ["Wellfound",         fetchWellfound],
    ["Dribbble",          fetchDribbble],
    ["ProBlogger",        fetchProBlogger],
    ["MarketingJobsBoard", fetchMarketingJobsBoard],
    ["MarketersHire",     fetchMarketersHire],
    ["Adzuna",            fetchAdzuna],
    ["JSearch",           fetchJSearch],
  ];

  const results = await Promise.allSettled(
    fetchers.map(([name, fn]) =>
      fn()
        .then((count) => {
          sourceDone(name, count);
          console.log(`✓ ${name}: ${count} new`);
          return count;
        })
        .catch((err) => {
          sourceDone(name, 0, err.message);
          console.log(`✗ ${name}: ${err.message}`);
          return 0;
        })
    )
  );

  const total = await Job.countDocuments();
  endSync();
  const sum = results.reduce((s, r) => s + (r.value || 0), 0);
  console.log(`=== Done. ${sum} new jobs added. ${total} total in DB ===\n`);
}

module.exports = { fetchAllJobs, getJSearchCount: () => jsearchMonthlyCount, expireOldJobs, expireOldSavedJobs };


// -- DRIBBBLE JOBS (RSS � design/UI positions) ------------------------------------
async function fetchDribbble() {
  const xml = await httpGet("https://dribbble.com/jobs/feed");
  if (!xml) {
    console.log("Dribbble skipped: feed unavailable");
    return 0;
  }
  const jobs = await parseRSS(xml, ({ title, company, link, pub }) => ({
    title, company, location: "Remote", url: link,
    source: "Dribbble", type: "Full-time", category: "Design",
    postedAt: parseDate(pub),
  }));
  let saved = 0;
  for (const job of jobs) {
    if (await saveJob(job)) saved++;
  }
  return saved;
}

// -- PROBLOGGER (RSS � writing/content positions) -----------------------------------
async function fetchProBlogger() {
  const xml = await httpGet("https://problogger.com/jobs/feed");
  if (!xml) {
    console.log("ProBlogger skipped: feed unavailable");
    return 0;
  }
  const jobs = await parseRSS(xml, ({ title, company, link, pub }) => ({
    title, company, location: "Remote", url: link,
    source: "ProBlogger", type: "Full-time", category: "Writing",
    postedAt: parseDate(pub),
  }));
  let saved = 0;
  for (const job of jobs) {
    if (await saveJob(job)) saved++;
  }
  return saved;
}

// -- MARKETING JOARD BOARD (RSS � marketing positions) -----------------------------
async function fetchMarketingJobsBoard() {
  const xml = await httpGet("https://marketingjobsboard.com/feed");
  if (!xml) {
    console.log("Marketing Jobs Board skipped: feed unavailable");
    return 0;
  }
  const jobs = await parseRSS(xml, ({ title, company, link, pub }) => ({
    title, company, location: "Remote", url: link,
    source: "MarketingJobsBoard", type: "Full-time", category: "Digital Marketing",
    postedAt: parseDate(pub),
  }));
  let saved = 0;
  for (const job of jobs) {
    if (await saveJob(job)) saved++;
  }
  return saved;
}

// -- MARKERSHIRE (RSS � marketing/creative positions) -------------------------------
async function fetchMarketersHire() {
  const xml = await httpGet("https://marketershire.com/feed");
  if (!xml) {
    console.log("MarketersHire skipped: feed unavailable");
    return 0;
  }
  const jobs = await parseRSS(xml, ({ title, company, link, pub }) => ({
    title, company, location: "Remote", url: link,
    source: "MarketersHire", type: "Full-time", category: "Marketing",
    postedAt: parseDate(pub),
  }));
  let saved = 0;
  for (const job of jobs) {
    if (await saveJob(job)) saved++;
  }
  return saved;
}