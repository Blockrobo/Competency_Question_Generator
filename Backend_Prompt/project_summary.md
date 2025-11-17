\# Lehrplan 21 Worksheet Generator - Project Documentation

\*\*Created:\*\* November 15-17, 2025  

\*\*Version:\*\* 1.0  

\*\*Framework:\*\* Multi-Agent AI System with Few-Shot + Chain-of-Thought Prompting  

\*\*Technology:\*\* Python 3.8+, Ollama (Local LLM), Swiss Lehrplan 21 Curriculum

---

\## Executive Summary

This project is a \*\*multi-agent AI system\*\* that generates educational worksheets and lesson plans for Swiss Lehrplan 21 Media and Informatics competencies. The system uses three specialized AI agents operating at different difficulty levels (beginner, intermediate, advanced) with educational scaffolding principles, few-shot prompting, and chain-of-thought reasoning.



The system is designed for \*\*teachers\*\* to input their learning objectives, class context, and curriculum competencies, and automatically generate aligned questions and lesson ideas that follow evidence-based educational progression frameworks.

---

\## System Architecture

\### Core Components

1\. \*\*Multi-Agent System\*\* - Three specialized agents: Beginner, Intermediate, Advanced   

&nbsp;  - Each agent implements distinct scaffolding approaches   

&nbsp;  - Uses few-shot + chain-of-thought prompting methodology

2\. \*\*Curriculum Integration\*\* - Official Lehrplan 21 competencies (Media \& Informatics)   

&nbsp;  - Bilingual support (English/German)   

&nbsp;  - Stored in JSON database for easy updates

3\. \*\*Teacher Input Pipeline\*\* - Interactive command-line interface   

&nbsp;  - Collects learning objectives and class context   

&nbsp;  - Supports material uploads

4\. \*\*Prompt Orchestration\*\* - Builds shared context from all inputs   

&nbsp;  - Merges competency definitions with teacher requirements   

&nbsp;  - Includes scaffolding framework in every prompt

---

\## Educational Scaffolding Framework

Based on educational research, the system implements three distinct levels:



\### Beginner Level

\- \*\*Scaffolding:\*\* High (templates, worked examples)

\- \*\*Cognitive Type:\*\* Recall, recognition, simple comprehension

\- \*\*Independence:\*\* Dependent on explicit prompts

\- \*\*Problem Space:\*\* Well-defined, single solution

\- \*\*Prior Knowledge:\*\* Explicitly taught in activity



\### Intermediate Level

\- \*\*Scaffolding:\*\* Medium (frameworks, guiding questions)

\- \*\*Cognitive Type:\*\* Application, analysis, simple reasoning

\- \*\*Independence:\*\* Moderate independence with structure

\- \*\*Problem Space:\*\* Defined with multiple valid solutions

\- \*\*Prior Knowledge:\*\* Assumed from beginner level



\### Advanced Level

\- \*\*Scaffolding:\*\* Low (minimal guidance)

\- \*\*Cognitive Type:\*\* Evaluation, creation, independent reasoning

\- \*\*Independence:\*\* Full autonomy

\- \*\*Problem Space:\*\* Ill-defined, learner helps define it

\- \*\*Prior Knowledge:\*\* Synthesis of multiple concepts

---

\## Lehrplan 21 Competencies

\### Media Domain (MI\_MEDIEN)

\*\*MI\_MEDIEN\_1 - Orientation and Behaviour in Media Environments\*\*

\- Pupils can orient themselves in physical, media and virtual environments and behave in accordance with laws, rules and values.



\*\*MI\_MEDIEN\_2 - Media Decoding and Reflection\*\*

\- Pupils can interpret, reflect on and use media and media contributions.



\*\*MI\_MEDIEN\_3 - Media Production and Publishing\*\*

\- Pupils can transform ideas, opinions, experiences and knowledge into media contributions and publish them, considering laws, rules, and values.



\*\*MI\_MEDIEN\_4 - Communicate and Cooperate Using Media\*\*

\- Pupils can use media interactively and communicate and collaborate with others.



\### Informatics Domain (MI\_INFORMATIK)

