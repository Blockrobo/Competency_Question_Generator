from flask import Flask, request, jsonify
from flask_cors import CORS
from teacher_interface import TeacherConfig
from worksheet_backend import build_system_prompt, parse_agent_response
import ollama

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
MODEL = "llama3.2"

@app.route('/api/generate_worksheet', methods=['POST'])
def generate_worksheet():
    """
    API endpoint to generate worksheet
    
    Expected JSON body:
    {
        "competency_id": "MI_MEDIEN_1_A",
        "subject": "Media",
        "cycle": "Cycle 2 (Grades 3-6)",
        "learning_objective": "...",
        "materials_available": "...",
        "time_available": "...",
        "num_questions_per_level": 3,
        "include_beginner": true,
        "include_intermediate": true,
        "include_advanced": true,
        "include_lesson_ideas": true
    }
    """
    try:
        data = request.json
        
        # Create config from API request
        config = TeacherConfig()
        config.competency_id = data.get('competency_id')
        config.subject = data.get('subject')
        config.cycle = data.get('cycle')
        config.learning_objective = data.get('learning_objective', '')
        config.materials_available = data.get('materials_available', '')
        config.time_available = data.get('time_available', '')
        config.teaching_ideas = data.get('teaching_ideas', '')
        config.class_size_composition = data.get('class_size_composition', '')
        config.other_notes = data.get('other_notes', '')
        config.num_questions_per_level = data.get('num_questions_per_level', 3)
        config.include_beginner = data.get('include_beginner', True)
        config.include_intermediate = data.get('include_intermediate', True)
        config.include_advanced = data.get('include_advanced', True)
        config.include_lesson_ideas = data.get('include_lesson_ideas', False)
        
        # Validate required fields
        if not config.competency_id or not config.learning_objective:
            return jsonify({"error": "Missing required fields: competency_id, learning_objective"}), 400
        
        # Determine difficulty levels
        difficulty_levels = []
        if config.include_beginner:
            difficulty_levels.append("beginner")
        if config.include_intermediate:
            difficulty_levels.append("intermediate")
        if config.include_advanced:
            difficulty_levels.append("advanced")
        
        # Generate worksheet
        worksheet = {
            "competency_id": config.competency_id,
            "learning_objective": config.learning_objective,
            "activities": [],
            "lesson_ideas": None
        }
        
        # Generate for each difficulty level
        for difficulty in difficulty_levels:
            system_prompt = build_system_prompt(config, difficulty)
            
            user_prompt = f"Generate {config.num_questions_per_level} activities for the {difficulty} level."
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            response = ollama.chat(model=MODEL, messages=messages)
            raw_response = response['message']['content']
            
            structured_activities = parse_agent_response(raw_response)
            
            worksheet["activities"].extend(structured_activities)
            
        # Generate lesson ideas if requested
        if config.include_lesson_ideas:
            lesson_prompt = f"""
Based on the following context, generate 3-5 creative lesson ideas.

Lehrplan 21 Competency: {config.competency_id}
Learning Objective: {config.learning_objective}
Class Context: {config.class_size_composition}, {config.time_available}
Materials: {config.materials_available}

Structure your ideas as an array of JSON objects, each with:
- title
- learning_objectives
- activity_description
- materials_needed
- estimated_duration

**IMPORTANT:** Your entire response must be a single, valid JSON array. Do not include any introductory text, explanations, or markdown formatting. The response should start with `[` and end with `]`.
"""
            
            messages = [
                {"role": "system", "content": "You are an expert education consultant specializing in Swiss Lehrplan 21 curriculum design."},
                {"role": "user", "content": lesson_prompt}
            ]
            
            response = ollama.chat(
                model=MODEL,
                messages=messages
            )
            
            worksheet["lesson_ideas"] = parse_agent_response(response['message']['content'])

        return jsonify(worksheet), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/cycles', methods=['GET'])
def get_cycles():
    """
    Get list of all available cycles
    
    Returns:
    {
        "cycles": [
            {"id": "1", "name": "Cycle 1 (Kindergarten-Grade 2)"},
            {"id": "2", "name": "Cycle 2 (Grades 3-6)"},
            {"id": "3", "name": "Cycle 3 (Grades 7-9)"}
        ]
    }
    """
    cycles = [
        {"id": "1", "name": "Cycle 1 (Kindergarten-Grade 2)"},
        {"id": "2", "name": "Cycle 2 (Grades 3-6)"},
        {"id": "3", "name": "Cycle 3 (Grades 7-9)"}
    ]
    return jsonify({"cycles": cycles}), 200


