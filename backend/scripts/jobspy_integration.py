#!/usr/bin/env python3
"""
JobSpy Integration for Global Freelancing Network
Fetches jobs from multiple job boards using JobSpy and saves them to MongoDB
"""

import os
import sys
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import pandas as pd
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from jobspy import scrape_jobs
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv('../.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URL')  # Note: backend uses MONGO_URL
if not MONGO_URI:
    # Try loading from backend/.env as fallback
    load_dotenv()
    MONGO_URI = os.getenv('MONGO_URL')
if not MONGO_URI:
    logger.error("MONGO_URL environment variable is required")
    sys.exit(1)

# Extract database name from URI or use default
import urllib.parse
parsed = urllib.parse.urlparse(MONGO_URI)
db_name = parsed.path.lstrip('/')
if not db_name:
    db_name = 'freelance_network'  # Default database name

client = MongoClient(MONGO_URI)
db = client[db_name]
jobs_collection = db.jobs

# JobSpy configuration
JOB_BOARDS = ['indeed', 'linkedin', 'glassdoor', 'zip_recruiter']
SEARCH_TERMS = [
    'software engineer',
    'web developer', 
    'frontend developer',
    'backend developer',
    'full stack developer',
    'data scientist',
    'devops engineer',
    'ui/ux designer',
    'product manager',
    'digital marketer'
]
LOCATIONS = [
    'Pakistan',
    'Remote',
    'Lahore',
    'Karachi', 
    'Islamabad',
    'Faisalabad',
    'Rawalpindi',
    'Multan',
    'Peshawar'
]

RESULTS_PER_SEARCH = 20  # Conservative limit to avoid rate limiting
HOURS_OLD = 168  # 7 days - jobs posted in the last week


def map_jobspy_to_schema(job: pd.Series) -> Dict[str, Any]:
    """
    Map JobSpy job format to existing MongoDB schema
    """
    # Extract salary information
    salary = ""
    if pd.notnull(job.get('min_amount')) and pd.notnull(job.get('max_amount')):
        min_amt = job['min_amount']
        max_amt = job['max_amount']
        currency = job.get('currency', 'USD')
        interval = job.get('interval', 'yearly')
        
        if interval == 'yearly':
            salary = f"{currency} {int(min_amt):,} - {int(max_amt):,} per year"
        elif interval == 'monthly':
            salary = f"{currency} {int(min_amt):,} - {int(max_amt):,} per month"
        else:
            salary = f"{currency} {min_amt} - {max_amt} per {interval}"
    elif pd.notnull(job.get('min_amount')):
        min_amt = job['min_amount']
        currency = job.get('currency', 'USD')
        interval = job.get('interval', 'yearly')
        if interval == 'yearly':
            salary = f"{currency} {int(min_amt):,}+ per year"
        else:
            salary = f"{currency} {min_amt}+ per {interval}"
    
    # Handle job_type (can be string or list)
    job_type = job.get('job_type', '')
    if isinstance(job_type, list):
        job_type = job_type[0] if job_type else 'Full-time'
    elif not job_type:
        job_type = 'Full-time'
    
    # Determine location and remote type
    location = str(job.get('location', 'Remote'))
    is_remote = bool(job.get('is_remote', False))
    
    remote_type = 'remote'
    if not is_remote and ('remote' not in location.lower()):
        remote_type = 'onsite'
    elif is_remote:
        remote_type = 'remote'
    elif 'hybrid' in location.lower() or 'hybrid' in str(job.get('job_type', '')).lower():
        remote_type = 'hybrid'
    
    # Determine country from location
    country = ''
    location_lower = location.lower()
    if 'pakistan' in location_lower:
        country = 'Pakistan'
    elif any(city in location_lower for city in ['lahore', 'karachi', 'islamabad', 'faisalabad', 'rawalpindi', 'multan', 'peshawar']):
        country = 'Pakistan'
    elif 'united states' in location_lower or 'usa' in location_lower or 'us,' in location_lower:
        country = 'United States'
    elif 'united kingdom' in location_lower or 'uk' in location_lower or 'england' in location_lower:
        country = 'United Kingdom'
    elif 'canada' in location_lower:
        country = 'Canada'
    elif 'australia' in location_lower:
        country = 'Australia'
    else:
        country = 'Worldwide'
    
    # Prepare tags
    tags = []
    if job.get('job_level'):
        tags.append(str(job['job_level']))
    if job.get('job_function'):
        tags.append(str(job['job_function']))
    if job.get('company_industry'):
        tags.append(str(job['company_industry']))
    if remote_type != 'general':
        tags.append(remote_type)
    if country != '':
        tags.append(country)
    
    # Add source-specific tags
    tags.append(f"source:{job.get('site', 'unknown')}")
    
    # Clean up tags (remove duplicates, empty strings, None values)
    tags = list(set([str(t).strip() for t in tags if t and str(t).strip()]))
    
    # Map to existing schema
    mapped_job = {
        'title': str(job.get('title', 'Unknown Title'))[:200],  # Limit length
        'company': str(job.get('company', 'Unknown Company'))[:100],
        'location': location[:100],
        'url': str(job.get('job_url', ''))[:500],  # Limit URL length
        'source': str(job.get('site', 'unknown')).lower(),
        'type': str(job_type)[:50],
        'category': map_category(str(job.get('job_function', '')) or str(job.get('title', ''))),
        'folder': map_folder(str(job.get('title', ''))),
        'tags': tags,
        'salary': salary[:100],
        'postedAt': parse_date(job.get('date_posted')),
        'fetchedAt': datetime.now(datetime.UTC),
        'remoteType': remote_type,
        'country': country,
        'sourceHealth': 1,  # New source starts with neutral health
        'sourceFailures': 0
    }
    
    return mapped_job


