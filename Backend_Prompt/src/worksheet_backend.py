import json
import os
import PyPDF2
import docx
from openai import OpenAI


def extract_material_content(file_path):
    """
    Extract content from uploaded materials
    Supports: .txt, .pdf, .docx, .md
    """
    import os

    if not os.path.exists(file_path):
        return f"File not found: {file_path}"

    ext = os.path.splitext(file_path)[1].lower()

    try:
        if ext == ".txt" or ext == ".md":
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                # Summarize if too long (>2000 chars)
                if len(content) > 2000:
                    return f"[Text file, {len(content)} chars]: {content[:500]}... [truncated]"
                return f"[Text file]: {content}"

        elif ext == ".pdf":
            content = ""
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    content += page.extract_text()
            if len(content) > 2000:
                return (
                    f"[PDF file, {len(content)} chars]: {content[:500]}... [truncated]"
                )
            return f"[PDF file]: {content}"

        elif ext == ".docx":
            doc = docx.Document(file_path)
            content = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            if len(content) > 2000:
                return (
                    f"[Word file, {len(content)} chars]: {content[:500]}... [truncated]"
                )
            return f"[Word file]: {content}"

        else:
            return f"[{ext} file]: {os.path.basename(file_path)} (unsupported format)"

    except Exception as e:
        return f"[Error reading {os.path.basename(file_path)}]: {str(e)}"


def summarize_uploaded_materials(config):
    """
    Extract and summarize content from all uploaded materials
    """
    if not config.uploaded_materials:
        return "No materials uploaded."

    summaries = []
    for material_path in config.uploaded_materials:
        content = extract_material_content(material_path)
        summaries.append(content)

    return "\n\n".join(summaries)


# Define competency levels
COMPETENCY_LEVELS = ["beginner", "intermediate", "advanced"]

# OpenAI configuration
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
openai_client = OpenAI()


def build_system_prompt(config, level):
    """
    Build the system prompt for the LLM based on the new template.
    """
    from curriculum_topics import get_competency_details
    import json
    import os

    # Load the single description file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)

    desc_path = os.path.join(project_root, "data", "level_descriptors.json")
    with open(desc_path, "r", encoding="utf-8") as f:
        level_descriptors = json.load(f)

    # Get competency details
    competency = get_competency_details(config.competency_id)

    # Summarize materials
    summarised_materials = summarize_uploaded_materials(config)

    additional_input = f"{config.other_notes}\n{summarised_materials}"

    # Get the descriptions and examples from the single file
    description = level_descriptors[level]["description"]
    example_activities_list = level_descriptors[level]["example_activities"]
    example_activities = "\n".join(
        [f"- {example}" for example in example_activities_list]
    )

    prompt = f"""You are an expert lesson activity designer specialised in Swiss Medien und Informatik aligned with Lehrplan 21.

This is the competency they are focusing on: {competency['name']}.

This is how many students are in the class: {config.class_size_composition}.

This is the profile of the class composition: {config.class_composition}.

This is the time available: {config.time_available} minutes.

Those are the materials available to the teacher: {config.materials_available} .

This is the learning objective: {config.learning_objective}.

Here is the teacher's idea. It details what thoughts they want to build on in order to achieve the learning objective:  {config.teaching_ideas}.

This is any additional input they have, such as study materials or information etc. This can be useful for you to understand the context: {additional_input}.

Your task is to generate a list of lesson activities for a single learner level. This can range from active activities to simple blocks of questions, whatever fits the context best. In this case generate ideas for the following learner level: {level}. 

Here is what a student can do on that level: {description}

Some example activities would include the following though beware that this is not a definite list and that you can come up with other ideas, those just help you to understand the level better: {example_activities}. 

Lastly, here is some general guidance that should help you understand the level and what to think about: {description}



---

For each activity, provide the following fields in the JSON output:

- title: a concise activity name.
    
- difficulty_level: the learner level ({level}).
    
- estimated_duration: estimated time needed in minutes.
    
- materials_needed: list of materials or tools required.
    
- min_number_students: ideal minimum class size.
    
- max_number_students: ideal maximum class size.
    
- description: a clear detailed explanation of the activity, its purpose, how students engage, and expected outcomes.
    

Make sure all generated activities strictly align with the teacher's learning objective and the selected Lehrplan 21 competency.

Adapt activities to meet the cognitive and scaffolding needs typical of the specified learner level.


Output ONLY valid JSON containing an array called "activities" structured as specified.

Do not include any text or formatting outside of this JSON.
"""
    return prompt


import re


def parse_agent_response(agent_response):
    """
    Parse a potentially messy LLM response to extract a JSON object or array.
    Handles markdown fences and other surrounding text.
    """
    json_text = ""
    try:
        # First, try to find JSON within markdown fences
        match = re.search(r"```(json)?\s*([\s\S]*?)\s*```", agent_response)
        if match:
            json_text = match.group(2)
        else:
            # If no markdown, find the first '{' or '[' and last '}' or ']'
            start_brace = agent_response.find("{")
            start_bracket = agent_response.find("[")

            if start_brace == -1 and start_bracket == -1:
                raise ValueError("No JSON object or array found in the response.")

            if start_brace == -1:
                start = start_bracket
            elif start_bracket == -1:
                start = start_brace
            else:
                start = min(start_brace, start_bracket)

            end_brace = agent_response.rfind("}")
            end_bracket = agent_response.rfind("]")

            if end_brace == -1 and end_bracket == -1:
                # This case should be rare if start was found
                raise ValueError("Unbalanced JSON object or array found.")

            end = max(end_brace, end_bracket)

            json_text = agent_response[start : end + 1]

        # Now, try to parse the extracted text
        parsed = json.loads(json_text)

        # If the result is an object with an "activities" key, return the list
        if isinstance(parsed, dict) and "activities" in parsed:
            return parsed["activities"]

        # Otherwise, return the parsed JSON (which should be a list)
        return parsed

    except (ValueError, json.JSONDecodeError) as e:
        print(f"Warning: Could not parse JSON from response. Error: {e}")
        print(f"--- Raw Response --- \n{agent_response}\n--------------------")
        print(f"--- Extracted JSON Text ---\n{json_text}\n-------------------------")
        return [{"description": agent_response, "title": "Error parsing response"}]


