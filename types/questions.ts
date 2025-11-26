export type LevelKey = "Beginner" | "Intermediate" | "Advanced" | "General";

export interface LessonIdea {
  levelKey: LevelKey;
  levelLabel?: LevelKey;
  title: string;
  estimated_duration: string;
  materials_needed: string[];
  min_number_students: number;
  max_number_students: number;
  description: string;
  position?: {
    x: number;
    y: number;
  };
  learningObjectives?: string[];
  activity_description?: string;
  isGeneral?: boolean;
}

export interface LessonDesign {
  topic: string;
  competency: string;
  learningObjective: string;
  teacherContext: {
    classSize?: string;
    classComposition?: string;
    timeAvailable?: string;
    materialsAvailable?: string;
    teachingIdeas?: string;
    notes?: string;
  };
  teachingContent?: string;
  ideas: LessonIdea[]; // Array of sticky-note lesson ideas
  // HCAI: Provenance metadata
  metadata?: {
    model?: string;
    generatedAt?: Date;
    version?: number;
  };
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  subjectDomain: string;
  competency: string;
  learningObjective: string;
  difficultyLevels?: string[];
  includeGeneralIdeas?: boolean;
  teacherContext: {
    classSize?: string;
    classComposition?: string;
    timeAvailable?: string;
    materialsAvailable?: string;
    teachingIdeas?: string;
    notes?: string;
  };
  teachingContent?: string;
  createdAt: Date;
  lastMessageAt: Date;
  lessonDesigns: LessonDesign[]; // Multiple lesson designs for the session
  history: ChatTurn[];
  originalDesigns?: LessonDesign[]; // Original generated designs
}
