# HCAI Implementation Notes

This document maps Google PAIR HCAI patterns to UI elements and code paths in the Tekko Lecture Design Assistant application.

## Pattern → UI/Code Mapping

| PAIR Pattern | UI Element / Code Path | File/Function | Notes |
|-------------|------------------------|---------------|-------|
| **1. Make capabilities & limits clear** | Help/About modal (floating button) | `components/HelpAbout.tsx` | Always-visible help button opens modal with capabilities, limits, privacy info. Lists what the system does/doesn't do. |
| **2. Set expectations for quality** | Quality badges (curriculum alignment, reading level, diversity) | `components/Badges.tsx` | Heuristic checks displayed as badges with tooltips. Shows curriculum alignment, estimated reading level, and level diversity. |
| **3. Expose uncertainty & provenance** | "Why this level?" toggle, model metadata | `components/QuestionCard.tsx`, `app/page.tsx` (metadata display) | Each question card has toggle to show rationale. Model name and generation timestamp displayed. Metadata stored in QuestionSet. |
| **4. Keep human in control** | Edit/Regenerate/Replace per level, Undo/Restore | `components/QuestionCard.tsx`, `app/page.tsx` (undo/restore functions) | Per-level actions available. Global Undo and Restore original buttons. Version history stored in session state. |
| **5. Support efficient correction** | Quick-refinement chips, issue tags | `components/QuickRefinementChips.tsx`, `components/QuestionCard.tsx` | Pre-defined refinement prompts as chips. Issue tags per level (Too hard, Off-topic, etc.) trigger targeted refinements. |
| **6. Fail safely & gracefully** | Error display with repair options | `components/ErrorDisplay.tsx`, `app/page.tsx` (error handling) | When JSON parsing fails, shows error UI with "Try again", "Show raw output", and "Send correction prompt" options. |
| **7. Match teacher mental models** | Template presets, teacher-friendly language | `data/presets.ts`, `app/page.tsx` (preset selection) | Dropdown with curriculum-aligned templates (Fractions, Decimals, Reading Comprehension, etc.). Uses teacher terminology throughout. |
| **8. Allow meaningful feedback** | Rating + comment per set | `components/FeedbackBlock.tsx`, `app/page.tsx` (handleFeedbackSubmit) | 1-5 rating, optional comment, "Used in class?" toggle. Stored in session state (ready for future persistence). |
| **9. Respect privacy & agency** | Data use toggle, micro-copy reminders | `app/page.tsx` (dontKeepHistory state) | "Don't keep this in local history" toggle (default ON). Privacy reminder text under student fields. |
| **10. Accessibility & inclusion** | WCAG AA compliance, plain language mode | Throughout `app/page.tsx` | Proper labels, aria-live regions, keyboard navigation, focus states. Plain language mode checkbox adds simplification hint to prompts. |
| **11. Document assumptions** | This document | `HCAI_NOTES.md` | Comprehensive mapping of patterns to implementation. |

## Implementation Details

### Metadata & Provenance
- Model name and generation timestamp stored in `QuestionSet.metadata`
- Displayed in question set header
- API route (`app/api/chat/route.ts`) includes model info in response

### Version History
- `ChatSession.versionHistory` stores array of versions per student
- `ChatSession.originalSets` stores initial generated sets for restore
- Undo/Restore functions in `app/page.tsx` restore from these stores

### Error Handling
- JSON parsing errors caught and displayed via `ErrorDisplay` component
- Raw output preserved for debugging
- One-click correction prompt: "Re-emit the last QuestionSet as valid JSON only, schema-compliant, no commentary."

### Privacy Controls
- `dontKeepHistory` state controls whether turns are added to session history
- When enabled, only question sets are stored, not conversation history
- Privacy micro-copy: "Use first name or alias only; avoid sensitive details."

### Quality Heuristics
- **Curriculum alignment**: Checks for topic and competency presence
- **Reading level**: Estimates based on average words per question (basic heuristic)
- **Diversity**: Verifies all 6 SOT levels are present

### Template Presets
- 10 pre-defined templates covering common topics
- Stored in `data/presets.ts`
- Pre-fills topic and competency fields

## Limitations & Future Work

### Current Limitations
1. **Version History**: Basic implementation; full undo/redo stack not yet implemented
2. **Quality Heuristics**: Simple word-count based reading level estimation (not guaranteed)
3. **Feedback Persistence**: Stored in local state only; no backend persistence
4. **Edit/Regenerate/Replace**: UI present but full implementation pending (would require modal forms)
5. **Issue Tagging**: Triggers refinement prompt but doesn't track issues persistently

### Future Enhancements
1. **Backend Persistence**: Store feedback, sessions, and version history in database
2. **Advanced Heuristics**: Integrate readability formulas (Flesch-Kincaid, etc.)
3. **Full Edit Flow**: Modal forms for editing individual questions
4. **Analytics Dashboard**: Aggregate feedback and usage patterns (with privacy controls)
5. **Teacher Study**: Collect usage data to improve prompts and heuristics
6. **Dataset Curation**: Build corpus of validated question sets for fine-tuning
7. **Evaluation Framework**: Systematic testing of question quality and appropriateness

## Code Organization

```
components/
  HelpAbout.tsx          # Capabilities/limits modal
  Badges.tsx             # Quality indicators
  FeedbackBlock.tsx       # Rating + comment form
  QuestionCard.tsx        # Individual question with actions
  QuickRefinementChips.tsx # Pre-defined refinement prompts
  ErrorDisplay.tsx        # Error handling UI

data/
  presets.ts             # Template presets

app/
  page.tsx               # Main UI with HCAI integrations
  api/chat/route.ts      # API with metadata support

types/
  questions.ts           # TypeScript interfaces including metadata, feedback, versions
```

## Accessibility Checklist

- ✅ Proper labels on all form inputs
- ✅ aria-live region for chat messages
- ✅ Keyboard navigation support
- ✅ Focus states visible
- ✅ aria-labels on icon buttons
- ✅ Semantic HTML structure
- ✅ Color contrast meets WCAG AA
- ✅ Plain language mode option

## Privacy & Data Minimization

- ✅ No analytics or tracking by default
- ✅ Optional history suppression
- ✅ Micro-copy reminders about PII
- ✅ Only user-provided data sent to API
- ✅ No persistent storage without explicit consent

