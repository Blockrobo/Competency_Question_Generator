"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { ChatTurn, LessonDesign, ChatSession, LessonIdea } from "@/types/questions";
import HelpAbout from "@/components/HelpAbout";
import ErrorDisplay from "@/components/ErrorDisplay";
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

function normalizeIdeas(rawIdeas: any[]): LessonIdea[] {
  if (!Array.isArray(rawIdeas)) return [];
  const fallbackLevels: ("Beginner" | "Intermediate" | "Advanced")[] = ["Beginner", "Intermediate", "Advanced"];

  return rawIdeas.slice(0, 3).map((idea, idx) => {
    const rawMin = Number(idea?.min_number_students ?? 1);
    const safeMin = Number.isFinite(rawMin) && rawMin > 0 ? Math.floor(rawMin) : 1;
    const rawMax = Number(idea?.max_number_students ?? safeMin);
    const safeMax =
      Number.isFinite(rawMax) && rawMax >= safeMin ? Math.floor(rawMax) : Math.max(safeMin, 4);

    const materialsArray = Array.isArray(idea?.materials_needed)
      ? idea.materials_needed
      : idea?.materials_needed
      ? [idea.materials_needed]
      : [];

    return {
      levelKey: (idea?.levelKey ?? fallbackLevels[idx]) as "Beginner" | "Intermediate" | "Advanced",
      levelLabel: (idea?.levelLabel ?? idea?.levelKey ?? fallbackLevels[idx]) as
        | "Beginner"
        | "Intermediate"
        | "Advanced",
      title: idea?.title ?? `Idea ${idx + 1}`,
      estimated_duration: idea?.estimated_duration ?? "45 minutes",
      materials_needed: materialsArray.map((m: any) => String(m)),
      min_number_students: safeMin,
      max_number_students: safeMax,
      description:
        idea?.description ??
        "Describe how students engage with the concept, how the teacher facilitates, and what evidence of learning appears.",
      position: idea?.position,
    };
  });
}

function applyDefaultPositions(ideas: LessonIdea[]): LessonIdea[] {
  const columnWidth = 260;
  const rowHeight = 190;
  const gap = 32;

  return ideas.map((idea, idx) => ({
    ...idea,
    position: idea.position ?? {
      x: (idx % 3) * (columnWidth + gap) + 16,
      y: Math.floor(idx / 3) * (rowHeight + gap) + 16,
    },
  }));
}

function prepareLessonDesign(raw: LessonDesign): LessonDesign {
  const normalizedIdeas = applyDefaultPositions(normalizeIdeas(raw.ideas || []));
  return {
    ...raw,
    ideas: normalizedIdeas,
  };
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
  teacherContext: demoLessonDesign.teacherContext,
  teachingContent: demoLessonDesign.teachingContent,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  lastMessageAt: new Date(Date.now() - 1000 * 60 * 30),
  lessonDesigns: [demoLessonDesign],
  history: [],
  originalDesigns: [demoLessonDesign],
};