def map_category(job_function: str) -> str:
    """
    Map job function/department to existing categories
    """
    job_function_lower = job_function.lower()
    
    if any(keyword in job_function_lower for keyword in ['engineer', 'developer', 'programmer', 'software', 'web', 'mobile', 'frontend', 'backend', 'full stack', 'devops', 'qa', 'test']):
        return 'Software Engineering'
    elif any(keyword in job_function_lower for keyword in ['design', 'ux', 'ui', 'graphic', 'visual', 'product']):
        return 'Design'
    elif any(keyword in job_function_lower for keyword in ['marketing', 'digital', 'seo', 'sem', 'content', 'social media', 'growth']):
        return 'Marketing'
    elif any(keyword in job_function_lower for keyword in ['data', 'analytics', 'scientist', 'analyst', 'bi', 'intelligence']):
        return 'Data Science'
    elif any(keyword in job_function_lower for keyword in ['manager', 'management', 'lead', 'director', 'supervisor']):
        return 'Management'
    elif any(keyword in job_function_lower for keyword in ['sales', 'business development', 'account', 'client']):
        return 'Sales & Business Development'
    elif any(keyword in job_function_lower for keyword in ['finance', 'accounting', 'banking', 'investment', 'financial']):
        return 'Finance'
    elif any(keyword in job_function_lower for keyword in ['hr', 'human resources', 'recruiting', 'talent', 'people']):
        return 'HR & Recruiting'
    elif any(keyword in job_function_lower for keyword in ['support', 'customer service', 'help desk', 'technical support']):
        return 'Customer Support'
    elif any(keyword in job_function_lower for keyword in ['admin', 'administrative', 'operations', 'office', 'secretary']):
        return 'Administrative'
    else:
        return 'General'  # Default category


