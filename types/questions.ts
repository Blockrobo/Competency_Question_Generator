export type QuestionLevelKey = "NS" | "E" | "D" | "S" | "M" | "Ex";

export interface QuestionItem {
  levelKey: QuestionLevelKey;
  levelLabel: "Not started (E)" | "Emerging (E)" | "Developing (D)" | "Secure (S)" | "Mastering (M)" | "Extending (Ex)";
  question: string;
  rationale: string;
  formatHint?: string;
  realWorldContext?: string;
}

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
  questionSetId: string;
  rating: number; // 1-5
  comment?: string;
  usedInClass?: boolean;
  submittedAt: Date;
}

export interface QuestionSetVersion {
  questionSet: QuestionSet;
  timestamp: Date;
  action: "generated" | "edited" | "regenerated" | "replaced";
}

export interface ChatSession {
  id: string;
  title: string;
  topic: string;
  competency: string;
  selectedStudentIds: string[];
  createdAt: Date;
  lastMessageAt: Date;
  questionSets: QuestionSet[]; // Multiple question sets, one per student
  history: ChatTurn[];
  // HCAI: Version history for undo/redo
  versionHistory?: QuestionSetVersion[][]; // Array of versions per student
  originalSets?: QuestionSet[]; // Original generated sets
  feedback?: Feedback[];
}