\*\*MI\_INFORMATIK\_1 - Structuring, Organising and Analysing Data\*\*

\- Pupils can represent, organise and evaluate data from their environment.



\*\*MI\_INFORMATIK\_2 - Problem Solving and Programming\*\*

\- Pupils can analyse simple problems, describe possible solutions and implement them in programs.



\*\*MI\_INFORMATIK\_3 - Understanding Information Systems and Data Security\*\*

\- Pupils understand the structure and function of information processing systems and can apply data security concepts.

---

\## Teacher Input Fields

The system collects the following information from teachers:



1\. \*\*Language Selection:\*\* English or German

2\. \*\*Competency Selection:\*\* Choose from Media or Informatics competencies

3\. \*\*Learning Objective:\*\* What students should achieve

4\. \*\*Class Context:\*\* - Materials available   

&nbsp;  - Time available   

&nbsp;  - Teaching ideas or preferred approaches   

&nbsp;  - Class size/composition   

&nbsp;  - Any other notes

5\. \*\*Material Uploads:\*\* Optional file attachments

6\. \*\*Configuration:\*\* - Number of questions per difficulty level   

&nbsp;  - Which difficulty levels to include   

&nbsp;  - Whether to generate lesson ideas

---

\## Technical Implementation

\### Technology Stack

\- \*\*Language:\*\* Python 3.8+

\- \*\*LLM Engine:\*\* Ollama (free, local deployment)

\- \*\*Model:\*\* Llama 3.2 (or 3b variant for CPU)

\- \*\*Dependencies:\*\* `ollama`, `openai` (for API compatibility)



\### Project Structure

C:\\Users\\Orestis\\Documents\\PROMPT ├── src │ ├── worksheet\_backend.py # Main multi-agent system │ ├── teacher\_interface.py # Interactive teacher interface │ └── curriculum\_topics.py # Lehrplan 21 competency loader ├── data │ ├── lehrplan21.json # Official competency definitions (bilingual) │ └── level\_descriptors.json # Scaffolding framework definitions ├── output\\ # Generated worksheets (JSON format) ├── venv\\ # Python virtual environment ├── requirements.txt # Python dependencies ├── README.md # Setup and usage instructions └── PROJECT\_SUMMARY.md # This file





\### Key Files

\*\*`src/worksheet\_backend.py`\*\*

\- Contains the three agent definitions (beginner, intermediate, advanced)

\- Implements prompt orchestration with shared context

\- Handles worksheet generation and file output

\- Includes student response assessment function



\*\*`src/teacher\_interface.py`\*\*

\- Interactive CLI for teacher input

\- Bilingual interface (English/German)

\- Collects all necessary context information

\- Returns TeacherConfig object



\*\*`src/curriculum\_topics.py`\*\*

\- Loads competencies from JSON database

\- Provides bilingual topic selection

\- Helper functions for accessing competency details



\*\*`data/lehrplan21.json`\*\*

\- Official Lehrplan 21 competency definitions

\- Includes ID, German name, English name, German focus, English focus

\- 7 total competencies (4 Media, 3 Informatics)



\*\*`data/level\_descriptors.json`\*\*

\- Educational scaffolding framework

\- Defines characteristics of beginner/intermediate/advanced levels

\- Used in prompt orchestration

---

\## How It Works

\### Workflow

1\. \*\*Teacher Configuration\*\* - Teacher selects language (English/German)   

&nbsp;  - Chooses subject (Media/Informatics)   

&nbsp;  - Selects cycle (Grades 3-6 or 7-9)   

&nbsp;  - Picks specific competency   

&nbsp;  - Defines learning objective   

&nbsp;  - Provides class context   

&nbsp;  - Configures generation settings

2\. \*\*Context Building\*\* - System loads competency details from JSON   

&nbsp;  - Loads level descriptors from JSON   

&nbsp;  - Builds shared context string merging:     

&nbsp;    - Competency definition     

&nbsp;    - Learning objective     

&nbsp;    - Class context     

&nbsp;    - Scaffolding framework     

&nbsp;    - Uploaded materials info

3\. \*\*Question Generation\*\* - For each selected difficulty level:     

&nbsp;    - Route to appropriate agent     

