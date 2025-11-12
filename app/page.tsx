"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { ChatTurn, QuestionSet, ChatSession, Student, Feedback, QuestionSetVersion } from "@/types/questions";
import HelpAbout from "@/components/HelpAbout";
import Badges from "@/components/Badges";
import FeedbackBlock from "@/components/FeedbackBlock";
import QuestionCard from "@/components/QuestionCard";
import QuickRefinementChips from "@/components/QuickRefinementChips";
import ErrorDisplay from "@/components/ErrorDisplay";
import { templatePresets } from "@/data/presets";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function Page() {
  // Student management
  const [students, setStudents] = useState<Student[]>([]);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentLearningStyle, setStudentLearningStyle] = useState("");
  const [studentInterests, setStudentInterests] = useState("");
  const [studentNeedsSupport, setStudentNeedsSupport] = useState("");

  // Chat sessions
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  // Topic and competency
  const [topic, setTopic] = useState("");
  const [competency, setCompetency] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const [refine, setRefine] = useState("");
  const [loading, setLoading] = useState(false);
  
  // HCAI: Additional state
  const [plainLanguageMode, setPlainLanguageMode] = useState(false);
  const [dontKeepHistory, setDontKeepHistory] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [lastError, setLastError] = useState<{ raw?: string; parseError?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  // Student management functions
  function saveStudent() {
    if (!studentName.trim()) return;

    if (editingStudent) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudent.id
            ? {
                ...s,
                name: studentName,
                learningStyle: studentLearningStyle || undefined,
                interests: studentInterests || undefined,
                needsSupportWith: studentNeedsSupport || undefined,
              }
            : s
        )
      );
    } else {
      const newStudent: Student = {
        id: Date.now().toString(),
        name: studentName,
        learningStyle: studentLearningStyle || undefined,
        interests: studentInterests || undefined,
        needsSupportWith: studentNeedsSupport || undefined,
        createdAt: new Date(),
      };
      setStudents((prev) => [...prev, newStudent]);
    }

    // Reset form
    setStudentName("");
    setStudentLearningStyle("");
    setStudentInterests("");
    setStudentNeedsSupport("");
    setEditingStudent(null);
    setShowStudentForm(false);
  }

  function editStudent(student: Student) {
    setEditingStudent(student);
    setStudentName(student.name);
    setStudentLearningStyle(student.learningStyle || "");
    setStudentInterests(student.interests || "");
    setStudentNeedsSupport(student.needsSupportWith || "");
    setShowStudentForm(true);
  }

  function deleteStudent(studentId: string) {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
  }

  function toggleStudentSelection(studentId: string) {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  }

  function selectAllStudents() {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  }

  // Generate question set for a single student
  async function generateQuestionSetForStudent(student: Student, sessionHistory: ChatTurn[], plainLanguage = false): Promise<QuestionSet | null> {
    const languageHint = plainLanguage ? "Use simple, clear language appropriate for the student's age level. Avoid complex vocabulary." : "";
    
    const userTurn = `
Create a QuestionSet for ONE student using the schema in the system prompt.

Topic: ${topic}
Competency: ${competency}

Student:
- name: ${student.name}
- learnerProfile: ${student.learningStyle || "Not specified"}
- needsSupportWith: ${student.needsSupportWith || "Not specified"}
- interests: ${student.interests || "Not specified"}

Remember:
- Use SOT scale with exactly six items: Not started (E), Emerging (E), Developing (D), Secure (S), Mastering (M), Extending (Ex).
- Same concept across levels; increase depth and independence.
- Incorporate the student's interests (${student.interests || "general topics"}) where appropriate to make questions engaging.
${languageHint}
`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: sessionHistory, userTurn }),
      });
      const json = await res.json();

      if (json.data) {
        const questionSet = json.data as QuestionSet;
        // Add metadata for provenance
        questionSet.metadata = {
          model: json.metadata?.model || "unknown",
          generatedAt: json.metadata?.generatedAt ? new Date(json.metadata.generatedAt) : new Date(),
          version: 1,
        };
        return questionSet;
      }
      
      // Handle error case
      if (json.raw || json.parseError) {
        setLastError({ raw: json.raw, parseError: json.parseError });
      }
      
      return null;
    } catch (error) {
      console.error("Error generating question set:", error);
      return null;
    }
  }

  async function onGenerate() {
    if (!topic || !competency || selectedStudentIds.length === 0) return;

    const selectedStudents = students.filter((s) => selectedStudentIds.includes(s.id));
    if (selectedStudents.length === 0) return;

    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `${selectedStudents.length} student${selectedStudents.length > 1 ? "s" : ""} - ${topic}`,
      topic,
      competency,
      selectedStudentIds: [...selectedStudentIds],
      createdAt: new Date(),
      lastMessageAt: new Date(),
      questionSets: [],
      history: [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setLoading(true);

    // Add user message
    const userMessage: ChatTurn = {
      role: "user",
      content: `Generate question sets for ${selectedStudents.length} student${selectedStudents.length > 1 ? "s" : ""} on topic: ${topic}, competency: ${competency}`,
      timestamp: new Date(),
    };

    // Generate question sets for each student
    const questionSets: QuestionSet[] = [];
    for (const student of selectedStudents) {
      const questionSet = await generateQuestionSetForStudent(student, [], plainLanguageMode);
      if (questionSet) {
        questionSets.push(questionSet);
      }
    }

    // Store original sets for undo/restore
    const originalSets = [...questionSets];

    // Update session with all question sets
    const assistantTurns: ChatTurn[] = questionSets.map((qs) => ({
      role: "assistant" as const,
      content: JSON.stringify(qs),
      timestamp: new Date(),
    }));

    const newHistory = dontKeepHistory ? [] : [userMessage, ...assistantTurns];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === newSession.id
          ? {
              ...s,
              questionSets,
              history: newHistory,
              originalSets,
              versionHistory: questionSets.map((qs) => [{
                questionSet: { ...qs },
                timestamp: new Date(),
                action: "generated" as const,
              }]),
              lastMessageAt: new Date(),
            }
          : s
      )
    );

    setLoading(false);
  }

  function onRefine() {
    if (!refine.trim() || !activeSession) return;
    const msg = `Refine all QuestionSets with this instruction (regenerate all six levels for each student): ${refine}`;
    
    setLoading(true);
    const selectedStudents = students.filter((s) => activeSession.selectedStudentIds.includes(s.id));
    
    // Regenerate for all students
    Promise.all(
      selectedStudents.map((student) => generateQuestionSetForStudent(student, activeSession.history))
    ).then((questionSets) => {
      const validQuestionSets = questionSets.filter((qs): qs is QuestionSet => qs !== null);
      
      const refineMessage: ChatTurn = { role: "user", content: msg, timestamp: new Date() };
      
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                questionSets: validQuestionSets,
                history: [...s.history, refineMessage, ...validQuestionSets.map((qs) => ({ role: "assistant" as const, content: JSON.stringify(qs), timestamp: new Date() }))],
                lastMessageAt: new Date(),
              }
            : s
        )
      );
      setLoading(false);
    });
    
    setRefine("");
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  function downloadJson(questionSet: QuestionSet) {
    const blob = new Blob([JSON.stringify(questionSet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${questionSet.student.name}-${questionSet.topic}-set.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function generateMarkdown(questionSet: QuestionSet): string {
    const lines = [
      `# ${questionSet.topic} — ${questionSet.competency}`,
      `**Student:** ${questionSet.student.name}`,
      "",
      ...questionSet.items.map((it) => `### ${it.levelLabel}\n- **Q:** ${it.question}\n- _Rationale:_ ${it.rationale}${it.formatHint ? `\n- _Format:_ ${it.formatHint}` : ""}${it.realWorldContext ? `\n- _Context:_ ${it.realWorldContext}` : ""}`),
    ];
    return lines.join("\n");
  }

  function startNewChat() {
    setActiveSessionId(null);
    setTopic("");
    setCompetency("");
    setSelectedStudentIds([]);
    setSelectedPreset(""); // Reset preset when starting new chat
  }

  function deleteSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setTopic("");
      setCompetency("");
      setSelectedStudentIds([]);
    }
  }

  // HCAI: Undo/Restore functions
  function undoLastChange() {
    if (!activeSession) return;
    // Implementation would restore from versionHistory
    // For now, restore from originalSets if available
    if (activeSession.originalSets) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, questionSets: [...s.originalSets!] }
            : s
        )
      );
    }
  }

  function restoreOriginal() {
    if (!activeSession?.originalSets) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, questionSets: [...s.originalSets!] }
          : s
      )
    );
  }

  // HCAI: Handle feedback submission
  function handleFeedbackSubmit(feedback: Feedback) {
    if (!activeSessionId) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, feedback: [...(s.feedback || []), feedback] }
          : s
      )
    );
  }

  // HCAI: Handle preset selection
  function handlePresetSelect(presetId: string) {
    const preset = templatePresets.find((p) => `${p.topic}-${p.competency}` === presetId);
    if (preset) {
      setTopic(preset.topic);
      setCompetency(preset.competency);
      setSelectedPreset(presetId);
    }
  }

  // HCAI: Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.history]);

  // HCAI: Handle quick refinement
  function handleQuickRefinement(prompt: string) {
    setRefine(prompt);
    // Auto-trigger if there's an active session with question sets
    if (activeSession && activeSession.questionSets.length > 0) {
      setTimeout(() => {
        onRefine();
      }, 100);
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* HCAI: Help/About modal */}
      <HelpAbout />
      {/* Left Sidebar - Students & Chat List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* App Name Header */}
        <div className="p-4 border-b border-gray-200 bg-purple-50">
          <h1 className="text-xl font-bold text-purple-700">Competency Question Generator</h1>
        </div>
        
        {/* Students Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Students</h2>
            <button
              onClick={() => {
                setShowStudentForm(true);
                setEditingStudent(null);
                setStudentName("");
                setStudentLearningStyle("");
                setStudentInterests("");
                setStudentNeedsSupport("");
              }}
              className="text-sm px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              + Add
            </button>
          </div>
          
          {students.length > 0 && (
            <button
              onClick={selectAllStudents}
              className="text-xs text-purple-600 hover:text-purple-700"
            >
              {selectedStudentIds.length === students.length ? "Deselect all" : "Select all"}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {students.map((student) => (
            <div
              key={student.id}
              className={`p-3 mb-2 rounded-lg border-2 transition-colors cursor-pointer ${
                selectedStudentIds.includes(student.id)
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => toggleStudentSelection(student.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                  {getInitials(student.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-800 text-sm">{student.name}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          editStudent(student);
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteStudent(student.id);
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  {student.learningStyle && (
                    <p className="text-xs text-gray-600">Style: {student.learningStyle}</p>
                  )}
                  {student.interests && (
                    <p className="text-xs text-gray-600">Interests: {student.interests}</p>
                  )}
                  {student.needsSupportWith && (
                    <p className="text-xs text-gray-600">Needs: {student.needsSupportWith}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {students.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm">
              No students yet. Click "+ Add" to add a student.
            </div>
          )}
        </div>

        {/* Chat Sessions */}
        <div className="border-t border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">History</h2>
          </div>
          <div className="flex-1 overflow-y-auto max-h-64">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setTopic(session.topic);
                  setCompetency(session.competency);
                  setSelectedStudentIds(session.selectedStudentIds);
                }}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors relative group ${
                  activeSessionId === session.id ? "bg-purple-50 border-l-4 border-l-purple-500" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                    {session.selectedStudentIds.length > 0 ? session.selectedStudentIds.length : "?"}
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
                      {session.questionSets.length > 0 ? `${session.questionSets.length} question set${session.questionSets.length > 1 ? "s" : ""}` : "New conversation"}
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
            + New Chat
          </button>
        </div>
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="flex-1 flex flex-col bg-white">
        {activeSessionId && activeSession ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
                  {activeSession.selectedStudentIds.length}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{activeSession.title}</h3>
                  <p className="text-xs text-gray-500">
                    {activeSession.topic} — {activeSession.competency}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50" role="log" aria-live="polite" aria-atomic="false">
              <div className="max-w-4xl mx-auto space-y-4">
                {activeSession.history.map((turn, idx) => {
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
                      const questionSet = JSON.parse(turn.content) as QuestionSet;
                      return (
                        <div key={idx} className="flex justify-start">
                          <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm border border-gray-200">
                            <div className="mb-3">
                              <h4 className="font-semibold text-gray-800 mb-2">
                                {questionSet.topic} — {questionSet.competency}
                              </h4>
                              <p className="text-sm text-gray-600 mb-1">
                                <strong>Student:</strong> {questionSet.student.name}
                              </p>
                              {questionSet.student.learnerProfile && (
                                <p className="text-xs text-gray-500 mb-1">
                                  Learning style: {questionSet.student.learnerProfile}
                                </p>
                              )}
                              {/* HCAI: Quality Badges */}
                              <Badges questionSet={questionSet} />
                              
                              {/* HCAI: Provenance info */}
                              {questionSet.metadata && (
                                <div className="mb-3 text-xs text-gray-500">
                                  <span>Model-generated</span>
                                  {questionSet.metadata.model && (
                                    <span> • {questionSet.metadata.model}</span>
                                  )}
                                  {questionSet.metadata.generatedAt && (
                                    <span> • {new Date(questionSet.metadata.generatedAt).toLocaleString()}</span>
                                  )}
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 mt-3">
                                {questionSet.items.map((item) => (
                                  <QuestionCard
                                    key={item.levelKey}
                                    item={item}
                                    showActions={true}
                                    onTagIssue={(issue) => {
                                      // Handle issue tagging - could trigger refinement
                                      setRefine(`Fix issue "${issue}" for ${item.levelLabel} level`);
                                    }}
                                  />
                                ))}
                              </div>
                              
                              {/* HCAI: Feedback Block */}
                              <FeedbackBlock 
                                questionSet={questionSet} 
                                onFeedbackSubmit={handleFeedbackSubmit}
                              />
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() => copy(JSON.stringify(questionSet, null, 2))}
                                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  Copy JSON
                                </button>
                                <button
                                  onClick={() => downloadJson(questionSet)}
                                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  Download JSON
                                </button>
                                <button
                                  onClick={() => copy(generateMarkdown(questionSet))}
                                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  Copy Markdown
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
                
                {/* HCAI: Error display */}
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
                      setRefine("Re-emit the last QuestionSet as valid JSON only, schema-compliant, no commentary.");
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
              </div>
            </div>

            {/* Chat Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-2 items-end">
                  <input
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder='Type your message...'
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
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
            <div className="max-w-2xl w-full space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Start a New Conversation</h3>
                <p className="text-gray-500 mb-6">Add students, select them, and generate personalized question sets</p>
              </div>

              <div className="space-y-3">
                {/* HCAI: Template presets */}
                <div>
                  <label htmlFor="preset-select-initial" className="block text-sm font-medium text-gray-700 mb-1">
                    Template Starter (optional)
                  </label>
                  <select
                    id="preset-select-initial"
                    value={selectedPreset}
                    onChange={(e) => handlePresetSelect(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a template...</option>
                    {templatePresets.map((preset) => (
                      <option key={`${preset.topic}-${preset.competency}`} value={`${preset.topic}-${preset.competency}`}>
                        {preset.topic} — {preset.competency}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="topic-input-initial" className="block text-sm font-medium text-gray-700 mb-1">
                      Topic
                    </label>
                    <input
                      id="topic-input-initial"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Topic (e.g., Fractions)"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="competency-input-initial" className="block text-sm font-medium text-gray-700 mb-1">
                      Competency
                    </label>
                    <input
                      id="competency-input-initial"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Competency (e.g., Equivalent fractions)"
                      value={competency}
                      onChange={(e) => setCompetency(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* HCAI: Privacy and accessibility controls */}
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="plain-language-initial"
                      checked={plainLanguageMode}
                      onChange={(e) => setPlainLanguageMode(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="plain-language-initial" className="text-sm text-gray-700">
                      Plain language mode
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="dont-keep-history-initial"
                      checked={dontKeepHistory}
                      onChange={(e) => setDontKeepHistory(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="dont-keep-history-initial" className="text-sm text-gray-700">
                      Don't keep this in local history
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Use first name or alias only; avoid sensitive details.
                  </p>
                </div>
                
                <button
                  onClick={onGenerate}
                  disabled={loading || !topic || !competency || selectedStudentIds.length === 0}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? "Generating..." : `Generate for ${selectedStudentIds.length} student${selectedStudentIds.length !== 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student Form Modal */}
      {showStudentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingStudent ? "Edit Student" : "Add Student"}
            </h3>
            <div className="space-y-3">
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Student name *"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Learning style (e.g., visual learner, kinesthetic)"
                value={studentLearningStyle}
                onChange={(e) => setStudentLearningStyle(e.target.value)}
              />
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Interests (e.g., sports, music, animals)"
                value={studentInterests}
                onChange={(e) => setStudentInterests(e.target.value)}
              />
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Needs support with (e.g., denominators, word problems)"
                value={studentNeedsSupport}
                onChange={(e) => setStudentNeedsSupport(e.target.value)}
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowStudentForm(false);
                  setEditingStudent(null);
                  setStudentName("");
                  setStudentLearningStyle("");
                  setStudentInterests("");
                  setStudentNeedsSupport("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveStudent}
                disabled={!studentName.trim()}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
