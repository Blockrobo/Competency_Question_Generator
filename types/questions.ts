export type QuestionLevelKey = "Beginner" | "Intermediate" | "Advanced";

export interface QuestionItem {
  levelKey: QuestionLevelKey;
  levelLabel: "Beginner" | "Intermediate" | "Advanced";
  question: string;
  rationale: string;
  formatHint?: string;
  realWorldContext?: string;
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
  items: QuestionItem[]; // Exactly 3, one per level
  notesForTeacher?: string;
  // HCAI: Provenance metadata
  metadata?: {
    model?: string;
    generatedAt?: Date;
    version?: number;
  };
}

// Keep QuestionSet for backward compatibility if needed
export interface QuestionSet {
  topic: string;
  competency: string;
  student: {
    name: string;
    learnerProfile?: string;
    needsSupportWith?: string;
  };
  items: QuestionItem[];
  notesForTeacher?: string;
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