&nbsp;    - Attach shared context     

&nbsp;    - Add level-specific instructions     

&nbsp;    - Send to Ollama LLM     

&nbsp;    - Parse and store response

4\. \*\*Lesson Ideas Generation\*\* (optional)   

&nbsp;  - Use shared context   

&nbsp;  - Request 3-5 creative lesson ideas   

&nbsp;  - Aligned with learning objectives   

&nbsp;  - Consider available materials and time

5\. \*\*Output\*\* - Display results to console   

&nbsp;  - Save worksheet as JSON file   

&nbsp;  - Filename: `worksheet\_{COMPETENCY\_ID}\_{CYCLE}.json`

---

\## Agent Definitions

\### Beginner Agent

\*\*Role:\*\* Create beginner-level questions with high scaffolding

\*\*Key Instructions:\*\*

\- Always include templates, examples, or models to follow

\- Create questions testing recall, recognition, and simple comprehension

\- Provide explicit step-by-step guidance and prompts

\- Design well-defined problems with clear, single solutions

\- Include all necessary knowledge within the question itself

\*\*Example Approaches:\*\*

\- Provide complete templates for students to follow

\- Use worked examples showing each step

\- Ask students to identify or recall information

\- Give explicit prompts like 'First do X, then do Y'



\### Intermediate Agent

\*\*Role:\*\* Create intermediate-level questions with medium scaffolding

\*\*Key Instructions:\*\*

\- Provide frameworks and guiding questions rather than complete templates

\- Create questions requiring application, analysis, and reasoning

\- Design for moderate independence while providing structure

\- Allow multiple valid solution approaches within defined constraints

\- Build upon beginner-level concepts without re-teaching them

\*\*Example Approaches:\*\*

\- Provide frameworks or checklists to guide thinking

\- Ask guiding questions rather than giving steps

\- Require application of concepts to new situations

\- Allow multiple valid approaches to solve the problem



\### Advanced Agent

\*\*Role:\*\* Create advanced-level questions with low scaffolding

\*\*Key Instructions:\*\*

\- Provide minimal scaffolding - let students define their approach

\- Create questions requiring evaluation, creation, and independent reasoning

\- Design for full autonomy in problem-solving process

\- Create ill-defined problems where students help define the scope

\- Require synthesis and integration of multiple Lehrplan 21 competency areas

\*\*Example Approaches:\*\*

\- Student defines their own approach and process

\- Require evaluation of multiple perspectives

\- Create original solutions or artifacts

\- Problem constraints are open-ended

---

\## Installation \& Setup

\### Prerequisites

\- Windows 10 or later

\- Python 3.8+

\- 8GB RAM minimum (16GB recommended)

\- Internet connection (for initial Ollama setup)



\### Step-by-Step Installation

1\. \*\*Install Ollama\*\*

Download fromshttps://ollama.com/download

Install and restart terminal

Pull the model:

ollama pull llama3.2





2\. \*\*Set Up Project\*\*

cd C:\\Users\\YOUR\_USERNAME\\Documents\\PROMPT python -m venv venv venv\\Scripts\\activate pip install ollama openai





3\. \*\*Create Data Files\*\*

\- Create `data/lehrplan21.json` (see full content in code files)

\- Create `data/level\_descriptors.json` (see full content in code files)

4\. \*\*Run the System\*\*

python src\\worksheet\_backend.py



---

\## Usage Guide

\### Running the Generator

1\. Activate virtual environment:

venv\\Scripts\\activate





2\. Run the main script:

python src\\worksheet\_backend.py





3\. Follow the interactive prompts:

\- Select language

\- Choose subject and cycle

\- Pick competency

\- Define learning objective

\- Provide class context

\- Configure settings

4\. Review generated worksheet in console

5\. Find saved JSON file in `output/` directory



\### Output Format

Generated worksheets are saved as JSON files containing:

\- Subject and cycle information

\- Competency ID and details

\- Learning objective

\- Class context

\- Questions for each difficulty level

\- Lesson ideas (if requested)

\- Competency framework used

---

\## Example Use Case

\*\*Teacher:\*\* Ms. Schmidt, Grade 5 teacher in Zurich

