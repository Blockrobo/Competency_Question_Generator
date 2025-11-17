"""
Curriculum topics based on Swiss Lehrplan 21 - Media and Informatics Module
Loads competencies from lehrplan21.json file
Reference: https://v-ef.lehrplan.ch/
"""

import json
import os

# Load competencies from JSON file
def load_competencies():
    """Load Lehrplan 21 competencies from JSON file"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    json_path = os.path.join(project_root, "data", "lehrplan21.json")
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    return {comp['id']: comp for comp in data['competencies']}

# Load competencies at module import
COMPETENCIES = load_competencies()

# Organize topics by domain and cycle
def get_lehrplan_topics():
    """Get topics organized by subject and cycle"""
    subjects = {
        "Media": {},
        "Informatics": {},
    }
    
    cycles = {
        "Cycle 1 (Kindergarten-Grade 2)": "1",
        "Cycle 2 (Grades 3-6)": "2",
        "Cycle 3 (Grades 7-9)": "3"
    }
    
    # Build competency lists for each subject and cycle
    for subject_name, subject_domain in [("Media", "media"), ("Informatics", "informatics")]:
        for cycle_name, cycle_id in cycles.items():
            # Get all competencies for this domain and cycle
            competencies_list = []
            for comp_id, comp in COMPETENCIES.items():
                if comp.get("domain") == subject_domain and cycle_id in comp.get("cycles", []):
                    competencies_list.append(
                        f"{comp['id']} - {comp.get('name', 'Unknown')} - {comp.get('focus', '')}"
                    )
            
            subjects[subject_name][cycle_name] = competencies_list
    
    return subjects

def get_subjects():
    """Return list of all subjects"""
    return ["Media", "Informatics"]

def get_cycles(subject):
    """Return list of cycles for a given subject"""
    topics = get_lehrplan_topics()
    return list(topics.get(subject, {}).keys())

def get_topics(subject, cycle):
    """Return list of topics for a given subject and cycle"""
    topics = get_lehrplan_topics()
    return topics.get(subject, {}).get(cycle, [])

def get_competency_details(competency_id):
    """Get detailed information about a specific competency"""
    if competency_id not in COMPETENCIES:
        raise ValueError(f"Competency ID '{competency_id}' not found")
    return COMPETENCIES.get(competency_id, None)

def get_competencies_by_cycle(cycle_id):
    """Get all competencies for a specific cycle"""
    return {
        comp_id: comp 
        for comp_id, comp in COMPETENCIES.items() 
        if cycle_id in comp.get('cycles', [])
    }

def get_competencies_by_domain(domain):
    """Get all competencies for a specific domain (media, informatics)"""
    return {
        comp_id: comp 
        for comp_id, comp in COMPETENCIES.items() 
        if comp.get('domain') == domain
    }

def get_all_cycles():
    """Get list of all cycle IDs"""
    return ["1", "2", "3"]

def get_all_domains():
    """Get list of all subject domains"""
    return ["media", "informatics"]
