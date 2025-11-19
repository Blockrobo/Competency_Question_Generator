import { useRef, useState } from "react";
import { LessonDesign, LessonIdea } from "@/types/questions";
import StickyNote from "@/components/StickyNote";

interface LessonCanvasProps {
  lessonDesign: LessonDesign | null;
  loading: boolean;
  onIdeaDrag: (index: number, position: { x: number; y: number }) => void;
}

export default function LessonCanvas({ lessonDesign, loading, onIdeaDrag }: LessonCanvasProps) {
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

  function handleIdeaDrag(index: number, position: { x: number; y: number }) {
    onIdeaDrag(index, position);
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
    const target = e.target as HTMLElement;
    if (target.closest("[data-sticky-note='true']")) return;
    if (target.closest("[data-canvas-ignore-pan='true']")) return;
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

  return (
    <div className="flex-1 overflow-hidden">
      <div
        ref={canvasViewportRef}
        className={`relative w-full h-full ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
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
          {lessonDesign && lessonDesign.ideas.length > 0 ? (
            lessonDesign.ideas.map((idea: LessonIdea, idx: number) => (
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
        <div
          className="absolute top-4 right-4 text-xs text-gray-600 bg-white/80 px-3 py-1 rounded-full shadow"
          data-canvas-ignore-pan="true"
        >
          Scroll to zoom • Drag empty canvas to pan • Drag notes to rearrange
        </div>
        {loading && (
          <div
            className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none"
            data-canvas-ignore-pan="true"
          >
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
  );
}