\*\*Objective:\*\* Students should understand how to organize data in simple tables and charts

\*\*Context:\*\*

\- Materials: 15 iPads with Numbers app

\- Time: 90 minutes (2 lessons)

\- Class: 18 students, mixed ability

\- Note: Students have basic iPad skills but haven't used spreadsheets before

\*\*System Output:\*\*

\- 3 beginner questions with templates and worked examples

\- 3 intermediate questions with frameworks for data organization

\- 3 advanced questions requiring students to design their own data collection projects

\- 5 lesson ideas incorporating iPads and Numbers app

\- All aligned with MI\_INFORMATIK\_1 competency

---

\## Key Features

✅ Multi-agent architecture with specialized prompting  

✅ Educational scaffolding framework integration  

✅ Bilingual support (English/German)  

✅ Official Lehrplan 21 competency alignment  

✅ Teacher-customizable learning objectives  

✅ Class context consideration  

✅ Few-shot + chain-of-thought prompting  

✅ Local LLM deployment (free, private)  

✅ JSON-based competency database  

✅ Automated lesson idea generation  

✅ Competency-based assessment framework  

---

\## Future Enhancements

\### Potential Additions

1\. Web interface (Flask/FastAPI) instead of CLI

2\. Database integration for storing worksheets

3\. Student response assessment interface

4\. Analytics dashboard for tracking competency progression

5\. Export to PDF or Word format

6\. Question bank for reuse

7\. More Lehrplan 21 subject areas

8\. Collaborative features for teacher teams

9\. Integration with learning management systems

10\. Automated translation between German and English

---

\## Troubleshooting

\### Common Issues

\*\*Issue:\*\* "ollama not recognized"  

\*\*Solution:\*\* Restart terminal after installing Ollama



\*\*Issue:\*\* Model not found  

\*\*Solution:\*\* Run `ollama pull llama3.2`



\*\*Issue:\*\* Slow generation  

\*\*Solution:\*\* Use smaller model `ollama pull llama3.2:3b` for CPU



\*\*Issue:\*\* Import errors  

\*\*Solution:\*\* Ensure virtual environment is activated and dependencies installed



\*\*Issue:\*\* JSON file not found  

\*\*Solution:\*\* Verify `data/lehrplan21.json` and `data/level\_descriptors.json` exist

---

\## Development Notes

\### Design Decisions

1\. \*\*Why Ollama?\*\* Free, local deployment, privacy-preserving, no API costs

2\. \*\*Why CLI first?\*\* Simplicity, focus on core functionality, easier debugging

3\. \*\*Why JSON for competencies?\*\* Easy to update, bilingual support, human-readable

4\. \*\*Why three agents?\*\* Aligns with educational scaffolding research, clearer separation of concerns

5\. \*\*Why shared context?\*\* Ensures all agents have consistent information, reduces prompt duplication



\### Research Foundation

The scaffolding framework is based on educational research on:

\- Zone of Proximal Development (Vygotsky)

\- Bloom's Taxonomy (cognitive levels)

\- Universal Design for Learning (UDL)

\- Gradual Release of Responsibility model

---

\## Credits

\*\*Developed by:\*\* \[Your Name/Team]  

\*\*For:\*\* Swiss educational system teachers  

\*\*Based on:\*\* Lehrplan 21 (Swiss curriculum framework)  

\*\*Powered by:\*\* Ollama, Llama 3.2, Python

---

\## License

\[Add your license information here]

---

\## Contact \& Support

\*\*Questions?\*\* \[Your contact information]  

\*\*Issues?\*\* \[GitHub repository or issue tracker]  

\*\*Documentation:\*\* This file and README.md

---

\## Changelog

\### Version 1.0 (November 17, 2025)

\- Initial release

\- Multi-agent system with three difficulty levels

\- Bilingual support (English/German)

\- 7 Lehrplan 21 competencies (Media \& Informatics)

\- Interactive CLI interface

\- JSON-based competency database

\- Scaffolding framework integration

\- Lesson idea generation

\- Local LLM deployment with Ollama

---

\*\*Last Updated:\*\* November 17, 2025  

\*\*Status:\*\* Production Ready

