"use client";

import { useState } from "react";
import { QuestionItem } from "@/types/questions";

interface QuestionCardProps {
  item: QuestionItem;
  onEdit?: () => void;
  onRegenerate?: () => void;
  onReplace?: () => void;
  onTagIssue?: (issue: string) => void;
  showActions?: boolean;
}

export default function QuestionCard({ 
  item, 
  onEdit, 
  onRegenerate, 
  onReplace,
  onTagIssue,
  showActions = true 
}: QuestionCardProps) {
  const [showRationale, setShowRationale] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const issueTags = ["Too hard", "Off-topic", "Ambiguous wording", "Not age-appropriate"];

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
      <div className="flex items-start justify-between mb-2">
        <div className="text-xs font-semibold text-purple-600">{item.levelLabel}</div>
        {showActions && (
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                aria-label="Edit question"
              >
                Edit
              </button>
            )}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                aria-label="Regenerate this level"
              >
                Regenerate
              </button>
            )}
            {onReplace && (
              <button
                onClick={onReplace}
                className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                aria-label="Replace with custom"
              >
                Replace
              </button>
            )}
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-800 mb-2">{item.question}</p>
      
      <button
        onClick={() => setShowRationale(!showRationale)}
        className="text-xs text-purple-600 hover:text-purple-700 mb-2"
        aria-expanded={showRationale}
      >
        {showRationale ? "Hide" : "Show"} "Why this level?"
      </button>
      
      {showRationale && (
        <div className="mt-2 p-2 bg-white rounded border border-gray-200 text-xs text-gray-700">
          <p><strong>Rationale:</strong> {item.rationale}</p>
          {item.formatHint && (
            <p className="mt-1"><strong>Format hint:</strong> {item.formatHint}</p>
          )}
          {item.realWorldContext && (
            <p className="mt-1"><strong>Real-world context:</strong> {item.realWorldContext}</p>
          )}
        </div>
      )}

      {onTagIssue && (
        <div className="mt-2 flex flex-wrap gap-1">
          {issueTags.map((issue) => (
            <button
              key={issue}
              onClick={() => {
                setSelectedIssue(issue === selectedIssue ? null : issue);
                if (issue !== selectedIssue && onTagIssue) {
                  onTagIssue(issue);
                }
              }}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                selectedIssue === issue
                  ? "bg-red-200 text-red-800"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {issue}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

