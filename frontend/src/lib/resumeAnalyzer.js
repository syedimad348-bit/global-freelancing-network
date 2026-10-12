// Lightweight, fully client-side resume analyzer.
// No API calls — pure heuristics that produce useful, specific feedback.

const WEAK_VERBS = [
  'responsible for', 'worked on', 'helped with', 'helped to', 'assisted with',
  'participated in', 'involved in', 'duties included', 'tasked with',
  'in charge of', 'handled', 'dealt with',
];

const STRONG_VERB_SUGGESTIONS = {
  'responsible for': ['Led', 'Owned', 'Drove'],
  'worked on':       ['Built', 'Shipped', 'Delivered'],
  'helped with':     ['Co-led', 'Partnered to', 'Contributed to'],
  'helped to':       ['Co-led', 'Partnered to', 'Contributed to'],
  'assisted with':   ['Supported', 'Co-led', 'Partnered on'],
  'participated in': ['Drove', 'Led', 'Contributed to'],
  'involved in':     ['Drove', 'Led', 'Owned'],
  'duties included': ['Owned', 'Led'],
  'tasked with':     ['Owned', 'Led', 'Drove'],
  'in charge of':    ['Led', 'Owned', 'Managed'],
  'handled':         ['Owned', 'Resolved', 'Managed'],
  'dealt with':      ['Resolved', 'Owned', 'Mitigated'],
};

const STRONG_VERBS = new Set([
  'led','built','shipped','delivered','launched','designed','architected','drove',
  'owned','reduced','grew','increased','improved','optimized','scaled','automated',
  'migrated','refactored','founded','negotiated','partnered','mentored','authored',
  'spearheaded','accelerated','streamlined','redesigned','rebuilt','rolled out',
]);

const PASSIVE_HINTS = [/\bwas\s+\w+ed\b/i, /\bwere\s+\w+ed\b/i, /\bbeen\s+\w+ed\b/i, /\bbeing\s+\w+ed\b/i];

const FILLER = ['very', 'really', 'just', 'basically', 'a lot of', 'lots of', 'many', 'various'];

const COMMON_TYPOS = {
  'recieved': 'received',
  'managment': 'management',
  'enviroment': 'environment',
  'experiance': 'experience',
  'developement': 'development',
  'sucessful': 'successful',
  'sucessfully': 'successfully',
  'definately': 'definitely',
  'occured': 'occurred',
  'seperate': 'separate',
  'untill': 'until',
  'acheived': 'achieved',
  'priveleges': 'privileges',
  'tommorrow': 'tomorrow',
  'wich': 'which',
  'beleive': 'believe',
  'reccomend': 'recommend',
  'recommened': 'recommended',
};

const KEYWORD_BANK = [
  // Engineering
  'react', 'typescript', 'javascript', 'node.js', 'next.js', 'python', 'go', 'rust',
  'java', 'kotlin', 'swift', 'ruby', 'php',
  // Cloud / infra
  'aws', 'gcp', 'azure', 'kubernetes', 'docker', 'terraform', 'ci/cd', 'linux',
  // Data / AI
  'sql', 'postgresql', 'mongodb', 'redis', 'kafka', 'spark', 'airflow', 'dbt',
  'pytorch', 'tensorflow', 'nlp', 'llm', 'rag', 'machine learning', 'deep learning',
  // Product / design
  'figma', 'agile', 'scrum', 'roadmap', 'a/b testing', 'analytics', 'mixpanel',
  'amplitude', 'tableau', 'looker',
  // Soft skills
  'leadership', 'mentoring', 'cross-functional', 'stakeholders',
];

const METRIC_RX = /(\$?\d[\d,.]*\s?(%|k|m|b|x|users|customers|hours|minutes|seconds|months|weeks|days|million|billion|requests|qps|rps|gb|tb|years|orgs|teams|countries))/i;

const SAMPLE_RESUME = `Jane Doe — Senior Frontend Engineer
Email: jane@example.com · linkedin.com/in/janedoe

EXPERIENCE
Acme Corp · Frontend Engineer · Mar 2022 – Present
- Responsible for the redesign of the dashboard.
- Worked on improving page load performance.
- Built a new design system used across 4 product teams.
- Reduced p95 page load time from 4.1s to 1.6s, lifting conversion by 12%.
- Helped with mentoring 2 junior engineers.
- Was involved in migrating the codebase from Webpack to Vite.

Beta Inc · Junior Frontend Engineer · Jul 2020 – Feb 2022
- Implemented React components for the marketing site.
- Participated in code reviews and sprint planning.
- Shipped an A/B testing framework that ran 30+ experiments.
- Recieved an award for outstanding teamwork.

SKILLS
React, TypeScript, JavaScript, HTML, CSS, Node.js, Figma, Jest, Cypress, Webpack

EDUCATION
B.Sc. Computer Science — State University, 2020`;

