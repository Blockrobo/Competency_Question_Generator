"""
Teacher interface for configuring worksheet generation with enhanced input handling
"""

from curriculum_topics import get_subjects, get_cycles, get_topics
import json
import os

class TeacherConfig:
    """Configuration object for teacher's worksheet preferences"""
    
    def __init__(self):
        self.language = 'en'
        self.competency_id = None
        self.subject = None
        self.cycle = None
        self.topic = None
        self.learning_objective = ""
        self.materials_available = ""
        self.time_available = ""
        self.teaching_ideas = ""
        self.class_size_composition = ""
        self.other_notes = ""
        self.uploaded_materials = []
        self.num_questions_per_level = 3
        self.include_lesson_ideas = True
        self.include_beginner = True
        self.include_intermediate = True
        self.include_advanced = True
    
    def to_dict(self):
        """Convert configuration to dictionary"""
        return {
            "language": self.language,
            "competency_id": self.competency_id,
            "subject": self.subject,
            "cycle": self.cycle,
            "topic": self.topic,
            "learning_objective": self.learning_objective,
            "class_context": {
                "materials_available": self.materials_available,
                "time_available": self.time_available,
                "teaching_ideas": self.teaching_ideas,
                "class_size_composition": self.class_size_composition,
                "other_notes": self.other_notes
            },
            "uploaded_materials": self.uploaded_materials,
            "num_questions_per_level": self.num_questions_per_level,
            "include_lesson_ideas": self.include_lesson_ideas,
            "difficulty_levels": {
                "beginner": self.include_beginner,
                "intermediate": self.include_intermediate,
                "advanced": self.include_advanced
            }
        }


