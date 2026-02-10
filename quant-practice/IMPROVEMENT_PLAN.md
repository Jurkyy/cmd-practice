# Quant Practice App — Improvement Plan

## Status: COMPLETE

---

## 1. Spaced Repetition System
**Status: DONE**
- SM-2 algorithm in `useProgress.ts` — tracks ease factor, interval, repetitions per question
- Per-question result tracking (questionId, correct, selectedIndex, timeMs) in quiz flow
- Review queue on home screen — shows count of due questions, tap to launch review quiz
- Quiz screen supports `category="review"` mode pulling questions from SR queue
- Wrong answers reset interval to 0 (resurface immediately), correct answers extend interval

**Files:** `src/hooks/useProgress.ts`, `src/types/index.ts`, `app/quiz/[category].tsx`, `app/(tabs)/index.tsx`

## 2. Richer Explanations
**Status: DONE**
- `detailedExplanation` field added — shows step-by-step walkthrough after answer reveal
- `commonMistakes` field added — shown only when user gets the answer wrong
- ~20 key questions across all categories enriched with detailed explanations and common mistakes
- Per-question resources with external links preserved

**Files:** `src/components/QuestionCard.tsx`, `src/data/questions.ts`, `src/types/index.ts`

## 3. Weak-Spot Detection & Tag Analytics
**Status: DONE**
- Accuracy tracked per tag (not just per category) — stored in `tagStats`
- Top 5 weakest areas surfaced on home screen and progress screen
- Accuracy per difficulty level (Easy/Medium/Hard) tracked in `difficultyStats`
- Visual progress bars with color-coded accuracy

**Files:** `src/hooks/useProgress.ts`, `app/(tabs)/index.tsx`, `app/(tabs)/progress.tsx`

## 4. Concept-Linked Guides
**Status: DONE**
- All guide sections have unique `id` fields (e.g. "prob-bayes", "stoch-ito")
- Questions have `guideSection` field linking to relevant guide section
- "Study this concept" button appears in quiz explanation when `guideSection` is set
- Results screen has "Study Guide" button when score < 80%

**Files:** `src/data/guides.ts`, `src/data/questions.ts`, `src/components/QuestionCard.tsx`, `app/quiz/results.tsx`

## 5. Learning Paths
**Status: DONE**
- 3 curated paths: "Quant Interview Foundations" (easy), "Stochastic Calculus Deep Dive" (hard), "Options & Greeks Mastery" (medium)
- Each path alternates guide reading and quiz practice with difficulty progression
- Learning path detail screen with step-by-step timeline view
- Path cards on Learn tab with difficulty badges and step counts

**Files:** `src/data/paths.ts`, `app/(tabs)/learn.tsx`, `app/learn/path/[id].tsx`, `app/_layout.tsx`

## 6. Gamification — Streaks, Goals, Achievements
**Status: DONE**
- Daily streak tracking with current/longest/lastPracticeDate
- 10 achievement badges: First Steps, Getting Serious, Half Century, Flawless, On Fire (3-day), Week Warrior (7-day), Well Rounded, Hard Mode, Century Club, Monthly Master (30-day)
- Achievement toast modal on home screen when new achievements earned
- Achievement grid on progress screen (earned vs locked)
- Streak display on both home and progress screens

**Files:** `src/types/index.ts`, `src/hooks/useProgress.ts`, `app/(tabs)/index.tsx`, `app/(tabs)/progress.tsx`

---

## Implementation Log

### Session 1
- Expanded type system: QuestionSRData, PerQuestionResult, StreakData, Achievement, LearningPath, TagStats, DifficultyStats
- Rewrote useProgress hook with SM-2 algorithm, streak tracking, tag/difficulty stats, achievement checking
- Added per-question result tracking to quiz flow
- Added detailedExplanation and commonMistakes display to QuestionCard
- Rewrote home screen with review queue, streaks, weak spots, achievements
- Upgraded progress screen with difficulty breakdown, tag analytics, streak, achievements
- Added guide section IDs to all topic guides
- Created 3 learning paths with curated step sequences
- Added learning path detail screen with timeline view
- Added learning paths section to Learn tab
- Added concept-linked "Study this concept" button in quiz explanations
- Added detailedExplanation, commonMistakes, and guideSection to ~20 key questions
- All TypeScript checks pass
