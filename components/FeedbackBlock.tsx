"use client";

import { useState } from "react";
import { Feedback, QuestionSet } from "@/types/questions";

interface FeedbackBlockProps {
  questionSet: QuestionSet;
  onFeedbackSubmit: (feedback: Feedback) => void;
}

export default function FeedbackBlock({ questionSet, onFeedbackSubmit }: FeedbackBlockProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [usedInClass, setUsedInClass] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (rating === null) return;
    
    const feedback: Feedback = {
      questionSetId: questionSet.metadata?.version?.toString() || Date.now().toString(),
      rating,
      comment: comment.trim() || undefined,
      usedInClass,
      submittedAt: new Date(),
    };
    
    onFeedbackSubmit(feedback);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">✓ Feedback submitted. Thank you!</p>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Rate this question set (1-5)
      </label>
      <div className="flex gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => setRating(num)}
            className={`w-10 h-10 rounded-lg border-2 transition-colors ${
              rating === num
                ? "bg-purple-500 border-purple-500 text-white"
                : "bg-white border-gray-300 text-gray-700 hover:border-purple-300"
            }`}
            aria-label={`Rate ${num} out of 5`}
          >
            {num}
          </button>
        ))}
      </div>
      
      <textarea
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Optional: Add comments or suggestions..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
      />
      
      <div className="flex items-center gap-2 mb-3">
        <input
          type="checkbox"
          id={`used-${questionSet.metadata?.version}`}
          checked={usedInClass}
          onChange={(e) => setUsedInClass(e.target.checked)}
          className="rounded"
        />
        <label htmlFor={`used-${questionSet.metadata?.version}`} className="text-sm text-gray-700">
          Used in class?
        </label>
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={rating === null}
        className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        Submit Feedback
      </button>
    </div>
  );
}

