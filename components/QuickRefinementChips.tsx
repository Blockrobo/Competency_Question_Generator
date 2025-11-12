"use client";

interface QuickRefinementChipsProps {
  onSelect: (refinement: string) => void;
  disabled?: boolean;
}

const refinementChips = [
  { label: "↑ Challenge Extending", prompt: "Make the Extending level more challenging and require deeper reasoning" },
  { label: "↓ Scaffolding for Not started", prompt: "Add more scaffolding and support to the Not started level" },
  { label: "Add visual element", prompt: "Incorporate visual elements or diagrams where appropriate" },
  { label: "Add real-life scenario", prompt: "Include real-world scenarios and contexts in the questions" },
];

export default function QuickRefinementChips({ onSelect, disabled }: QuickRefinementChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {refinementChips.map((chip) => (
        <button
          key={chip.label}
          onClick={() => onSelect(chip.prompt)}
          disabled={disabled}
          className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