def run_openai_chat(messages, temperature: float = 0.4) -> str:
    """
    Call OpenAI's Chat Completions API and return the string content.
    """
    completion = openai_client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=messages,
        temperature=temperature,
    )
    message = completion.choices[0].message if completion.choices else None
    content = message.content if message else ""
    if isinstance(content, list):
        content = "".join(
            part.get("text", "")
            for part in content
            if isinstance(part, dict) and part.get("type") == "text"
        )
    return content if content is not None else ""


def assess_student_response(question, student_answer, difficulty_level):
    """
    Assess student response and assign competency level
    """
    # This function needs to be adapted to the new prompt structure if it's to be used.
    # For now, it's not the main focus of the refactoring.
    # We can create a simple prompt for assessment.

    assessment_prompt = f"""Assess this student response:

Question: {question}
Student Answer: {student_answer}

Provide:
1. Chain-of-thought analysis of the response
2. Competency level from: {COMPETENCY_LEVELS}
3. Specific feedback for the student
4. Evidence supporting the competency rating
"""

    messages = [
        {"role": "system", "content": "You are an expert in educational assessment."},
        {"role": "user", "content": assessment_prompt},
    ]

    return run_openai_chat(messages)


# Test the system with teacher interface
if __name__ == "__main__":
    from teacher_interface import interactive_teacher_setup

    # Get configuration from teacher
    config = interactive_teacher_setup()

    if config is None:
        print("Exiting...")
        exit()

    print("\n" + "=" * 70)
    print("GENERATING WORKSHEET...")
    print("=" * 70)

    # Determine which difficulty levels to include
    difficulty_levels = []
    if config.include_beginner:
        difficulty_levels.append("beginner")
    if config.include_intermediate:
        difficulty_levels.append("intermediate")
    if config.include_advanced:
        difficulty_levels.append("advanced")

    # Generate worksheet
    worksheet = {
        "subject": config.subject,
        "cycle": config.cycle,
        "topic": config.topic,
        "competency_id": config.competency_id,
        "learning_objective": config.learning_objective,
        "class_context": {
            "materials_available": config.materials_available,
            "time_available": config.time_available,
            "teaching_ideas": config.teaching_ideas,
            "class_size_composition": config.class_size_composition,
            "other_notes": config.other_notes,
        },
        "activities": [],
        "lesson_ideas": None,
    }

    # Generate questions for each selected difficulty level
    for difficulty in difficulty_levels:
        print(f"\n--- Generating {difficulty} activities ---")

        system_prompt = build_system_prompt(config, difficulty)

        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"Generate {config.num_questions_per_level} activities for the {difficulty} level.",
            },
        ]

        raw_response = run_openai_chat(messages)

        structured_activities = parse_agent_response(raw_response)

        worksheet["activities"].extend(structured_activities)

        print(f"✓ {difficulty.capitalize()} activities generated and structured")

    # Generate lesson ideas if requested
    if config.include_lesson_ideas:
        print(f"\n--- Generating lesson ideas ---")

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
            {
                "role": "system",
                "content": "You are an expert education consultant specializing in Swiss Lehrplan 21 curriculum design.",
            },
            {"role": "user", "content": lesson_prompt},
        ]

        lesson_response = run_openai_chat(messages)

        worksheet["lesson_ideas"] = parse_agent_response(lesson_response)
        print(f"✓ Lesson ideas generated and structured")

    # Display results
    print("\n" + "=" * 70)
    print("GENERATED WORKSHEET")
    print("=" * 70)
    print(f"Subject: {worksheet['subject']}")
    print(f"Cycle: {worksheet['cycle']}")
    print(f"Competency: {worksheet['competency_id']}")
    print(f"Learning Objective: {worksheet['learning_objective']}")

    if worksheet.get("lesson_ideas"):
        print("\n[LESSON IDEAS]")
        print("-" * 70)
        for idea in worksheet["lesson_ideas"]:
            print(f"  Title: {idea.get('title', 'N/A')}")
            print(f"  Duration: {idea.get('estimated_duration', 'N/A')}")
            print(f"  Description: {idea.get('activity_description', 'N/A')}")
            print("-" * 20)
        print()

    print("\n[ACTIVITIES]")
    print("-" * 70)
    for activity in worksheet["activities"]:
        print(f"  Title: {activity.get('title', 'N/A')}")
        print(f"  Difficulty: {activity.get('difficulty_level', 'N/A')}")
        print(f"  Duration: {activity.get('estimated_duration', 'N/A')} minutes")
        print(f"  Description: {activity.get('description', 'N/A')}")
        print("-" * 20)
    print()

    # Save to file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    output_dir = os.path.join(project_root, "output")

    os.makedirs(output_dir, exist_ok=True)

    safe_filename = (
        f"worksheet_{config.competency_id}_{config.cycle.replace(' ', '_')}.json"
    )
    output_file = os.path.join(output_dir, safe_filename)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(worksheet, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Worksheet saved to: {output_file}")
    print("\n" + "=" * 70)
