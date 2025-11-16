"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { ChatTurn, LessonDesign, ChatSession } from "@/types/questions";
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

export default function Page() {
  // Chat sessions
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
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

  const [refine, setRefine] = useState("");
  const [loading, setLoading] = useState(false);
  
  // HCAI: Additional state
  const [dontKeepHistory, setDontKeepHistory] = useState(true);
  const [lastError, setLastError] = useState<{ raw?: string; parseError?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Step-by-step wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 9;

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

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

Remember:
- Generate exactly THREE levels: Beginner, Intermediate, and Advanced
- Same core concept across all three levels; vary depth, complexity, and independence
- Beginner: descriptive knowledge checks, concrete activities
- Intermediate: application with some guidance
- Advanced: open-ended, initiative-driven questions and projects
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
        // Add metadata for provenance
        lessonDesign.metadata = {
          model: json.metadata?.model || "unknown",
          generatedAt: json.metadata?.generatedAt ? new Date(json.metadata.generatedAt) : new Date(),
          version: 1,
        };
        return lessonDesign;
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
    
    generateLessonDesign(activeSession.history).then((lessonDesign) => {
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

  // HCAI: Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.history]);

  // Load competencies from lehrplan - use direct import
  const competencies = useMemo(() => {
    try {
      return (lehrplanData as any).competencies || [];
    } catch (err) {
      console.error("Error loading lehrplan:", err);
      return [];
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* HCAI: Help/About modal */}
      <HelpAbout />

      {/* Left Sidebar - History */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* App Name Header */}
        <div className="p-4 border-b border-gray-200 bg-purple-50">
          <h1 className="text-xl font-bold text-purple-700">Lecture Design Assistant</h1>
          <p className="text-xs text-purple-600 mt-1">Media and Computer Science</p>
        </div>
        
        {/* History Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">History</h2>
          </div>
          <div className="flex-1 overflow-y-auto max-h-64">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setCompetency(session.competency);
                  setLearningObjective(session.learningObjective || "");
                  // Restore other fields for editing if needed, or just display
                  setClassSize(session.teacherContext?.classSize?.split(' ')[0] || ""); // Simplified for now
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
                    {session.lessonDesigns.length > 0 ? session.lessonDesigns.length : "?"}
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
                      {session.lessonDesigns.length > 0 ? `Generated ${session.lessonDesigns.length} lesson idea${session.lessonDesigns.length > 1 ? "s" : ""}` : "New conversation"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="p-4 text-center text-gray-400 text-xs">
                No conversations yet.
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={startNewChat}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            + New Lesson Design
          </button>
        </div>
      </div>

      {/* Right Panel - Chat Interface or Wizard */}
      {activeSessionId && activeSession ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header - Fixed at top */}
          <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
                {activeSession.lessonDesigns.length}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{activeSession.title}</h3>
                <p className="text-xs text-gray-500">
                  {activeSession.subjectDomain} — {activeSession.competency}
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages Area - Scrollable middle section */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50" role="log" aria-live="polite" aria-atomic="false">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Show history if available */}
              {activeSession.history.length > 0 && activeSession.history.map((turn, idx) => {
                if (turn.role === "user") {
                  return (
                    <div key={idx} className="flex justify-end">
                      <div className="bg-purple-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[70%] shadow-sm">
                        <p className="text-sm whitespace-pre-wrap">{turn.content}</p>
                        {turn.timestamp && (
                          <p className="text-xs text-purple-100 mt-1">
                            {turn.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  try {
                    const lessonDesign = JSON.parse(turn.content) as LessonDesign;
                    return (
                      <div key={idx} className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm border border-gray-200">
                          <div className="mb-3">
                            <h4 className="font-semibold text-gray-800 mb-2">
                              {lessonDesign.topic} — {lessonDesign.competency}
                            </h4>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Learning Objective:</strong> {lessonDesign.learningObjective}
                            </p>
                            {/* HCAI: Provenance info */}
                            {lessonDesign.metadata && (
                              <div className="mb-3 text-xs text-gray-500">
                                <span>Model-generated</span>
                                {lessonDesign.metadata.model && (
                                  <span> • {lessonDesign.metadata.model}</span>
                                )}
                                {lessonDesign.metadata.generatedAt && (
                                  <span> • {new Date(lessonDesign.metadata.generatedAt).toLocaleString()}</span>
                                )}
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 mt-3">
                              {lessonDesign.items.map((item) => (
                                <div key={item.levelKey} className="border border-gray-200 rounded-lg p-3 bg-gray-50 relative">
                                  <div className="text-xs font-semibold text-purple-600 mb-1">{item.levelLabel}</div>
                                  <p className="text-sm text-gray-800 mb-2">{item.question}</p>
                                  <p className="text-xs text-gray-600">Rationale: {item.rationale}</p>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => copy(JSON.stringify(lessonDesign, null, 2))}
                                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                Copy JSON
                              </button>
                              <button
                                onClick={() => downloadJson(lessonDesign)}
                                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                Download JSON
                              </button>
                            </div>
                          </div>
                          {turn.timestamp && (
                            <p className="text-xs text-gray-400 mt-2">
                              {turn.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  } catch {
                    return (
                      <div key={idx} className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2 max-w-[70%] shadow-sm border border-gray-200">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{turn.content}</p>
                          {turn.timestamp && (
                            <p className="text-xs text-gray-400 mt-1">
                              {turn.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                }
              })}

              {/* Show lesson designs directly if history is empty but designs exist */}
              {activeSession.history.length === 0 && activeSession.lessonDesigns.length > 0 && activeSession.lessonDesigns.map((lessonDesign, idx) => (
                <div key={idx} className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm border border-gray-200">
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {lessonDesign.topic || activeSession.competency} — {lessonDesign.competency || activeSession.competency}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Learning Objective:</strong> {lessonDesign.learningObjective || activeSession.learningObjective}
                      </p>
                      {/* HCAI: Provenance info */}
                      {lessonDesign.metadata && (
                        <div className="mb-3 text-xs text-gray-500">
                          <span>Model-generated</span>
                          {lessonDesign.metadata.model && (
                            <span> • {lessonDesign.metadata.model}</span>
                          )}
                          {lessonDesign.metadata.generatedAt && (
                            <span> • {new Date(lessonDesign.metadata.generatedAt).toLocaleString()}</span>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 mt-3">
                        {lessonDesign.items.map((item) => (
                          <div key={item.levelKey} className="border border-gray-200 rounded-lg p-3 bg-gray-50 relative">
                            <div className="text-xs font-semibold text-purple-600 mb-1">{item.levelLabel}</div>
                            <p className="text-sm text-gray-800 mb-2">{item.question}</p>
                            <p className="text-xs text-gray-600">Rationale: {item.rationale}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => copy(JSON.stringify(lessonDesign, null, 2))}
                          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Copy JSON
                        </button>
                        <button
                          onClick={() => downloadJson(lessonDesign)}
                          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Download JSON
                        </button>
                      </div>
                    </div>
                    {lessonDesign.metadata?.generatedAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(lessonDesign.metadata.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {lastError && (
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
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm border border-gray-200">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input Area - Fixed at bottom */}
          <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2 items-end">
                <input
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder='Type your message to refine the lesson design...'
                  value={refine}
                  onChange={(e) => setRefine(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onRefine();
                    }
                  }}
                  aria-label="Chat input"
                />
                <button
                  onClick={onRefine}
                  disabled={loading || !refine.trim()}
                  className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
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
