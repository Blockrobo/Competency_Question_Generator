"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChatTurn, LessonDesign, ChatSession } from "@/types/questions";
import HelpAbout from "@/components/HelpAbout";
import ErrorDisplay from "@/components/ErrorDisplay";
import LessonCanvas from "@/components/LessonCanvas";
import {
  prepareLessonDesign,
  mapActivitiesToLessonIdeas,
  mapLessonIdeasToStickyNotes,
  DEFAULT_LEVELS,
} from "@/lib/lessonIdeas";
import lehrplanData from "@/data/lehrplan21_media_informatics.json";

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

const demoLessonDesign: LessonDesign = prepareLessonDesign({
  topic: "Media Remix & Perspective",
  competency: "MI_MEDIEN_2",
  learningObjective:
    "Students analyze how media framing changes perception and remix short clips to highlight digital empathy.",
  teacherContext: {
    classSize: "Medium (16-25 students)",
    classComposition: "Mixed ability",
    timeAvailable: "90 minutes",
    materialsAvailable: "Student tablets, projector, sticky notes, speakers",
    teachingIdeas: "Connect to current online trends; let students critique examples they already know.",
    notes: "Group students intentionally so every team has a confident presenter.",
  },
  teachingContent:
    "Focus on decoding, remixing, and presenting short media artifacts that model respectful digital dialogue.",
  ideas: [
    {
      levelKey: "Beginner",
      levelLabel: "Beginner",
      title: "Color-Coded Media Snapshots",
      estimated_duration: "15 minutes",
      materials_needed: ["Printed screenshots", "Colored sticky dots"],
      min_number_students: 10,
      max_number_students: 30,
      description:
        "Scatter printed social posts around the room. Students tag them with colored dots to signal how each post might make different audiences feel. Facilitator prompts a lightning debrief on surprising reactions and how tone shifts perception.",
      position: { x: 16, y: 16 },
    },
    {
      levelKey: "Intermediate",
      levelLabel: "Intermediate",
      title: "Two-Voice Remix",
      estimated_duration: "25 minutes",
      materials_needed: ["Tablets or laptops", "Free audio editing app"],
      min_number_students: 4,
      max_number_students: 24,
      description:
        "Pairs record a short narration that retells the same scenario twice: once as an inflamed, clickbait perspective and once as a calm, empathetic voice. Classmates guess which version would build trust online and annotate why.",
      position: { x: 304, y: 16 },
    },
    {
      levelKey: "Advanced",
      levelLabel: "Advanced",
      title: "Sticky-Note Argument Map",
      estimated_duration: "20 minutes",
      materials_needed: ["Large poster paper", "Sticky notes", "Markers"],
      min_number_students: 8,
      max_number_students: 28,
      description:
        "Small groups map a controversial topic on poster paper. Each sticky note must cite a media example plus the intended audience reaction. Students reorganize notes to show how remixing order/phrasing changes the narrative arc.",
      position: { x: 592, y: 16 },
    },
  ],
  metadata: {
    model: "demo",
    generatedAt: new Date(),
    version: 0,
  },
});

const demoSession: ChatSession = {
  id: "demo-session",
  title: "MI_MEDIEN_2 - Media Remix Canvas",
  subjectDomain: "Media and Computer Science",
  competency: "MI_MEDIEN_2",
  learningObjective: demoLessonDesign.learningObjective,
  difficultyLevels: [...DEFAULT_LEVELS],
  includeGeneralIdeas: true,
  teacherContext: demoLessonDesign.teacherContext,
  teachingContent: demoLessonDesign.teachingContent,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  lastMessageAt: new Date(Date.now() - 1000 * 60 * 30),
  lessonDesigns: [demoLessonDesign],
  history: [],
  originalDesigns: [demoLessonDesign],
};

