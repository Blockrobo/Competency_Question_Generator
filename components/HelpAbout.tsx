"use client";

import { useState } from "react";

export default function HelpAbout() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 p-3 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-colors z-40"
        aria-label="About this assistant"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsOpen(false)}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">About this Assistant</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <section>
            <h3 className="font-semibold text-gray-800 mb-2">What it does</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li>Generates lesson designs with activities for three learning levels: Beginner, Intermediate, and Advanced</li>
              <li>For each level (Beginner, Intermediate, Advanced), creates competency-aligned activities that cover the same core concept with varying depth and complexity</li>
              <li>Supports teacher refinements through an interactive chat interface</li>
              <li>Exports lesson designs as JSON</li>
              <li>Considers teacher context (class size, composition, time, materials) when designing activities</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-800 mb-2">What it doesn't do</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li>Grade students or assess their work</li>
              <li>Decide which competencies to teach or when to use them</li>
              <li>Store data by default (all data remains in your browser session)</li>
              <li>Replace teacher judgment—always review and adapt lesson designs before use</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-800 mb-2">Privacy & Data</h3>
            <p className="text-gray-700 text-sm mb-2">
              Only the details you provide are sent to the AI model. No analytics or tracking of student personally identifiable information (PII) occurs.
            </p>
            <p className="text-gray-700 text-sm">
              <strong>Best practice:</strong> Use first names or aliases only; avoid sensitive student details in your inputs.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-800 mb-2">Responsible Use</h3>
            <p className="text-gray-700 text-sm">
              This tool is designed to support teachers in creating lesson designs with differentiated activities. Always review generated content for accuracy, age-appropriateness, and alignment with your curriculum before using with students.
            </p>
          </section>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