@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    """
    Get list of subject domains
    
    Returns:
    {
        "subjects": [
            {"id": "media", "name": "Media"},
            {"id": "informatics", "name": "Informatics"}
        ]
    }
    """
    subjects = [
        {"id": "media", "name": "Media"},
        {"id": "informatics", "name": "Informatics"}
    ]
    return jsonify({"subjects": subjects}), 200


@app.route('/api/competencies', methods=['GET'])
def get_all_competencies():
    """
    Get list of all available competencies (not filtered by cycle)
    
    Returns:
    {
        "competencies": [
            {
                "id": "MI_MEDIEN_1_A",
                "name": "Life in Media Society",
                "domain": "media",
                "cycles": ["1", "2", "3"]
            },
            ...
        ]
    }
    """
    from curriculum_topics import COMPETENCIES
    
    return jsonify({
        "competencies": [
            {
                "id": comp_id,
                "name": comp.get("name", "Unknown"),
                "domain": comp.get("domain", "unknown"),
                "cycles": comp.get("cycles", [])
            }
            for comp_id, comp in COMPETENCIES.items()
        ]
    }), 200


@app.route('/api/competencies/<cycle_id>', methods=['GET'])
def get_competencies_by_cycle(cycle_id):
    """
    Get competencies filtered by cycle
    
    URL parameters:
        cycle_id: "1", "2", or "3"
    
    Query parameters:
        subject: filter by subject domain (optional)
    
    Returns:
    {
        "cycle": "2",
        "competencies": [
            {
                "id": "MI_MEDIEN_1_A",
                "name": "Life in Media Society",
                "domain": "media",
                "cycles": ["1", "2", "3"]
            },
            ...
        ]
    }
    """
    from curriculum_topics import COMPETENCIES
    
    subject_filter = request.args.get('subject', None)
    
    # Filter competencies by cycle
    filtered_competencies = [
        {
            "id": comp_id,
            "name": comp.get("name", "Unknown"),
            "domain": comp.get("domain", "unknown"),
            "cycles": comp.get("cycles", [])
        }
        for comp_id, comp in COMPETENCIES.items()
        if cycle_id in comp.get("cycles", [])
    ]
    
    # Optionally filter by subject
    if subject_filter:
        filtered_competencies = [
            c for c in filtered_competencies 
            if c["domain"] == subject_filter
        ]
    
    return jsonify({
        "cycle": cycle_id,
        "competencies": filtered_competencies
    }), 200


@app.route('/api/competency/<competency_id>', methods=['GET'])
def get_competency_details(competency_id):
    """
    Get detailed information about a specific competency
    
    URL parameters:
        competency_id: e.g., "MI_MEDIEN_1_A"
    
    Returns:
    {
        "id": "MI_MEDIEN_1_A",
        "name": "Life in Media Society",
        "focus": "Pupils can orient themselves...",
        "domain": "media",
        "cycles": ["1", "2", "3"]
    }
    """
    from curriculum_topics import COMPETENCIES
    
    if competency_id not in COMPETENCIES:
        return jsonify({"error": "Competency not found"}), 404
    
    comp = COMPETENCIES[competency_id]
    
    return jsonify({
        "id": competency_id,
        "name": comp.get("name", "Unknown"),
        "focus": comp.get("focus", ""),
        "domain": comp.get("domain", "unknown"),
        "cycles": comp.get("cycles", [])
    }), 200


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify API is running
    
    Returns:
    {
        "status": "healthy",
        "version": "1.0",
        "model": "llama3.2"
    }
    """
    return jsonify({
        "status": "healthy",
        "version": "1.0",
        "model": MODEL
    }), 200


if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Lehrplan 21 Worksheet Generator API")
    print("=" * 60)
    print("Available endpoints:")
    print("  GET  /api/health")
    print("  GET  /api/cycles")
    print("  GET  /api/subjects")
    print("  GET  /api/competencies")
    print("  GET  /api/competencies/<cycle_id>?subject=media")
    print("  GET  /api/competency/<competency_id>")
    print("  POST /api/generate_worksheet")
    print("=" * 60)
    print("Server running at: http://localhost:5000")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)