const TARGET_SAMPLE = `Senior Frontend Engineer at a fast-growing SaaS company.
We're looking for someone strong in React, TypeScript, Next.js and modern web performance.
Bonus: GraphQL, design systems, A/B testing, accessibility, CI/CD on AWS.`;

function splitBullets(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-•*–]\s?/, '').trim())
    .filter(Boolean);
}

function tokens(text) {
  return new Set((text.toLowerCase().match(/[a-z][a-z+./#-]{1,}/g) || []));
}

function hasMetric(line)   { return METRIC_RX.test(line); }
function hasStrongVerb(line) {
  const first = (line.match(/^[A-Za-z]+/) || [''])[0].toLowerCase();
  return STRONG_VERBS.has(first);
}
function findWeakVerbHit(line) {
  const lower = line.toLowerCase();
  return WEAK_VERBS.find((w) => lower.includes(w));
}
function findPassive(line) {
  return PASSIVE_HINTS.some((rx) => rx.test(line));
}
function findFiller(line) {
  const lower = line.toLowerCase();
  return FILLER.find((w) => new RegExp(`\\b${w}\\b`).test(lower));
}
function findTypos(line) {
  const out = [];
  for (const [bad, good] of Object.entries(COMMON_TYPOS)) {
    const rx = new RegExp(`\\b${bad}\\b`, 'gi');
    if (rx.test(line)) out.push({ bad, good });
  }
  return out;
}

function rewriteBullet(line) {
  const errors = [];
  let suggestion = line;

  // Replace weak verbs with a strong one
  const weak = findWeakVerbHit(line);
  if (weak) {
    const repl = STRONG_VERB_SUGGESTIONS[weak]?.[0] || 'Led';
    suggestion = suggestion.replace(new RegExp(weak, 'i'), repl);
    errors.push({ kind: 'weak-verb', text: weak, fix: `Use a strong verb like "${repl}"` });
  }

  // Lead with a verb if not
  if (!hasStrongVerb(suggestion)) {
    suggestion = suggestion.replace(/^([a-z])/, (m) => m.toUpperCase());
    if (!STRONG_VERBS.has((suggestion.match(/^[A-Za-z]+/) || [''])[0].toLowerCase())) {
      // prepend a soft verb if still missing
      if (!/^[A-Z][a-z]+ /.test(suggestion)) suggestion = `Drove ${suggestion}`;
    }
  }

  // Flag passive voice
  if (findPassive(line)) {
    errors.push({ kind: 'passive', text: 'Passive voice', fix: 'Rewrite in active voice (e.g. "I led" not "was led").' });
  }

  // Flag fillers
  const filler = findFiller(line);
  if (filler) {
    suggestion = suggestion.replace(new RegExp(`\\b${filler}\\b`, 'i'), '').replace(/\s{2,}/g, ' ').trim();
    errors.push({ kind: 'filler', text: filler, fix: `Drop "${filler}" — it weakens the line.` });
  }

  // Flag typos
  const typos = findTypos(line);
  for (const t of typos) {
    suggestion = suggestion.replace(new RegExp(`\\b${t.bad}\\b`, 'gi'), t.good);
    errors.push({ kind: 'typo', text: t.bad, fix: `Spelling: "${t.bad}" → "${t.good}".` });
  }

  // Suggest a metric if none
  if (!hasMetric(line)) {
    errors.push({ kind: 'no-metric', text: 'No quantified impact', fix: 'Add a number — % growth, $ saved, # users, latency reduction.' });
    if (!/[.!?]$/.test(suggestion)) suggestion = suggestion.replace(/\s*$/, '');
    suggestion = `${suggestion} — quantify the impact (e.g. "→ 30% faster" or "+ $120k ARR").`;
  }

  // Capitalize and trim final punctuation
  suggestion = suggestion.replace(/^([a-z])/, (m) => m.toUpperCase()).trim();
  if (!/[.!?]$/.test(suggestion)) suggestion += '.';

  return { original: line, suggestion, errors };
}

export function analyzeResume(resumeText, targetText = '') {
  const lines = splitBullets(resumeText);
  const bullets = lines.filter((l) => l.length > 6 && /[a-z]/i.test(l) && !/^(EXPERIENCE|EDUCATION|SKILLS|PROJECTS)$/i.test(l));

  const rewrites = bullets.slice(0, 16).map(rewriteBullet);

  // Skill keyword match
  const resumeTokens = tokens(resumeText.toLowerCase());
  const targetTokens = tokens(targetText.toLowerCase());
  const fromTarget = targetText.trim()
    ? KEYWORD_BANK.filter((k) => k.split(' ').every((p) => targetTokens.has(p)))
    : KEYWORD_BANK.slice(0, 14);
  const matched = fromTarget.filter((k) => k.split(' ').every((p) => resumeTokens.has(p)));
  const missing = fromTarget.filter((k) => !matched.includes(k));

  // Factor scores
  const totalBullets   = Math.max(1, bullets.length);
  const verbsOk        = rewrites.filter((r) => !r.errors.some((e) => e.kind === 'weak-verb')).length;
  const metricsOk      = rewrites.filter((r) => !r.errors.some((e) => e.kind === 'no-metric')).length;
  const passiveCount   = rewrites.filter((r) => r.errors.some((e) => e.kind === 'passive')).length;
  const typoCount      = rewrites.reduce((s, r) => s + r.errors.filter((e) => e.kind === 'typo').length, 0);

  const factors = [
    {
      name: 'ATS readability',
      score: clamp(70 + (resumeText.length > 600 ? 18 : 0) + (resumeText.includes('\t') ? -8 : 6) + (/(EXPERIENCE|SKILLS|EDUCATION)/i.test(resumeText) ? 6 : -10)),
      good: 'Plain text + standard section headers parse cleanly.',
      fix:  resumeText.includes('\t') ? 'Avoid tab-aligned columns — they confuse most parsers.' : null,
    },
    {
      name: 'Action verbs',
      score: clamp(50 + Math.round((verbsOk / totalBullets) * 50)),
      good: `Strong action verbs in ${verbsOk}/${totalBullets} bullets.`,
      fix:  verbsOk < totalBullets ? `Replace weak openers in ${totalBullets - verbsOk} bullet(s) — see rewrites below.` : null,
    },
    {
      name: 'Quantified impact',
      score: clamp(40 + Math.round((metricsOk / totalBullets) * 60)),
      good: `${metricsOk}/${totalBullets} bullets quantify their impact.`,
      fix:  metricsOk < totalBullets ? `Add at least one number to ${totalBullets - metricsOk} more bullet(s).` : null,
    },
    {
      name: 'Skills coverage',
      score: clamp(45 + Math.round((matched.length / Math.max(1, fromTarget.length)) * 55)),
      good: `${matched.length}/${fromTarget.length} target keywords found.`,
      fix:  missing.length ? `Missing: ${missing.slice(0, 6).join(', ')}.` : null,
    },
    {
      name: 'Active voice',
      score: clamp(95 - passiveCount * 8),
      good: passiveCount === 0 ? 'No passive voice detected.' : `${passiveCount} bullet(s) use passive voice.`,
      fix:  passiveCount > 0 ? 'Rewrite passive lines as "I/We did X to achieve Y".' : null,
    },
    {
      name: 'Spelling & grammar',
      score: clamp(98 - typoCount * 7),
      good: typoCount === 0 ? 'No common spelling slips.' : `${typoCount} likely typo(s) found.`,
      fix:  typoCount > 0 ? 'See highlighted typos in the rewrites — fix before sending.' : null,
    },
    {
      name: 'Length & density',
      score: clamp(60 + (resumeText.length > 500 && resumeText.length < 5000 ? 30 : 0)),
      good: 'Concise sections — easy to scan in 30 seconds.',
      fix:  resumeText.length > 5000 ? 'Trim to 1 page if you have <10 years of experience.' : null,
    },
    {
      name: 'Tailoring',
      score: clamp(targetText ? 60 + Math.round((matched.length / Math.max(1, fromTarget.length)) * 35) : 55),
      good: targetText ? 'Resume mentions key terms from the target role.' : 'Paste a target job description for tailored scoring.',
      fix:  targetText && missing.length ? `Mirror these from the JD: ${missing.slice(0, 4).join(', ')}.` : null,
    },
  ];

  const overall = Math.round(factors.reduce((s, f) => s + f.score, 0) / factors.length);
  const grade = overall >= 90 ? 'A+' : overall >= 85 ? 'A' : overall >= 75 ? 'B' : overall >= 65 ? 'C' : 'D';

  return { overall, grade, factors, rewrites, matched, missing, totalBullets, totalErrors: rewrites.reduce((s, r) => s + r.errors.length, 0) };
}

function clamp(n, min = 30, max = 99) { return Math.max(min, Math.min(max, Math.round(n))); }

export const SAMPLE = { resume: SAMPLE_RESUME, target: TARGET_SAMPLE };
