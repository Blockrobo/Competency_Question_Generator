import { LessonDesign, LessonIdea, LevelKey } from "@/types/questions";

export const DEFAULT_LEVELS: LevelKey[] = ["Beginner", "Intermediate", "Advanced"];

const LEVEL_COLUMNS: Record<LevelKey, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
  General: 3,
};

function normalizeIdeas(rawIdeas: any[]): LessonIdea[] {
  if (!Array.isArray(rawIdeas)) return [];

  return rawIdeas.map((idea, idx) => {
    const rawMin = Number(idea?.min_number_students ?? 1);
    const safeMin = Number.isFinite(rawMin) && rawMin > 0 ? Math.floor(rawMin) : 1;
    const rawMax = Number(idea?.max_number_students ?? safeMin);
    const safeMax =
      Number.isFinite(rawMax) && rawMax >= safeMin ? Math.floor(rawMax) : Math.max(safeMin, 4);

    const materialsArray = Array.isArray(idea?.materials_needed)
      ? idea.materials_needed
      : idea?.materials_needed
      ? [idea.materials_needed]
      : [];

    const fallbackLevel = DEFAULT_LEVELS[idx % DEFAULT_LEVELS.length];
    const levelKey = (idea?.levelKey ?? fallbackLevel) as LevelKey;

    return {
      levelKey,
      levelLabel: (idea?.levelLabel ?? idea?.levelKey ?? fallbackLevel) as LevelKey,
      title: idea?.title ?? `Idea ${idx + 1}`,
      estimated_duration: idea?.estimated_duration ?? "45 minutes",
      materials_needed: materialsArray.map((m: any) => String(m)),
      min_number_students: safeMin,
      max_number_students: safeMax,
      description:
        idea?.description ??
        "Describe how students engage with the concept, how the teacher facilitates, and what evidence of learning appears.",
      position: idea?.position,
    };
  });
}

export function applyDefaultPositions(ideas: LessonIdea[]): LessonIdea[] {
  const columnWidth = 260;
  const rowHeight = 190;
  const gap = 32;
  const columnCounts: Record<LevelKey, number> = {
    Beginner: 0,
    Intermediate: 0,
    Advanced: 0,
    General: 0,
  };

  return ideas.map((idea) => {
    const columnIndex = LEVEL_COLUMNS[idea.levelKey] ?? 0;
    const rowIndex = columnCounts[idea.levelKey]++;
    return {
      ...idea,
      position:
        idea.position ??
        {
          x: columnIndex * (columnWidth + gap) + 16,
          y: rowIndex * (rowHeight + gap) + 16,
        },
    };
  });
}

export function prepareLessonDesign(raw: LessonDesign): LessonDesign {
  const normalizedIdeas = applyDefaultPositions(normalizeIdeas(raw.ideas || []));
  return {
    ...raw,
    ideas: normalizedIdeas,
  };
}

function difficultyToLevelKey(difficulty: any, idx: number): LevelKey {
  const normalized = typeof difficulty === "string" ? difficulty.toLowerCase() : "";
  if (normalized.includes("beginner")) return "Beginner";
  if (normalized.includes("intermediate")) return "Intermediate";
  if (normalized.includes("advanced")) return "Advanced";
  return DEFAULT_LEVELS[idx % DEFAULT_LEVELS.length];
}

export function mapActivitiesToLessonIdeas(activities: any[]): LessonIdea[] {
  if (!Array.isArray(activities)) return [];
  return activities.map((activity, idx) => {
    const levelKey = difficultyToLevelKey(activity?.difficulty_level, idx);
    const duration =
      typeof activity?.estimated_duration === "number"
        ? `${activity.estimated_duration} minutes`
        : activity?.estimated_duration
        ? String(activity.estimated_duration)
        : "45 minutes";

    const rawMin = Number(activity?.min_number_students);
    const safeMin = Number.isFinite(rawMin) && rawMin > 0 ? Math.floor(rawMin) : 1;
    const rawMax = Number(activity?.max_number_students);
    const safeMax =
      Number.isFinite(rawMax) && rawMax >= safeMin ? Math.floor(rawMax) : Math.max(safeMin, 6);

    const materialsArray = Array.isArray(activity?.materials_needed)
      ? activity.materials_needed
      : activity?.materials_needed
      ? [activity.materials_needed]
      : [];

    return {
      levelKey,
      levelLabel: levelKey,
      title: activity?.title ?? `${levelKey} idea`,
      estimated_duration: duration,
      materials_needed: materialsArray.map((item: any) => String(item)),
      min_number_students: safeMin,
      max_number_students: safeMax,
      description:
        activity?.description ??
        "Describe student actions, teacher facilitation, and the competency alignment.",
    };
  });
}

function normalizeMaterials(value: any): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (typeof value === "string") {
    return value
      .split(/[,;]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function mapLessonIdeasToStickyNotes(lessonIdeas: any[]): LessonIdea[] {
  if (!Array.isArray(lessonIdeas)) return [];

  return lessonIdeas.map((idea, idx) => {
    const rawObjectives =
      idea?.learning_objectives ?? idea?.LearningObjectives ?? idea?.learningObjectives;

    const objectivesList = Array.isArray(rawObjectives)
      ? rawObjectives.map((entry: any) => String(entry))
      : typeof rawObjectives === "string" && rawObjectives.trim().length > 0
      ? [rawObjectives.trim()]
      : undefined;

    const duration =
      typeof idea?.estimated_duration === "number"
        ? `${idea.estimated_duration} minutes`
        : idea?.estimated_duration
        ? String(idea.estimated_duration)
        : "60 minutes";

    const description =
      idea?.activity_description ??
      (objectivesList ? objectivesList.join(", ") : rawObjectives) ??
      "Teacher-provided lesson idea.";

    return {
      levelKey: "General",
      levelLabel: "General",
      title: idea?.title ?? `Lesson Idea ${idx + 1}`,
      estimated_duration: duration,
      materials_needed: normalizeMaterials(idea?.materials_needed),
      min_number_students: 1,
      max_number_students: 30,
      description,
      learningObjectives: objectivesList,
      activity_description: idea?.activity_description,
      isGeneral: true,
    } satisfies LessonIdea;
  });
}
