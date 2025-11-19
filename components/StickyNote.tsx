import { useRef, useState } from "react";
import { LessonIdea } from "@/types/questions";

interface StickyNoteProps {
  idea: LessonIdea;
  index: number;
  onDrag: (index: number, position: { x: number; y: number }) => void;
  getWorldPosition: (clientX: number, clientY: number) => { x: number; y: number };
}

export default function StickyNote({ idea, index, onDrag, getWorldPosition }: StickyNoteProps) {
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
      data-sticky-note="true"
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
