"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24">
        <header className="flex items-center gap-3 mb-12">
          <Image src="/tekko_logo.png" alt="Tekko logo" width={64} height={64} className="h-16 w-16 object-contain" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Competency Question Generator</h1>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-sm text-purple-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
              Built for Swiss Lehrplan 21
          </div>
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Launch tailored lesson ideas in minutes.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Select your competency, capture classroom context, and let our AI assistant produce scaffolded activities for every learning level—complete with optional project-style lesson ideas.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Link
                href="/design?new=1"
                className="inline-flex justify-center items-center w-full sm:flex-1 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors shadow-lg shadow-purple-200"
              >
                Create a lesson design
              </Link>
              <a
                href="#features"
                className="inline-flex justify-center items-center w-full sm:flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
              >
                Explore how it works
              </a>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-purple-500" />
                Guided wizard that captures teaching context with HCAI best practices.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-purple-500" />
                Sticky-note canvas for Beginner, Intermediate, Advanced, and General ideas.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-purple-500" />
                One-click export to JSON for lesson libraries or sharing.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-purple-500" />
                Built on top of OpenAI Responses API with transparent metadata.
              </li>
            </ul>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-200 to-transparent rounded-3xl blur-3xl opacity-60" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-purple-100 shadow-2xl p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-purple-500 font-semibold uppercase tracking-wide">Start here</p>
                <h3 className="text-2xl font-semibold text-gray-900">Design a competency-synced lesson</h3>
                <p className="text-gray-600">
                  Move from inspiration to classroom-ready activities with structured steps and transparent controls.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-purple-600 bg-purple-100 rounded-full px-3 py-1">1</span>
              <div>
                    <p className="font-semibold text-gray-900">Pick difficulty levels</p>
                    <p className="text-sm text-gray-600">Beginner to Advanced, plus optional general lesson ideas.</p>
              </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-purple-600 bg-purple-100 rounded-full px-3 py-1">2</span>
                  <div>
                    <p className="font-semibold text-gray-900">Capture teaching context</p>
                    <p className="text-sm text-gray-600">Competency, class size, materials, and student needs.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-purple-600 bg-purple-100 rounded-full px-3 py-1">3</span>
                      <div>
                    <p className="font-semibold text-gray-900">Launch your sticky-note canvas</p>
                    <p className="text-sm text-gray-600">Regenerate, drag, and export ideas in seconds.</p>
                </div>
                </div>
              </div>
              <Link
                href="/design?new=1"
                className="inline-flex justify-center items-center w-full px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
              >
                Begin a new lesson design
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Guided HCAI workflow",
              body: "Step-by-step wizard captures only the data you need and keeps teachers in control of every decision.",
            },
            {
              title: "Detailed context summary",
              body: "Automatic side panel highlights learning objective, class context, and included levels for transparency.",
            },
            {
              title: "Flexible outputs",
              body: "Download JSON, copy lesson ideas, or refine your canvas with new prompts at any time.",
            },
          ].map((feature) => (
            <div key={feature.title} className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-lg font-semibold text-gray-900">{feature.title}</h4>
              <p className="mt-2 text-sm text-gray-600">{feature.body}</p>
        </div>
          ))}
        </section>
    </div>
    </main>
  );
}