def interactive_teacher_setup():
    """
    Interactive command-line interface for teachers to configure worksheet generation
    """
    print("\n" + "=" * 70)
    print("TEACHER WORKSHEET GENERATOR - LEHRPLAN 21")
    print("=" * 70)
    
    config = TeacherConfig()
    
    # Step 0: Select Language
    print("\n🌐 LANGUAGE SELECTION / SPRACHAUSWAHL")
    print("-" * 70)
    print("  1. English")
    print("  2. Deutsch (German)")
    
    while True:
        try:
            choice = int(input("\nSelect language / Sprache wählen (1-2): "))
            if choice == 1:
                config.language = 'en'
                break
            elif choice == 2:
                config.language = 'de'
                break
            else:
                print("Invalid choice. Please enter 1 or 2.")
        except ValueError:
            print("Please enter a number.")
    
    # Set language-specific labels
    if config.language == 'de':
        labels = {
            'step1': 'SCHRITT 1: Fachbereich auswählen',
            'step2': 'SCHRITT 2: Zyklus auswählen für',
            'step3': 'SCHRITT 3: Kompetenz auswählen',
            'step4': 'SCHRITT 4: Lernziel definieren',
            'step5': 'SCHRITT 5: Klassenkontext',
            'step6': 'SCHRITT 6: Einstellungen konfigurieren',
            'enter_subject': 'Fachbereich-Nummer eingeben',
            'enter_cycle': 'Zyklus-Nummer eingeben',
            'enter_topic': 'Kompetenz-Nummer eingeben',
            'learning_objective': 'Was sollen die Schüler am Ende können/verstehen?',
            'materials_prompt': 'Verfügbare Materialien (z.B. Computer, Tablets, Bastelmaterial)',
            'time_prompt': 'Verfügbare Zeit (z.B. 45 Minuten, 2 Lektionen)',
            'teaching_ideas_prompt': 'Unterrichtsideen oder bevorzugte Ansätze',
            'class_size_prompt': 'Klassengröße/Zusammensetzung (z.B. 20 Schüler, gemischte Fähigkeiten)',
            'other_notes_prompt': 'Weitere Hinweise (z.B. Vorkenntnisse, besondere Bedürfnisse)',
            'upload_prompt': 'Haben Sie Materialien zum Hochladen? (j/n)',
            'materials_path': 'Dateipfad eingeben (oder Enter zum Überspringen)',
            'questions_per_level': 'Anzahl Fragen pro Schwierigkeitsgrad (Standard 3)',
            'lesson_ideas': 'Unterrichtsideen einbeziehen? (j/n, Standard j)',
            'include_levels': 'Welche Schwierigkeitsgrade einbeziehen?',
            'include_beginner': '  Anfänger einbeziehen? (j/n, Standard j)',
            'include_intermediate': '  Mittelstufe einbeziehen? (j/n, Standard j)',
            'include_advanced': '  Fortgeschritten einbeziehen? (j/n, Standard j)',
            'summary': 'KONFIGURATIONSZUSAMMENFASSUNG',
            'subject': 'Fachbereich',
            'cycle': 'Zyklus',
            'competency': 'Kompetenz',
            'learning_obj': 'Lernziel',
            'materials': 'Verfügbare Materialien',
            'time': 'Verfügbare Zeit',
            'teaching': 'Unterrichtsideen',
            'class_size': 'Klassengröße/Zusammensetzung',
            'other': 'Weitere Hinweise',
            'uploaded': 'Hochgeladene Dateien',
            'questions': 'Fragen pro Schwierigkeitsgrad',
            'lesson_ideas_label': 'Unterrichtsideen',
            'difficulty': 'Schwierigkeitsgrade',
            'beginner': 'Anfänger',
            'intermediate': 'Mittelstufe',
            'advanced': 'Fortgeschritten',
            'proceed': 'Mit Generierung fortfahren? (j/n)',
            'cancelled': 'Konfiguration abgebrochen.',
            'yes': 'j',
            'invalid': 'Ungültige Eingabe. Bitte erneut versuchen.'
        }

    else:
        labels = {
            'step1': 'STEP 1: Select Subject',
            'step2': 'STEP 2: Select Cycle for',
            'step3': 'STEP 3: Select Competency',
            'step4': 'STEP 4: Define Learning Objective',
            'step5': 'STEP 5: Class Context',
            'step6': 'STEP 6: Configure Settings',
            'enter_subject': 'Enter subject number',
            'enter_cycle': 'Enter cycle number',
            'enter_topic': 'Enter competency number',
            'learning_objective': 'What should students be able to do/understand by the end?',
            'materials_prompt': 'Materials available (e.g., computers, tablets, art supplies)',
            'time_prompt': 'Time available (e.g., 45 minutes, 2 lessons)',
            'teaching_ideas_prompt': 'Teaching ideas or preferred approaches',
            'class_size_prompt': 'Class size/composition (e.g., 20 students, mixed ability)',
            'other_notes_prompt': 'Any other notes (e.g., prior knowledge, special needs)',
            'upload_prompt': 'Do you have materials to upload? (y/n)',
            'materials_path': 'Enter file path (or press Enter to skip)',
            'questions_per_level': 'Number of questions per difficulty level (default 3)',
            'lesson_ideas': 'Include lesson ideas? (y/n, default y)',
            'include_levels': 'Which difficulty levels to include?',
            'include_beginner': '  Include Beginner level? (y/n, default y)',
            'include_intermediate': '  Include Intermediate level? (y/n, default y)',
            'include_advanced': '  Include Advanced level? (y/n, default y)',
            'summary': 'CONFIGURATION SUMMARY',
            'subject': 'Subject',
            'cycle': 'Cycle',
            'competency': 'Competency',
            'learning_obj': 'Learning Objective',
            'materials': 'Materials Available',
            'time': 'Time Available',
            'teaching': 'Teaching Ideas',
            'class_size': 'Class Size/Composition',
            'other': 'Other Notes',
            'uploaded': 'Uploaded Files',
            'questions': 'Questions per level',
            'lesson_ideas_label': 'Include lesson ideas',
            'difficulty': 'Difficulty levels',
            'beginner': 'Beginner',
            'intermediate': 'Intermediate',
            'advanced': 'Advanced',
            'proceed': 'Proceed with generation? (y/n)',
            'cancelled': 'Configuration cancelled.',
            'yes': 'y',
            'invalid': 'Invalid choice. Please try again.'
        }

    
    # Step 1: Select Subject
    print(f"\n📚 {labels['step1']}")
    print("-" * 70)
    subjects = get_subjects(config.language)
    for i, subject in enumerate(subjects, 1):
        print(f"  {i}. {subject}")
    
    while True:
        try:
            choice = int(input(f"\n{labels['enter_subject']}: "))
            if 1 <= choice <= len(subjects):
                config.subject = subjects[choice - 1]
                break
            else:
                print(labels['invalid'])
        except ValueError:
            print("Please enter a number.")
    
    # Step 2: Select Cycle
    print(f"\n🎯 {labels['step2']} {config.subject}")
    print("-" * 70)
    cycles = get_cycles(config.subject, config.language)
    for i, cycle in enumerate(cycles, 1):
        print(f"  {i}. {cycle}")
    
    while True:
        try:
            choice = int(input(f"\n{labels['enter_cycle']}: "))
            if 1 <= choice <= len(cycles):
                config.cycle = cycles[choice - 1]
                break
            else:
                print(labels['invalid'])
        except ValueError:
            print("Please enter a number.")
    
    # Step 3: Select Topic/Competency
    print(f"\n📖 {labels['step3']}")
    print("-" * 70)
    topics = get_topics(config.subject, config.cycle, config.language)
    for i, topic in enumerate(topics, 1):
        # Show abbreviated version
        topic_parts = topic.split(' - ')
        if len(topic_parts) > 0:
            print(f"  {i}. {topic_parts[0]} - {topic_parts[1] if len(topic_parts) > 1 else ''}")
        else:
            print(f"  {i}. {topic}")
    
    while True:
        try:
            choice = int(input(f"\n{labels['enter_topic']}: "))
            if 1 <= choice <= len(topics):
                config.topic = topics[choice - 1]
                # Extract competency ID (e.g., MI_MEDIEN_1)
                config.competency_id = config.topic.split(' - ')[0].strip()
                break
            else:
                print(labels['invalid'])
        except ValueError:
            print("Please enter a number.")
    
    # Step 4: Define Learning Objective
    print(f"\n🎓 {labels['step4']}")
    print("-" * 70)
    print(f"{labels['learning_objective']}")
    config.learning_objective = input("> ")
    
    # Step 5: Class Context
    print(f"\n🏫 {labels['step5']}")
    print("-" * 70)
    config.materials_available = input(f"{labels['materials_prompt']}: ")
    config.time_available = input(f"{labels['time_prompt']}: ")
    config.teaching_ideas = input(f"{labels['teaching_ideas_prompt']}: ")
    config.class_size_composition = input(f"{labels['class_size_prompt']}: ")
    config.other_notes = input(f"{labels['other_notes_prompt']}: ")
    
    # Materials upload (simplified for command line)
    upload_response = input(f"\n{labels['upload_prompt']}: ").lower()
    if upload_response == labels['yes']:
        while True:
            material_path = input(f"{labels['materials_path']}: ")
            if material_path == "":
                break
            if os.path.exists(material_path):
                config.uploaded_materials.append(material_path)
                print(f"  ✓ Added: {os.path.basename(material_path)}")
            else:
                print(f"  ✗ File not found: {material_path}")
    
    # Step 6: Configure Question Settings
    print(f"\n⚙️  {labels['step6']}")
    print("-" * 70)
    
    try:
        num = int(input(f"{labels['questions_per_level']}: ") or "3")
        config.num_questions_per_level = num
    except ValueError:
        print("Using default: 3 questions per level")
    
    lesson_ideas = input(f"{labels['lesson_ideas']}: ").lower() or labels['yes']
    config.include_lesson_ideas = lesson_ideas == labels['yes']
    
    # Select Difficulty Levels
    print(f"\n{labels['include_levels']}")
    beginner = input(f"{labels['include_beginner']}: ").lower() or labels['yes']
    config.include_beginner = beginner == labels['yes']
    
    intermediate = input(f"{labels['include_intermediate']}: ").lower() or labels['yes']
    config.include_intermediate = intermediate == labels['yes']
    
    advanced = input(f"{labels['include_advanced']}: ").lower() or labels['yes']
    config.include_advanced = advanced == labels['yes']
    
    # Summary
    print("\n" + "=" * 70)
    print(labels['summary'])
    print("=" * 70)
    print(f"{labels['subject']}: {config.subject}")
    print(f"{labels['cycle']}: {config.cycle}")
    print(f"{labels['competency']}: {config.competency_id}")
    print(f"{labels['learning_obj']}: {config.learning_objective}")
    if config.materials_available:
        print(f"{labels['materials']}: {config.materials_available}")
    if config.time_available:
        print(f"{labels['time']}: {config.time_available}")
    if config.teaching_ideas:
        print(f"{labels['teaching']}: {config.teaching_ideas}")
    if config.class_size_composition:
        print(f"{labels['class_size']}: {config.class_size_composition}")
    if config.other_notes:
        print(f"{labels['other']}: {config.other_notes}")
    if config.uploaded_materials:
        print(f"{labels['uploaded']}: {len(config.uploaded_materials)} file(s)")
    print(f"{labels['questions']}: {config.num_questions_per_level}")
    print(f"{labels['lesson_ideas_label']}: {config.include_lesson_ideas}")
    print(f"{labels['difficulty']}: ", end="")
    levels = []
    if config.include_beginner:
        levels.append(labels['beginner'])
    if config.include_intermediate:
        levels.append(labels['intermediate'])
    if config.include_advanced:
        levels.append(labels['advanced'])
    print(", ".join(levels))
    print("=" * 70)
    
    confirm = input(f"\n{labels['proceed']}: ").lower()
    if confirm != labels['yes']:
        print(labels['cancelled'])
        return None
    
    return config

if __name__ == "__main__":
    config = interactive_teacher_setup()
    if config:
        print("\n✓ Configuration complete!")
        print(f"\nConfiguration: {json.dumps(config.to_dict(), indent=2)}")