function PageContent() {
  const searchParams = useSearchParams();
  // Chat sessions
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Form inputs
  const [subjectDomain] = useState("Media and Computer Science"); // Fixed
  const [competency, setCompetency] = useState("");
  const [learningObjective, setLearningObjective] = useState("");
  const [classSize, setClassSize] = useState("");
  const [classSizeCustom, setClassSizeCustom] = useState("");
  const [classComposition, setClassComposition] = useState("");
  const [timeAvailable, setTimeAvailable] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [materialsAvailable, setMaterialsAvailable] = useState("");
  const [teachingIdeas, setTeachingIdeas] = useState("");
  const [otherNotes, setOtherNotes] = useState("");
  const [includeBeginner, setIncludeBeginner] = useState(true);
  const [includeIntermediate, setIncludeIntermediate] = useState(true);
  const [includeAdvanced, setIncludeAdvanced] = useState(true);
  const [includeGeneralIdeas, setIncludeGeneralIdeas] = useState(true);
  const [questionsPerLevel, setQuestionsPerLevel] = useState("3");
  const [hasLoadedDemo, setHasLoadedDemo] = useState(false);

  const [refine, setRefine] = useState("");
  const [loading, setLoading] = useState(false);
  
  // HCAI: Additional state
  const [dontKeepHistory, setDontKeepHistory] = useState(true);
  const [lastError, setLastError] = useState<{ raw?: string; parseError?: string } | null>(null);
  
  // Step-by-step wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;
  const hasSelectedDifficulty = includeBeginner || includeIntermediate || includeAdvanced;

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  const currentLessonDesign = useMemo(() => {
    if (!activeSession || activeSession.lessonDesigns.length === 0) return null;
    return activeSession.lessonDesigns[activeSession.lessonDesigns.length - 1];
  }, [activeSession]);

  // Get final class size (dropdown or custom number)
  const finalClassSize = useMemo(() => {
    if (classSize === "custom" && classSizeCustom.trim()) {
      return `${classSizeCustom} students`;
    }
    if (classSize && classSize !== "custom") {
      return classSize;
    }
    return "";
  }, [classSize, classSizeCustom]);

  const finalTimeAvailable = useMemo(() => {
    if (timeAvailable === "custom" && customTime.trim()) {
      return customTime.trim();
    }
    if (timeAvailable && timeAvailable !== "custom") {
      return timeAvailable;
    }
    return "";
  }, [timeAvailable, customTime]);

  // Generate lesson design
  const normalizedQuestionsPerLevel = useMemo(() => {
    const parsed = parseInt(questionsPerLevel, 10);
    if (Number.isNaN(parsed)) return 1;
    return Math.min(10, Math.max(1, parsed));
  }, [questionsPerLevel]);

  async function generateLessonDesign(
    _sessionHistory: ChatTurn[],
    refinementRequest?: string
  ): Promise<LessonDesign | null> {
    try {
      const legacyBackendUrl = process.env.NEXT_PUBLIC_LEGACY_BACKEND_URL || "http://localhost:4000";
      const refineNote = refinementRequest?.trim()
        ? `Teacher refinement request: ${refinementRequest.trim()}`
        : "";
      const combinedNotes = [otherNotes, refineNote].filter(Boolean).join("\n");
      const payload = {
        competency_id: competency,
        subject: subjectDomain,
        cycle: "",
        learning_objective: learningObjective,
        materials_available: materialsAvailable,
        time_available: finalTimeAvailable,
        teaching_ideas: teachingIdeas,
        class_size_composition: classComposition || finalClassSize,
        other_notes: combinedNotes,
        num_questions_per_level: normalizedQuestionsPerLevel,
        include_beginner: includeBeginner,
        include_intermediate: includeIntermediate,
        include_advanced: includeAdvanced,
        include_lesson_ideas: includeGeneralIdeas,
      };

      const res = await fetch(`${legacyBackendUrl}/api/generate_worksheet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        setLastError({ raw: errorText, parseError: `Legacy backend error (${res.status})` });
        return null;
      }

      const json = await res.json();
      const legacyIdeas = [
        ...mapActivitiesToLessonIdeas(json?.activities || []),
        ...mapLessonIdeasToStickyNotes(json?.lesson_ideas || []),
      ];

      const lessonDesign: LessonDesign = {
        topic: json?.competency_id || competency || "Lesson Design",
        competency: json?.competency_id || competency,
        learningObjective: json?.learning_objective || learningObjective,
        teacherContext: {
          classSize: finalClassSize,
          classComposition,
          timeAvailable,
          materialsAvailable,
          teachingIdeas,
          notes: combinedNotes || undefined,
        },
        teachingContent: undefined,
        ideas: legacyIdeas,
        metadata: {
          model: "legacy-python-backend",
          generatedAt: new Date(),
          version: 1,
        },
      };

      return prepareLessonDesign(lessonDesign);
    } catch (error) {
      console.error("Error generating lesson design:", error);
      setLastError({ raw: String(error), parseError: "Legacy backend fetch failed" });
      return null;
    }
  }

  async function onGenerate() {
    if (!competency || !learningObjective) return;
    if (!hasSelectedDifficulty) {
      setLastError({ parseError: "Please select at least one difficulty level." });
      return;
    }

    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `${competency} - ${learningObjective.substring(0, 30)}...`,
      subjectDomain,
      competency,
      learningObjective,
      difficultyLevels: [
        includeBeginner ? "Beginner" : null,
        includeIntermediate ? "Intermediate" : null,
        includeAdvanced ? "Advanced" : null,
      ].filter(Boolean) as string[],
      includeGeneralIdeas,
      teacherContext: {
        classSize: finalClassSize,
        classComposition,
        timeAvailable: finalTimeAvailable,
        materialsAvailable,
        teachingIdeas,
        notes: otherNotes,
      },
      teachingContent: undefined,
      createdAt: new Date(),
      lastMessageAt: new Date(),
      lessonDesigns: [],
      history: [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setLoading(true);

    const generationInstruction = `Generate a new LessonDesign for ${competency} with learning objective: ${learningObjective}.`;

    // Add user message
    const userMessage: ChatTurn = {
      role: "user",
      content: generationInstruction,
      timestamp: new Date(),
    };

    // Generate lesson design
    const lessonDesign = await generateLessonDesign([], undefined);

    // Update session
    const assistantTurn: ChatTurn = lessonDesign 
      ? { role: "assistant", content: JSON.stringify(lessonDesign), timestamp: new Date() }
      : { role: "assistant", content: "Error generating lesson design", timestamp: new Date() };

    const newHistory = dontKeepHistory ? [] : [userMessage, assistantTurn];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === newSession.id
          ? {
              ...s,
              lessonDesigns: lessonDesign ? [lessonDesign] : [],
              history: newHistory,
              originalDesigns: lessonDesign ? [lessonDesign] : [],
              lastMessageAt: new Date(),
            }
          : s
      )
    );

    setLoading(false);
  }

  function onRefine() {
    if (!refine.trim() || !activeSession) return;
    const refineInstruction = `Refine the current LessonDesign with this instruction: ${refine}`;
    
    setLoading(true);
    
    const refineMessage: ChatTurn = { role: "user", content: refineInstruction, timestamp: new Date() };
    
    const historyWithRefinement = [...activeSession.history, refineMessage];

    generateLessonDesign(historyWithRefinement, refine).then((lessonDesign) => {
      if (lessonDesign) {
        const assistantTurn: ChatTurn = { role: "assistant", content: JSON.stringify(lessonDesign), timestamp: new Date() };
        
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  lessonDesigns: [lessonDesign],
                  history: dontKeepHistory ? [] : [...s.history, refineMessage, assistantTurn],
                  lastMessageAt: new Date(),
                }
              : s
          )
        );
      }
      setLoading(false);
    });
    
    setRefine("");
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  function downloadJson(lessonDesign: LessonDesign) {
    const blob = new Blob([JSON.stringify(lessonDesign, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lessonDesign.competency}-lesson-design.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function startNewChat() {
    setActiveSessionId(null);
    setCompetency("");
    setLearningObjective("");
    setClassSize("");
    setClassSizeCustom("");
    setClassComposition("");
    setTimeAvailable("");
    setCustomTime("");
    setMaterialsAvailable("");
    setTeachingIdeas("");
    setOtherNotes("");
    setIncludeBeginner(true);
    setIncludeIntermediate(true);
    setIncludeAdvanced(true);
    setIncludeGeneralIdeas(true);
    setQuestionsPerLevel("3");
    setCurrentStep(1);
  }

  function nextStep() {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  function canProceedToNext(): boolean {
    switch (currentStep) {
      case 1: // Competency
        return !!competency && hasSelectedDifficulty;
      case 2: // Learning Objective
        return !!learningObjective.trim();
      default:
        return true; // Optional fields
    }
  }

  const stepTitles = [
    "Select Competency",
    "Learning Objective",
    "Class Size & Composition",
    "Time Available",
    "Materials",
    "Teaching Ideas",
    "Other Notes",
    "Review & Generate"
  ];

  function deleteSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      startNewChat();
    }
  }

  function handleIdeaDrag(index: number, position: { x: number; y: number }) {
    if (!activeSessionId) return;
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== activeSessionId || session.lessonDesigns.length === 0) {
          return session;
        }
        const targetIdx = session.lessonDesigns.length - 1;
        const updatedDesigns = session.lessonDesigns.map((design, designIdx) => {
          if (designIdx !== targetIdx || !design.ideas) {
            return design;
          }
          return {
            ...design,
            ideas: design.ideas.map((idea, ideaIdx) =>
              ideaIdx === index ? { ...idea, position } : idea
            ),
          };
        });
        return { ...session, lessonDesigns: updatedDesigns };
      })
    );
  }

  // Load competencies from lehrplan - use direct import
  const competencies = useMemo(() => {
    try {
      return (lehrplanData as any).competencies || [];
    } catch (err) {
      console.error("Error loading lehrplan:", err);
      return [];
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedDemo && sessions.length === 0) {
      setSessions([demoSession]);
      setActiveSessionId("demo-session");
      setHasLoadedDemo(true);
    }
  }, [hasLoadedDemo, sessions.length]);

  useEffect(() => {
    if (searchParams?.get("new") === "1") {
      startNewChat();
    }
  }, [searchParams]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* HCAI: Help/About modal */}
      <HelpAbout variant={activeSession ? "bottom-right" : "bottom-right"} />

      {/* Left Sidebar - History */}
      <div
        className={`relative bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "w-14" : "w-80"
        }`}
      >
        <button
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          className="absolute top-1/2 -right-3 z-10 w-6 h-6 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center text-xs text-gray-600 -translate-y-1/2"
          aria-label={sidebarCollapsed ? "Expand history" : "Collapse history"}
        >
          {sidebarCollapsed ? "›" : "‹"}
        </button>
        {/* App Name Header */}
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-center">
          <img
            src="/tekko_logo.png"
            alt="Tekko logo"
            className="h-20 w-auto object-contain transition-all duration-300"
          />
        </div>
        
        {/* History Section */}
        <div className={`flex-1 overflow-y-auto ${sidebarCollapsed ? "hidden" : "block"}`}>
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">History</h2>
          </div>
          <div className="flex-1 overflow-y-auto max-h-64">
            {sessions.map((session) => {
              const latestIdeaCount =
                session.lessonDesigns.length > 0
                  ? session.lessonDesigns[session.lessonDesigns.length - 1]?.ideas?.length ?? 0
                  : 0;
              return (
                <div
                  key={session.id}
                  onClick={() => {
                    setActiveSessionId(session.id);
                    setCompetency(session.competency);
                    setLearningObjective(session.learningObjective || "");
                    // Restore other fields for editing if needed, or just display
                    setClassSize(session.teacherContext?.classSize?.split(" ")[0] || ""); // Simplified for now
                    setClassComposition(session.teacherContext?.classComposition || "");
                    setTimeAvailable(session.teacherContext?.timeAvailable || "");
                    setMaterialsAvailable(session.teacherContext?.materialsAvailable || "");
                    setTeachingIdeas(session.teacherContext?.teachingIdeas || "");
                    setOtherNotes(session.teacherContext?.notes || "");
                    setCurrentStep(1); // Reset to first step when loading history
                  }}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors relative group ${
                    activeSessionId === session.id ? "bg-purple-50 border-l-4 border-l-purple-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                      {latestIdeaCount > 0 ? latestIdeaCount : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-800 text-sm truncate">{session.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatTime(session.lastMessageAt)}
                          </span>
                          <button
                            onClick={(e) => deleteSession(session.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs px-1 transition-opacity"
                            title="Delete chat"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {latestIdeaCount > 0
                          ? `Generated ${latestIdeaCount} lesson idea${latestIdeaCount === 1 ? "" : "s"}`
                          : "New canvas"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {sessions.length === 0 && (
              <div className="p-4 text-center text-gray-400 text-xs">
                No conversations yet.
              </div>
            )}
          </div>
        </div>

        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={startNewChat}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
            >
              + New Lesson Design
            </button>
          </div>
        )}
      </div>

      {/* Right Panel - Canvas or Wizard */}
      {activeSessionId && activeSession ? (
        <div className="flex-1 flex flex-col bg-gray-100">
          {/* Canvas Header */}
          <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
                {currentLessonDesign?.ideas.length ?? 0}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{activeSession.title}</h3>
                <p className="text-xs text-gray-500">
                  {activeSession.subjectDomain} — {activeSession.competency}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => currentLessonDesign && copy(JSON.stringify(currentLessonDesign, null, 2))}
                disabled={!currentLessonDesign}
                className="text-xs px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Copy JSON
              </button>
              <button
                onClick={() => currentLessonDesign && downloadJson(currentLessonDesign)}
                disabled={!currentLessonDesign}
                className="text-xs px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Download JSON
              </button>
            </div>
          </div>

          {/* Context summary */}
          <div className="border-b border-gray-200 bg-white">
            <div className="max-w-5xl mx-auto p-4 grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <p className="text-xs uppercase text-gray-500">Learning objective</p>
                <p className="text-sm text-gray-800 mt-1">{activeSession.learningObjective || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Included levels</p>
                <p className="text-sm text-gray-800 mt-1">
                  {activeSession.difficultyLevels?.length
                    ? activeSession.difficultyLevels.join(", ")
                    : DEFAULT_LEVELS.join(", ")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Time available</p>
                <p className="text-sm text-gray-800 mt-1">{activeSession.teacherContext.timeAvailable || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">General lesson ideas</p>
                <p className="text-sm text-gray-800 mt-1">
                  {(activeSession.includeGeneralIdeas ?? true) ? "Included" : "Excluded"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Class size</p>
                <p className="text-sm text-gray-800 mt-1">
                  {activeSession.teacherContext.classSize || "Not specified"}
                  {activeSession.teacherContext.classComposition ? ` • ${activeSession.teacherContext.classComposition}` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Materials</p>
                <p className="text-sm text-gray-800 mt-1">
                  {activeSession.teacherContext.materialsAvailable || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Teacher ideas / notes</p>
                <p className="text-sm text-gray-800 mt-1">
                  {activeSession.teacherContext.teachingIdeas || activeSession.teacherContext.notes || "None provided"}
                </p>
              </div>
            </div>
            {lastError && (
              <div className="max-w-5xl mx-auto px-4 pb-4">
                <ErrorDisplay
                  rawOutput={lastError.raw}
                  parseError={lastError.parseError}
                  onRetry={() => {
                    setLastError(null);
                    if (activeSession) {
                      onRefine();
                    }
                  }}
                  onShowRaw={() => {}}
                  onSendCorrection={() => {
                    setRefine("Re-emit the last LessonDesign as valid JSON only, schema-compliant, no commentary.");
                    setLastError(null);
                  }}
                />
              </div>
            )}
          </div>

          <LessonCanvas lessonDesign={currentLessonDesign} loading={loading} onIdeaDrag={handleIdeaDrag} />

          {/* Refinement */}
          <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="max-w-5xl mx-auto">
              <label htmlFor="refine-input" className="text-xs uppercase text-gray-500 mb-1 block">
                Need different ideas?
              </label>
              <div className="flex gap-2">
                <input
                  id="refine-input"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ask for different grouping, materials, tone..."
                  value={refine}
                  onChange={(e) => setRefine(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onRefine();
                    }
                  }}
                />
                <button
                  onClick={onRefine}
                  disabled={loading || !refine.trim()}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Progress Indicator - Top Right */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">New Lesson Design</h3>
                <p className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        i + 1 <= currentStep ? "bg-purple-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                {/* Step Title */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold">
                      {currentStep}
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800">{stepTitles[currentStep - 1]}</h4>
                  </div>
                  <p className="text-sm text-gray-500 ml-[52px]">
                    {currentStep === 1 && "Select the competency from the Swiss curriculum"}
                    {currentStep === 2 && "What should students learn in this lesson?"}
                    {currentStep === 3 && "Tell us about your class size and composition"}
                    {currentStep === 4 && "How much time do you have available?"}
                    {currentStep === 5 && "What materials and resources are available?"}
                    {currentStep === 6 && "Share any initial teaching ideas or approaches"}
                    {currentStep === 7 && "Any additional notes or considerations?"}
                    {currentStep === 8 && "Review your inputs and generate the lesson design"}
                  </p>
                </div>

                {/* Step Content */}
                <div className="mb-6 min-h-[200px]">
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="subject-domain" className="block text-sm font-medium text-gray-700 mb-1">
                          Subject Domain
                        </label>
                        <input
                          id="subject-domain"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100"
                          value={subjectDomain}
                          disabled
                        />
                      </div>
                      <div>
                        <label htmlFor="competency-select" className="block text-sm font-medium text-gray-700 mb-1">
                          Competency (Curriculum) *
                        </label>
                        <select
                          id="competency-select"
                          value={competency}
                          onChange={(e) => setCompetency(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        >
                          <option value="">Select a competency...</option>
                          {competencies.length > 0 ? (
                            competencies.map((comp: any) => (
                              <option key={comp.id} value={comp.id}>
                                {comp.id} - {comp.name_en}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>No competencies available</option>
                          )}
                        </select>
                        {competency && competencies.find((c: any) => c.id === competency) && (
                          <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>{(competencies.find((c: any) => c.id === competency) as any).name_en}</strong>
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {(competencies.find((c: any) => c.id === competency) as any).focus_en}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="pt-4 border-t border-gray-100 grid gap-6 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-gray-800">Difficulty Levels to Include</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Choose which learner profiles you want ideas for. Select at least one level.
                          </p>
                          <div className="mt-4 space-y-3">
                            <label className="flex gap-3 items-start">
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                checked={includeBeginner}
                                onChange={(e) => setIncludeBeginner(e.target.checked)}
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-800">Beginner (high scaffolding)</p>
                                <p className="text-xs text-gray-500">
                                  Concrete modeling, explicit steps, and lots of guidance.
                                </p>
                              </div>
                            </label>
                            <label className="flex gap-3 items-start">
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                checked={includeIntermediate}
                                onChange={(e) => setIncludeIntermediate(e.target.checked)}
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-800">Intermediate (balanced guidance)</p>
                                <p className="text-xs text-gray-500">
                                  Structured collaboration with room for analysis and application.
                                </p>
                              </div>
                            </label>
                            <label className="flex gap-3 items-start">
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                checked={includeAdvanced}
                                onChange={(e) => setIncludeAdvanced(e.target.checked)}
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-800">Advanced (creative transfer)</p>
                                <p className="text-xs text-gray-500">
                                  Open-ended challenges with minimal scaffolds and student ownership.
                                </p>
                              </div>
                            </label>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div>
                            <p className="text-sm font-medium text-gray-800">Number of Generated Questions</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Controls how many activities per difficulty level are generated.
                            </p>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={questionsPerLevel}
                              onChange={(e) => setQuestionsPerLevel(e.target.value)}
                              className="mt-4 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <label className="flex gap-3 items-start">
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              checked={includeGeneralIdeas}
                              onChange={(e) => setIncludeGeneralIdeas(e.target.checked)}
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-800">Include General Lesson Ideas</p>
                              <p className="text-xs text-gray-500">
                                Adds multi-step projects or extension ideas alongside level-specific activities.
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div>
                      <label htmlFor="learning-objective" className="block text-sm font-medium text-gray-700 mb-2">
                        Learning Objective *
                      </label>
                      <textarea
                        id="learning-objective"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="What should students learn in this lesson? Be specific about the knowledge, skills, or understanding students should gain."
                        value={learningObjective}
                        onChange={(e) => setLearningObjective(e.target.value)}
                        rows={5}
                        required
                      />
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      {/* Class Size */}
                      <div>
                        <label htmlFor="class-size" className="block text-sm font-medium text-gray-700 mb-2">
                          Class Size
                        </label>
                        <div className="space-y-3">
                          <select
                            id="class-size"
                            value={classSize}
                            onChange={(e) => {
                              setClassSize(e.target.value);
                              if (e.target.value && e.target.value !== "custom") {
                                setClassSizeCustom("");
                              }
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select class size...</option>
                            <option value="Small (5-15 students)">Small (5-15 students)</option>
                            <option value="Medium (16-25 students)">Medium (16-25 students)</option>
                            <option value="Large (26+ students)">Large (26+ students)</option>
                            <option value="custom">Or enter specific number</option>
                          </select>
                          {classSize === "custom" && (
                            <div>
                              <input
                                type="number"
                                id="class-size-custom"
                                min="1"
                                value={classSizeCustom}
                                onChange={(e) => setClassSizeCustom(e.target.value)}
                                placeholder="Enter number of students"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Class Composition */}
                      <div>
                        <label htmlFor="class-composition" className="block text-sm font-medium text-gray-700 mb-2">
                          Class Composition
                        </label>
                        <select
                          id="class-composition"
                          value={classComposition}
                          onChange={(e) => setClassComposition(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Select composition...</option>
                          <option value="Mixed ability">Mixed ability</option>
                          <option value="Homogeneous ability">Homogeneous ability</option>
                          <option value="Mixed age groups">Mixed age groups</option>
                          <option value="Single grade level">Single grade level</option>
                          <option value="Special needs included">Special needs included</option>
                          <option value="Gifted and talented">Gifted and talented</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="time-available" className="block text-sm font-medium text-gray-700 mb-2">
                          Time Available
                        </label>
                        <select
                          id="time-available"
                          value={timeAvailable}
                          onChange={(e) => {
                            setTimeAvailable(e.target.value);
                            if (e.target.value !== "custom") {
                              setCustomTime("");
                            }
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Select time...</option>
                          <option value="45 minutes">45 minutes</option>
                          <option value="90 minutes">90 minutes</option>
                          <option value="2-3 hours">2-3 hours</option>
                          <option value="Full day">Full day</option>
                          <option value="Multiple sessions">Multiple sessions</option>
                          <option value="custom">Or enter specific time</option>
                        </select>
                      </div>
                      {timeAvailable === "custom" && (
                        <div>
                          <input
                            type="text"
                            placeholder="Enter custom time (e.g., 75 minutes)"
                            value={customTime}
                            onChange={(e) => setCustomTime(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 5 && (
                    <div>
                      <label htmlFor="materials-available" className="block text-sm font-medium text-gray-700 mb-2">
                        Materials Available
                      </label>
                      <textarea
                        id="materials-available"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., Computers, projectors, whiteboards, specific software, internet access..."
                        value={materialsAvailable}
                        onChange={(e) => setMaterialsAvailable(e.target.value)}
                        rows={4}
                      />
                    </div>
                  )}

                  {currentStep === 6 && (
                    <div>
                      <label htmlFor="teaching-ideas" className="block text-sm font-medium text-gray-700 mb-2">
                        Teaching Ideas
                      </label>
                      <textarea
                        id="teaching-ideas"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Any initial teaching ideas or approaches you'd like to explore? This helps the AI understand your preferred teaching style."
                        value={teachingIdeas}
                        onChange={(e) => setTeachingIdeas(e.target.value)}
                        rows={4}
                      />
                    </div>
                  )}

                  {currentStep === 7 && (
                    <div>
                      <label htmlFor="other-notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Any Other Notes?
                      </label>
                      <textarea
                        id="other-notes"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Additional context, constraints, or considerations that might be relevant..."
                        value={otherNotes}
                        onChange={(e) => setOtherNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                  )}

                  {currentStep === 8 && (
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <h5 className="font-semibold text-gray-800 mb-3">Review Your Inputs</h5>
                        <div className="space-y-3 text-sm">
                          <div>
                            <strong className="text-gray-700">Competency:</strong>
                            <p className="text-gray-600 mt-1">
                              {competency && competencies.find((c: any) => c.id === competency)
                                ? `${competency} - ${(competencies.find((c: any) => c.id === competency) as any).name_en}`
                                : "Not selected"}
                            </p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Difficulty Levels:</strong>
                            <p className="text-gray-600 mt-1">
                              {hasSelectedDifficulty
                                ? [
                                    includeBeginner ? "Beginner" : null,
                                    includeIntermediate ? "Intermediate" : null,
                                    includeAdvanced ? "Advanced" : null,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")
                                : "None selected"}
                            </p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Include General Lesson Ideas:</strong>
                            <p className="text-gray-600 mt-1">
                              {includeGeneralIdeas ? "Yes" : "No"}
                            </p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Learning Objective:</strong>
                            <p className="text-gray-600 mt-1">{learningObjective || "Not specified"}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Class Size:</strong>
                            <p className="text-gray-600 mt-1">{finalClassSize || "Not specified"}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Class Composition:</strong>
                            <p className="text-gray-600 mt-1">{classComposition || "Not specified"}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700">Time Available:</strong>
                            <p className="text-gray-600 mt-1">{finalTimeAvailable || "Not specified"}</p>
                          </div>
                          {materialsAvailable && (
                            <div>
                              <strong className="text-gray-700">Materials:</strong>
                              <p className="text-gray-600 mt-1">{materialsAvailable}</p>
                            </div>
                          )}
                          {teachingIdeas && (
                            <div>
                              <strong className="text-gray-700">Teaching Ideas:</strong>
                              <p className="text-gray-600 mt-1">{teachingIdeas}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                        <input
                          type="checkbox"
                          id="dont-keep-history-review"
                          checked={dontKeepHistory}
                          onChange={(e) => setDontKeepHistory(e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="dont-keep-history-review" className="text-sm text-gray-700">
                          Don't keep this in local history
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className={`flex items-center pt-4 border-t border-gray-200 ${currentStep === 1 ? 'justify-end' : 'justify-between'}`}>
                  {currentStep > 1 && (
                    <button
                      onClick={prevStep}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ← Back
                    </button>
                  )}
                  {currentStep < totalSteps ? (
                    <button
                      onClick={nextStep}
                      disabled={!canProceedToNext()}
                      className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={onGenerate}
                      disabled={loading || !competency || !learningObjective}
                      className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {loading ? "Generating..." : "Generate Lesson Design"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <PageContent />
    </Suspense>
  );
}

