"use client";

import { QuestionSet } from "@/types/questions";

interface QualityBadgesProps {
  questionSet: QuestionSet;
}

export default function QualityBadges({ questionSet }: QualityBadgesProps) {
  // Heuristic checks
  const hasAllLevels = questionSet.items.length === 6;
  const levelKeys = questionSet.items.map((item) => item.levelKey);
  const expectedLevels = ["NS", "E", "D", "S", "M", "Ex"];
  const allLevelsPresent = expectedLevels.every((level) => levelKeys.includes(level as any));
  
  // Basic curriculum alignment check (topic and competency present)
  const hasCurriculumInfo = !!(questionSet.topic && questionSet.competency);
  
  // Simple reading level estimate (word count heuristic)
  const avgWordsPerQuestion = questionSet.items.reduce((sum, item) => {
    return sum + item.question.split(/\s+/).length;
  }, 0) / questionSet.items.length;
  
  // Rough grade estimate (very basic heuristic)
  let estimatedGrade = "K-2";
  if (avgWordsPerQuestion > 20) estimatedGrade = "3-5";
  if (avgWordsPerQuestion > 30) estimatedGrade = "6-8";
  if (avgWordsPerQuestion > 40) estimatedGrade = "9-12";

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <div className="group relative">
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          hasCurriculumInfo ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
        }`}>
          {hasCurriculumInfo ? "✓" : "⚠"} Curriculum alignment
        </span>
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
          <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
            {hasCurriculumInfo 
              ? "Topic and competency information present" 
              : "Topic or competency may be missing"}
          </div>
        </div>
      </div>

      <div className="group relative">
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
          Reading level: {estimatedGrade}
        </span>
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
          <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
            Estimated based on question length (heuristic, not guaranteed)
          </div>
        </div>
      </div>

      <div className="group relative">
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          allLevelsPresent ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
        }`}>
          {allLevelsPresent ? "✓" : "⚠"} Diversity of levels
        </span>
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
          <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
            {allLevelsPresent 
              ? "All 6 SOT levels present" 
              : `Only ${questionSet.items.length} level(s) found`}
          </div>
        </div>
      </div>
    </div>
  );
}

