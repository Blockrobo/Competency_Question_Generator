"use client";

import { useState } from "react";

interface ErrorDisplayProps {
  rawOutput?: string;
  parseError?: string;
  onRetry: () => void;
  onShowRaw: () => void;
  onSendCorrection: () => void;
}

export default function ErrorDisplay({ 
  rawOutput, 
  parseError, 
  onRetry, 
  onShowRaw, 
  onSendCorrection 
}: ErrorDisplayProps) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-2 mb-3">
        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="flex-1">
          <h4 className="font-semibold text-yellow-800 mb-1">Couldn't structure this output</h4>
          <p className="text-sm text-yellow-700 mb-2">
            The AI response couldn't be parsed as valid JSON. {parseError && `Error: ${parseError}`}
          </p>
        </div>
      </div>

      {showRaw && rawOutput && (
        <div className="mb-3 p-3 bg-white rounded border border-yellow-200">
          <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-auto max-h-64">
            {rawOutput}
          </pre>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onRetry}
          className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
        >
          Try again
        </button>
        <button
          onClick={() => {
            setShowRaw(!showRaw);
            if (!showRaw) onShowRaw();
          }}
          className="px-3 py-1.5 bg-white border border-yellow-300 text-yellow-800 rounded-lg hover:bg-yellow-50 transition-colors text-sm"
        >
          {showRaw ? "Hide" : "Show"} raw output
        </button>
        <button
          onClick={onSendCorrection}
          className="px-3 py-1.5 bg-white border border-yellow-300 text-yellow-800 rounded-lg hover:bg-yellow-50 transition-colors text-sm"
        >
          Send correction prompt
        </button>
      </div>
    </div>
  );
}