export default function Page() {
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
  const [materialsAvailable, setMaterialsAvailable] = useState("");
  const [teachingIdeas, setTeachingIdeas] = useState("");
  const [otherNotes, setOtherNotes] = useState("");
  const [teachingInput, setTeachingInput] = useState("");
  const [hasLoadedDemo, setHasLoadedDemo] = useState(false);

  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 2;
  const SCALE_STEP = 0.1;

  function getWorldPosition(clientX: number, clientY: number) {
    const viewport = canvasViewportRef.current;
    if (!viewport) return { x: 0, y: 0 };
    const rect = viewport.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    return {
      x: (localX - canvasOffset.x) / canvasScale,
      y: (localY - canvasOffset.y) / canvasScale,
    };
  }

  const [refine, setRefine] = useState("");
  const [loading, setLoading] = useState(false);
  
  // HCAI: Additional state
  const [dontKeepHistory, setDontKeepHistory] = useState(true);
  const [lastError, setLastError] = useState<{ raw?: string; parseError?: string } | null>(null);
  
  // Step-by-step wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 9;

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

  // Generate lesson design
  async function generateLessonDesign(sessionHistory: ChatTurn[]): Promise<LessonDesign | null> {
    const userTurn = `
Create a LessonDesign using the schema in the system prompt.

Subject Domain: ${subjectDomain}
Competency: ${competency}
Learning Objective: ${learningObjective}

Teacher Context:
- Class Size: ${finalClassSize || "Not specified"}
- Class Composition: ${classComposition || "Not specified"}
- Time Available: ${timeAvailable || "Not specified"}
- Materials Available: ${materialsAvailable || "Not specified"}
- Teaching Ideas: ${teachingIdeas || "Not specified"}
- Other Notes: ${otherNotes || "Not specified"}

Teaching Input/Content: ${teachingInput || "Not specified"}

Deliverable requirements:
- Return exactly three lesson ideas in the "ideas" array: Beginner, Intermediate, Advanced (in that order).
- Each idea must include: levelKey, levelLabel, title, estimated_duration, materials_needed (array), min_number_students, max_number_students, description.
- Beginner = highly scaffolded concrete activity; Intermediate = balanced guidance and independence; Advanced = transfer/creative application with minimal scaffolds.
- Make every description 3-4 sentences describing student actions, teacher moves, and connection to the competency.
- Respect the teacher context and available materials; suggest low-tech alternatives if needed.
`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: sessionHistory, userTurn }),
      });
      const json = await res.json();

      if (json.data) {
        const lessonDesign = json.data as LessonDesign;
        const withMetadata: LessonDesign = {
          ...lessonDesign,
          metadata: {
            model: json.metadata?.model || "unknown",
            generatedAt: json.metadata?.generatedAt ? new Date(json.metadata.generatedAt) : new Date(),
            version: 1,
          },
        };
        return prepareLessonDesign(withMetadata);
      }
      
      // Handle error case
      if (json.raw || json.parseError) {
        setLastError({ raw: json.raw, parseError: json.parseError });
      }
      
      return null;
    } catch (error) {
      console.error("Error generating lesson design:", error);
      return null;
    }
  }

  async function onGenerate() {
    if (!competency || !learningObjective) return;

    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `${competency} - ${learningObjective.substring(0, 30)}...`,
      subjectDomain,
      competency,
      learningObjective,
      teacherContext: {
        classSize: finalClassSize,
        classComposition,
        timeAvailable,
        materialsAvailable,
        teachingIdeas,
        notes: otherNotes,
      },
      teachingContent: teachingInput,
      createdAt: new Date(),
      lastMessageAt: new Date(),
      lessonDesigns: [],
      history: [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setLoading(true);

    // Add user message
    const userMessage: ChatTurn = {
      role: "user",
      content: `Generate lesson design for ${competency} with learning objective: ${learningObjective}`,
      timestamp: new Date(),
    };

    // Generate lesson design
    const lessonDesign = await generateLessonDesign([]);

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
    const msg = `Refine the current LessonDesign with this instruction: ${refine}`;
    
    setLoading(true);
    
    const refineMessage: ChatTurn = { role: "user", content: msg, timestamp: new Date() };
    
    const historyWithRefinement = [...activeSession.history, refineMessage];

    generateLessonDesign(historyWithRefinement).then((lessonDesign) => {
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
    setMaterialsAvailable("");
    setTeachingIdeas("");
    setOtherNotes("");
    setTeachingInput("");
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
        return !!competency;
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
    "Teaching Input",
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

  function handleCanvasWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (!canvasViewportRef.current) return;
    e.preventDefault();
    const rect = canvasViewportRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    const worldBefore = {
      x: (cursorX - canvasOffset.x) / canvasScale,
      y: (cursorY - canvasOffset.y) / canvasScale,
    };
    const delta = e.deltaY < 0 ? 1 + SCALE_STEP : 1 - SCALE_STEP;
    const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, canvasScale * delta));
    setCanvasScale(nextScale);
    setCanvasOffset({
      x: cursorX - worldBefore.x * nextScale,
      y: cursorY - worldBefore.y * nextScale,
    });
  }

  function handleCanvasPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    if (e.target !== e.currentTarget) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY };
    panOffsetRef.current = { ...canvasOffset };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handleCanvasPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isPanning) return;
    const deltaX = e.clientX - panStartRef.current.x;
    const deltaY = e.clientY - panStartRef.current.y;
    setCanvasOffset({
      x: panOffsetRef.current.x + deltaX,
      y: panOffsetRef.current.y + deltaY,
    });
  }

  function handleCanvasPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!isPanning) return;
    setIsPanning(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* HCAI: Help/About modal */}
      <HelpAbout variant={activeSession ? "bottom-right" : "top-right"} />

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
        <div className="p-4 border-b border-gray-200 bg-purple-50">
          {sidebarCollapsed ? (
            <div className="text-center">
              <span className="text-xl font-bold text-purple-700">L</span>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-purple-700">Lecture Design Assistant</h1>
              <p className="text-xs text-purple-600 mt-1">Media and Computer Science</p>
            </>
          )}
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
                    setTeachingInput(session.teachingContent || "");
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
                <p className="text-xs uppercase text-gray-500">Time available</p>
                <p className="text-sm text-gray-800 mt-1">{activeSession.teacherContext.timeAvailable || "Not specified"}</p>
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

          {/* Canvas Area */}
          <div className="flex-1 overflow-hidden">
            <div
              ref={canvasViewportRef}
              className={`relative w-full h-full ${
                isPanning ? "cursor-grabbing" : "cursor-grab"
              }`}
              onWheel={handleCanvasWheel}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerLeave={handleCanvasPointerUp}
              style={{
                backgroundColor: "#f8fafc",
                backgroundImage:
                  "linear-gradient(0deg, rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.25) 1px, transparent 1px)",
                backgroundSize: `${120 * canvasScale}px ${120 * canvasScale}px`,
                backgroundPosition: `${((canvasOffset.x % (120 * canvasScale)) + (120 * canvasScale)) % (120 * canvasScale)}px ${((canvasOffset.y % (120 * canvasScale)) + (120 * canvasScale)) % (120 * canvasScale)}px`,
              }}
            >
              <div
                className="absolute"
                style={{
                  width: 5000,
                  height: 3000,
                  transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${canvasScale})`,
                  transformOrigin: "0 0",
                }}
              >
                {currentLessonDesign && currentLessonDesign.ideas.length > 0 ? (
                  currentLessonDesign.ideas.map((idea, idx) => (
                    <StickyNote
                      key={idx}
                      idea={idea}
                      index={idx}
                      onDrag={handleIdeaDrag}
                      getWorldPosition={getWorldPosition}
                    />
                  ))
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                    Generate a lesson to populate this canvas with ideas.
                  </div>
                )}
              </div>
              <div className="absolute top-4 right-4 text-xs text-gray-600 bg-white/80 px-3 py-1 rounded-full shadow">
                Scroll to zoom • Drag empty canvas to pan • Drag notes to rearrange
              </div>
              {loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                  <div className="flex gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    <span className="ml-2">Generating ideas...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

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
                    {currentStep === 8 && "Your teaching idea, content, or input for the lesson"}
                    {currentStep === 9 && "Review your inputs and generate the lesson design"}
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
                    <div>
                      <label htmlFor="time-available" className="block text-sm font-medium text-gray-700 mb-2">
                        Time Available
                      </label>
                      <select
                        id="time-available"
                        value={timeAvailable}
                        onChange={(e) => setTimeAvailable(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select time...</option>
                        <option value="45 minutes">45 minutes</option>
                        <option value="90 minutes">90 minutes</option>
                        <option value="2-3 hours">2-3 hours</option>
                        <option value="Full day">Full day</option>
                        <option value="Multiple sessions">Multiple sessions</option>
                      </select>
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
                    <div>
                      <label htmlFor="teaching-input" className="block text-sm font-medium text-gray-700 mb-2">
                        Teaching Idea/Input/Content
                      </label>
                      <textarea
                        id="teaching-input"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Your initial teaching idea, content, or input for the lesson. This could be a concept you want to cover, an activity idea, or any starting point..."
                        value={teachingInput}
                        onChange={(e) => setTeachingInput(e.target.value)}
                        rows={5}
                      />
                    </div>
                  )}

                  {currentStep === 9 && (
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
                            <p className="text-gray-600 mt-1">{timeAvailable || "Not specified"}</p>
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
                          {teachingInput && (
                            <div>
                              <strong className="text-gray-700">Teaching Input:</strong>
                              <p className="text-gray-600 mt-1">{teachingInput}</p>
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

interface StickyNoteProps {
  idea: LessonIdea;
  index: number;
  onDrag: (index: number, position: { x: number; y: number }) => void;
  getWorldPosition: (clientX: number, clientY: number) => { x: number; y: number };
}

function StickyNote({ idea, index, onDrag, getWorldPosition }: StickyNoteProps) {
  const noteRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();

    const worldPoint = getWorldPosition(e.clientX, e.clientY);
    offsetRef.current = {
      x: worldPoint.x - (idea.position?.x ?? 0),
      y: worldPoint.y - (idea.position?.y ?? 0),
    };

    const originalUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    setDragging(true);

    const handleMove = (ev: PointerEvent) => {
      const world = getWorldPosition(ev.clientX, ev.clientY);
      onDrag(index, {
        x: world.x - offsetRef.current.x,
        y: world.y - offsetRef.current.y,
      });
    };

    const handleUp = () => {
      setDragging(false);
      document.body.style.userSelect = originalUserSelect;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const materials =
    idea.materials_needed && idea.materials_needed.length > 0
      ? idea.materials_needed
      : ["No special materials"];

  return (
    <div
      ref={noteRef}
      className={`absolute w-64 bg-yellow-50 border border-yellow-200 rounded-2xl shadow-lg p-4 cursor-grab transition-shadow ${
        dragging ? "ring-2 ring-purple-400 cursor-grabbing" : "hover:shadow-xl"
      }`}
      style={{ left: idea.position?.x ?? 0, top: idea.position?.y ?? 0 }}
      onPointerDown={handlePointerDown}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs uppercase text-amber-700 tracking-wide">Lesson idea</p>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-purple-700 bg-purple-100">
          {idea.levelLabel || idea.levelKey}
        </span>
      </div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{idea.title}</h4>
      <div className="text-xs text-gray-600 space-y-1 mb-3">
        <p>
          <span className="font-semibold">Duration:</span> {idea.estimated_duration}
        </p>
        <p>
          <span className="font-semibold">Group size:</span>{" "}
          {idea.min_number_students}–{idea.max_number_students} students
        </p>
        <p className="font-semibold">Materials:</p>
        <ul className="list-disc list-inside text-gray-700 space-y-0.5">
          {materials.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
      <p className="text-sm text-gray-800 whitespace-pre-line leading-snug">{idea.description}</p>
    </div>
  );
}