def map_folder(title: str) -> str:
    """
    Map job title to folder/category (similar to existing normalizeFolder function)
    """
    title_lower = title.lower()
    
    if any(keyword in title_lower for keyword in ['video edit', 'premiere', 'after effect', 'davinci', 'filmmaker']):
        return 'Video Editing'
    elif any(keyword in title_lower for keyword in ['motion graphic', 'animation', 'animated', '2d', '3d', 'blender', 'maya', 'cinema 4d']):
        return 'Animation & Motion'
    elif any(keyword in title_lower for keyword in ['graphic design', 'illustrat', 'photoshop', 'brand design', 'visual design']):
        return 'Graphic Design'
    elif any(keyword in title_lower for keyword in ['ui.ux', 'ux design', 'user experience', 'user interface', 'product design', 'figma', 'sketch']):
        return 'UI/UX Design'
    elif any(keyword in title_lower for keyword in ['3d model', '3d artist', 'cad', 'solidworks', 'rhino', 'zbrush']):
        return '3D Modeling'
    elif any(keyword in title_lower for keyword in ['ai automat', 'ai chatbot', 'langchain', 'llm', 'gpt', 'openai', 'prompt engineer', 'nlp', 'deep learn']):
        return 'AI & Automation'
    elif any(keyword in title_lower for keyword in ['machine learn', 'data scien', 'mlops', 'pytorch', 'tensorflow', 'computer vision']):
        return 'Machine Learning'
    elif any(keyword in title_lower for keyword in ['python', 'django', 'flask', 'fastapi', 'data engineer']):
        return 'Python Development'
    elif any(keyword in title_lower for keyword in ['react', 'next\\.?js', 'vue', 'angular', 'svelte', 'frontend|front-end|front end']):
        return 'Web Development'
    elif any(keyword in title_lower for keyword in ['full\\.?stack|fullstack|node\\.?js|backend|back-end']):
        return 'Full-Stack Development'
    elif any(keyword in title_lower for keyword in ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin']):
        return 'Mobile App Development'
    elif any(keyword in title_lower for keyword in ['shopify', 'woocommerce|e.?commerce|ecommerce|magento']):
        return 'E-commerce & Shopify'
    elif any(keyword in title_lower for keyword in ['wordpress', 'cms|webflow|wix']):
        return 'WordPress & CMS'
    elif any(keyword in title_lower for keyword in ['devops|kubernetes|docker|terraform|cloud|aws|azure|gcp|sre|platform engineer']):
        return 'DevOps & Cloud'
    elif any(keyword in title_lower for keyword in ['cybersecur|penetrat|infosec|soc analyst|ethical hack']):
        return 'Cybersecurity'
    elif any(keyword in title_lower for keyword in ['seo|search engine optim']):
        return 'SEO'
    elif any(keyword in title_lower for keyword in ['content writ|copywrite|copywriting|blog|editorial|technical writ']):
        return 'Content & Copywriting'
    elif any(keyword in title_lower for keyword in ['digital market|performance market|growth market|paid ads|ppc|sem']):
        return 'Digital Marketing'
    elif any(keyword in title_lower for keyword in ['social media|community manag|instagram|tiktok|youtube']):
        return 'Social Media'
    elif any(keyword in title_lower for keyword in ['data analyst|business intelligence|bi |tableau|power bi|looker']):
        return 'Data Analytics'
    elif any(keyword in title_lower for keyword in ['virtual assistant|executive assistant|admin|operations']):
        return 'Virtual Assistant'
    elif any(keyword in title_lower for keyword in ['voice over|voiceover|narrator|podcast']):
        return 'Voice Over'
    elif any(keyword in title_lower for keyword in ['sales|account exec|bdr|sdr|business dev']):
        return 'Sales'
    elif any(keyword in title_lower for keyword in ['customer success|customer support|help desk|cx ']):
        return 'Customer Support'
    elif any(keyword in title_lower for keyword in ['finance|accountant|bookkeep|payroll|cpa']):
        return 'Finance'
    elif any(keyword in title_lower for keyword in ['hr |recruiter|talent|people ops']):
        return 'HR & Recruiting'
    elif any(keyword in title_lower for keyword in ['health|medical|wellness|nurse|clinical']):
        return 'Health'
    elif any(keyword in title_lower for keyword in ['freelance|contract|gig']):
        return 'Freelance'
    elif any(keyword in title_lower for keyword in ['software engineer|developer|engineer|programmer']):
        return 'Software Engineering'
    else:
        return 'General'


def parse_date(date_val: Any) -> Optional[datetime]:
    """
    Parse date from various formats to datetime object
    """
    if pd.isnull(date_val) or date_val is None or date_val == '':
        return None
    
    try:
        # If it's already a datetime object
        if isinstance(date_val, datetime):
            return date_val
        
        # If it's a string
        if isinstance(date_val, str):
            # Try parsing as ISO format
            return datetime.fromisoformat(date_val.replace('Z', '+00:00'))
    except:
        pass
    
    return None


def deduplicate_jobs(jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Remove duplicate jobs based on URL and check against existing jobs in MongoDB
    """
    # First, remove duplicates within the new jobs based on URL
    seen_urls = set()
    unique_jobs = []
    
    for job in jobs:
        url = job.get('url', '')
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_jobs.append(job)
    
    # Now check against existing jobs in MongoDB
    if unique_jobs:
        urls = [job['url'] for job in unique_jobs if job.get('url')]
        if urls:
            # Find existing jobs with these URLs
            existing_jobs = jobs_collection.find(
                {'url': {'$in': urls}},
                {'url': 1, '_id': 0}
            )
            existing_urls = set(doc['url'] for doc in existing_jobs)
            
            # Filter out jobs that already exist
            new_jobs = [
                job for job in unique_jobs 
                if job.get('url') not in existing_urls
            ]
            
            logger.info(f"Found {len(existing_urls)} existing jobs, {len(new_jobs)} new jobs to insert")
            return new_jobs
    
    return unique_jobs


def fetch_and_save_jobspy_jobs() -> int:
    """
    Fetch jobs using JobSpy and save them to MongoDB
    Returns the number of new jobs saved
    """
    total_new_jobs = 0
    
    try:
        logger.info("Starting JobSpy job fetch...")
        
        # For each combination of search term and location
        for search_term in SEARCH_TERMS[:3]:  # Limit to first 3 terms for testing
            for location in LOCATIONS[:2]:   # Limit to first 2 locations for testing
                logger.info(f"Searching for '{search_term}' in '{location}'...")
                
                try:
                    # Scrape jobs using JobSpy
                    jobs_df = scrape_jobs(
                        site_name=JOB_BOARDS,
                        search_term=search_term,
                        location=location,
                        results_wanted=RESULTS_PER_SEARCH,
                        hours_old=HOURS_OLD,
                        country_indeed='Pakistan' if location.lower() == 'pakistan' else 'USA',
                        verbose=0  # Reduce logging
                    )
                    
                    if jobs_df is not None and len(jobs_df) > 0:
                        logger.info(f"Found {len(jobs_df)} raw jobs from JobSpy")
                        
                        # Convert DataFrame to list of dicts and map to our schema
                        mapped_jobs = []
                        for _, job_row in jobs_df.iterrows():
                            try:
                                mapped_job = map_jobspy_to_schema(job_row)
                                mapped_jobs.append(mapped_job)
                            except Exception as e:
                                logger.warning(f"Failed to map job: {e}")
                                continue
                        
                        logger.info(f"Mapped {len(mapped_jobs)} jobs to schema")
                        
                        # Deduplicate
                        new_jobs = deduplicate_jobs(mapped_jobs)
                        
                        # Insert new jobs into MongoDB
                        if new_jobs:
                            try:
                                result = jobs_collection.insert_many(new_jobs, ordered=False)
                                inserted_count = len(result.inserted_ids)
                                total_new_jobs += inserted_count
                                logger.info(f"Inserted {inserted_count} new jobs from JobSpy")
                            except Exception as e:
                                # Handle partial failures (some duplicates might have slipped through)
                                if hasattr(e, 'details') and 'writeErrors' in e.details:
                                    inserted_count = len(e.details.get('writeConcern', {})) or 0
                                    if inserted_count > 0:
                                        total_new_jobs += inserted_count
                                        logger.info(f"Inserted {inserted_count} jobs (some duplicates skipped)")
                                    else:
                                        logger.error(f"Failed to insert jobs: {e}")
                                else:
                                    logger.error(f"Failed to insert jobs: {e}")
                        else:
                            logger.info("No new jobs to insert after deduplication")
                    else:
                        logger.info(f"No jobs found for '{search_term}' in '{location}'")
                        
                except Exception as e:
                    logger.error(f"Error searching for '{search_term}' in '{location}': {e}")
                    continue
        
        logger.info(f"JobSpy fetch completed. Total new jobs saved: {total_new_jobs}")
        return total_new_jobs
        
    except Exception as e:
        logger.error(f"JobSpy fetch failed: {e}")
        return 0


def main():
    """
    Main function to run the JobSpy integration
    """
    logger.info("Starting Global Freelancing Network JobSpy Integration")
    
    try:
        # Test MongoDB connection
        client.admin.command('ping')
        logger.info("Connected to MongoDB successfully")
        
        # Fetch and save jobs
        new_jobs_count = fetch_and_save_jobspy_jobs()
        
        logger.info(f"JobSpy integration completed successfully. Added {new_jobs_count} new jobs.")
        
    except Exception as e:
        logger.error(f"JobSpy integration failed: {e}")
        sys.exit(1)
    finally:
        client.close()


if __name__ == "__main__":
    main()