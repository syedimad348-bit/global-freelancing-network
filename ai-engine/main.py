from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber
import re
import io
from typing import List

app = FastAPI(title="DailyRadar AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Skill database ────────────────────────────────────────
TECH_SKILLS = [
    "python", "javascript", "typescript", "java", "c++", "c#", "php", "ruby",
    "swift", "kotlin", "go", "rust", "r", "matlab", "scala",
    "react", "angular", "vue", "nextjs", "nodejs", "express", "django",
    "flask", "fastapi", "spring", "laravel", "rails",
    "mongodb", "mysql", "postgresql", "sqlite", "redis", "firebase",
    "aws", "azure", "gcp", "docker", "kubernetes", "git", "linux",
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
    "scikit-learn", "pandas", "numpy", "opencv", "nlp",
    "html", "css", "tailwind", "bootstrap", "sass",
    "rest api", "graphql", "microservices", "ci/cd", "agile", "scrum",
    "figma", "photoshop", "illustrator", "ui/ux",
    "data analysis", "data science", "power bi", "tableau", "excel",
    "blockchain", "solidity", "web3",
]

SOFT_SKILLS = [
    "leadership", "communication", "teamwork", "problem solving",
    "critical thinking", "time management", "creativity", "adaptability",
    "collaboration", "presentation", "negotiation", "management",
]

EDUCATION_KEYWORDS = [
    "bachelor", "master", "phd", "degree", "university", "college",
    "bs", "ms", "msc", "bsc", "b.s", "m.s", "b.e", "m.e",
    "computer science", "software engineering", "information technology",
    "data science", "artificial intelligence", "electrical engineering",
]

EXPERIENCE_KEYWORDS = [
    "experience", "worked", "developed", "built", "designed", "managed",
    "led", "created", "implemented", "maintained", "improved", "deployed",
    "years", "months", "intern", "internship", "junior", "senior", "engineer",
    "developer", "analyst", "manager", "consultant",
]

# ── Extract text from PDF ─────────────────────────────────
def extract_text(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
    return text.lower()

# ── Extract skills ────────────────────────────────────────
def extract_skills(text: str):
    found_tech = [s for s in TECH_SKILLS if s in text]
    found_soft = [s for s in SOFT_SKILLS if s in text]
    return found_tech, found_soft

# ── Check education ───────────────────────────────────────
def check_education(text: str) -> dict:
    found = [e for e in EDUCATION_KEYWORDS if e in text]
    has_degree = any(k in text for k in ["bachelor", "master", "phd", "bs", "ms", "bsc", "msc", "b.e", "m.e"])
    return {"keywords": found, "has_degree": has_degree}

# ── Check experience ──────────────────────────────────────
def check_experience(text: str) -> dict:
    found = [e for e in EXPERIENCE_KEYWORDS if e in text]
    years_match = re.findall(r'(\d+)\+?\s*years?', text)
    years = max([int(y) for y in years_match], default=0)
    return {"keywords": found, "years": years}

# ── Check contact info ────────────────────────────────────
def check_contact(text: str) -> dict:
    has_email = bool(re.search(r'[\w.-]+@[\w.-]+\.\w+', text))
    has_phone = bool(re.search(r'[\+]?[\d\s\-\(\)]{10,}', text))
    has_linkedin = "linkedin" in text
    has_github = "github" in text
    return {
        "email": has_email,
        "phone": has_phone,
        "linkedin": has_linkedin,
        "github": has_github,
    }

# ── Calculate score ───────────────────────────────────────
def calculate_score(tech_skills, soft_skills, education, experience, contact, word_count) -> dict:
    score = 0
    breakdown = {}

    # Skills (30 points)
    skill_score = min(len(tech_skills) * 2, 25) + min(len(soft_skills), 5)
    score += skill_score
    breakdown["skills"] = skill_score

    # Education (20 points)
    edu_score = 20 if education["has_degree"] else (10 if len(education["keywords"]) > 0 else 0)
    score += edu_score
    breakdown["education"] = edu_score

    # Experience (25 points)
    exp_score = 0
    if experience["years"] >= 5:
        exp_score = 25
    elif experience["years"] >= 3:
        exp_score = 20
    elif experience["years"] >= 1:
        exp_score = 15
    elif len(experience["keywords"]) > 3:
        exp_score = 10
    elif len(experience["keywords"]) > 0:
        exp_score = 5
    score += exp_score
    breakdown["experience"] = exp_score

    # Contact info (15 points)
    contact_score = 0
    if contact["email"]: contact_score += 5
    if contact["phone"]: contact_score += 3
    if contact["linkedin"]: contact_score += 4
    if contact["github"]: contact_score += 3
    score += contact_score
    breakdown["contact"] = contact_score

    # CV length/content (10 points)
    length_score = 10 if word_count > 400 else (7 if word_count > 200 else (4 if word_count > 100 else 2))
    score += length_score
    breakdown["content"] = length_score

    return {"total": min(score, 100), "breakdown": breakdown}

# ── Generate suggestions ──────────────────────────────────
def generate_suggestions(tech_skills, soft_skills, education, experience, contact, score) -> List[str]:
    suggestions = []

    if not contact["email"]:
        suggestions.append("Add your email address to the CV.")
    if not contact["phone"]:
        suggestions.append("Add your phone number to the CV.")
    if not contact["linkedin"]:
        suggestions.append("Add your LinkedIn profile URL to stand out.")
    if not contact["github"]:
        suggestions.append("Add your GitHub profile to showcase your projects.")

    if not education["has_degree"]:
        suggestions.append("Mention your degree or educational qualification clearly.")

    if experience["years"] == 0 and len(experience["keywords"]) < 3:
        suggestions.append("Add work experience or internship details with specific achievements.")
    elif experience["years"] < 2:
        suggestions.append("Highlight more project experience or internships to strengthen your profile.")

    if len(tech_skills) < 5:
        suggestions.append("Add more technical skills relevant to your target job role.")
    if len(soft_skills) < 3:
        suggestions.append("Include soft skills like leadership, communication and teamwork.")

    missing_hot = []
    hot_skills = ["python", "react", "machine learning", "docker", "aws", "nodejs"]
    for s in hot_skills:
        if s not in tech_skills:
            missing_hot.append(s)
    if missing_hot:
        suggestions.append(f"Consider learning high-demand skills: {', '.join(missing_hot[:3])}.")

    if score < 50:
        suggestions.append("Your CV needs significant improvements. Focus on adding more details about your experience and skills.")
    elif score < 70:
        suggestions.append("Good CV but add more quantified achievements like 'increased performance by 30%'.")
    elif score < 85:
        suggestions.append("Strong CV! Add a professional summary at the top to make it even better.")
    else:
        suggestions.append("Excellent CV! Make sure to tailor it for each specific job application.")

    return suggestions

# ── API Routes ────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "DailyRadar AI Engine is running!"}

@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()

    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")

    text = extract_text(file_bytes)

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

    word_count = len(text.split())
    tech_skills, soft_skills = extract_skills(text)
    education = check_education(text)
    experience = check_experience(text)
    contact = check_contact(text)
    score_data = calculate_score(tech_skills, soft_skills, education, experience, contact, word_count)
    suggestions = generate_suggestions(tech_skills, soft_skills, education, experience, contact, score_data["total"])

    return {
        "score": score_data["total"],
        "breakdown": score_data["breakdown"],
        "tech_skills": tech_skills,
        "soft_skills": soft_skills,
        "education": education,
        "experience": experience,
        "contact": contact,
        "suggestions": suggestions,
        "word_count": word_count,
        "grade": (
            "A+" if score_data["total"] >= 90 else
            "A"  if score_data["total"] >= 80 else
            "B+" if score_data["total"] >= 70 else
            "B"  if score_data["total"] >= 60 else
            "C+" if score_data["total"] >= 50 else
            "C"  if score_data["total"] >= 40 else
            "D"
        ),
    }


@app.post("/match-job")
async def match_job(file: UploadFile = File(...), job_description: str = ""):
    file_bytes = await file.read()
    cv_text = extract_text(file_bytes)
    jd_text = job_description.lower()

    cv_skills, _ = extract_skills(cv_text)
    jd_skills, _ = extract_skills(jd_text)

    if not jd_skills:
        return {"match_score": 0, "matched": [], "missing": [], "message": "No skills found in job description."}

    matched = [s for s in jd_skills if s in cv_skills]
    missing = [s for s in jd_skills if s not in cv_skills]
    match_score = int((len(matched) / len(jd_skills)) * 100)

    return {
        "match_score": match_score,
        "matched_skills": matched,
        "missing_skills": missing,
        "recommendation": (
            "Strong match! Apply now." if match_score >= 70 else
            "Decent match. Consider upskilling in missing areas." if match_score >= 40 else
            "Low match. Focus on learning the required skills first."
        ),
    }
