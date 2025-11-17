export interface LessonIdea {
  levelKey: "Beginner" | "Intermediate" | "Advanced";
  levelLabel?: "Beginner" | "Intermediate" | "Advanced";
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

export interface Student {
  id: string;
  name: string;
  learningStyle?: string;
  interests?: string;
  needsSupportWith?: string;
  createdAt: Date;
}

export interface Feedback {
  lessonDesignId: string;
  rating: number; // 1-5
  comment?: string;
  usedInClass?: boolean;
  submittedAt: Date;
}

export interface QuestionSetVersion {
  lessonDesign: LessonDesign;
  timestamp: Date;
  action: "generated" | "edited" | "regenerated" | "replaced";
}

export interface ChatSession {
  id: string;
  title: string;
  subjectDomain: string;
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
  createdAt: Date;
  lastMessageAt: Date;
  lessonDesigns: LessonDesign[]; // Multiple lesson designs for the session
  history: ChatTurn[];
  // HCAI: Version history for undo/redo
  versionHistory?: QuestionSetVersion[];
  originalDesigns?: LessonDesign[]; // Original generated designs
  feedback?: Feedback[];
}

