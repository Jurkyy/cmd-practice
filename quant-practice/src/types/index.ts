export type Category =
  | "probability"
  | "statistics"
  | "stochastic-calculus"
  | "options-pricing"
  | "brain-teasers"
  | "linear-algebra";

export type Difficulty = "easy" | "medium" | "hard";

export type Duration = "quick" | "medium" | "long";

export type Tag =
  | "interview-classic"
  | "mental-math"
  | "derivation"
  | "greeks"
  | "risk-management"
  | "portfolio-theory"
  | "fixed-income"
  | "market-microstructure"
  | "combinatorics"
  | "distributions"
  | "bayesian"
  | "regression"
  | "time-series"
  | "martingale"
  | "ito-calculus"
  | "mean-reversion"
  | "black-scholes"
  | "volatility"
  | "hedging"
  | "logic-puzzle"
  | "estimation"
  | "matrix-ops"
  | "decomposition"
  | "numerical-methods"
  | "expected-value"
  | "variance"
  | "pde"
  | "monte-carlo";

export type ResourceType = "article" | "video" | "book" | "paper" | "tool";

export interface Resource {
  title: string;
  url: string;
  type: ResourceType;
  free?: boolean;
}

// ─── Guide types ────────────────────────────────────────────────

export interface GuideSection {
  id: string; // e.g. "prob-counting" — used for concept linking
  title: string;
  content: string;
  keyFormulas?: string[];
  tips?: string[];
}

export interface TopicGuide {
  category: Category;
  title: string;
  icon: string;
  overview: string;
  sections: GuideSection[];
  resources: Resource[];
}

// ─── Question types ─────────────────────────────────────────────

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  duration: Duration;
  tags: Tag[];
  title: string;
  body: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  detailedExplanation?: string;
  commonMistakes?: string[];
  resources?: Resource[];
  hint?: string;
  guideSection?: string; // links to GuideSection.id
  askedAt?: string[];    // company IDs where this question has been asked
}

export interface CategoryInfo {
  id: Category;
  name: string;
  icon: string;
  description: string;
  color: string;
}

// ─── Quiz types ─────────────────────────────────────────────────

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  answers: (number | null)[];
  startedAt: number;
}

export interface PerQuestionResult {
  questionId: string;
  correct: boolean;
  selectedIndex: number;
  timeMs: number;
}

export interface QuizResult {
  category: Category | "all";
  difficulty: Difficulty | "mixed";
  totalQuestions: number;
  correctAnswers: number;
  timeTakenMs: number;
  date: string;
  tags?: Tag[];
  questionResults?: PerQuestionResult[];
}

// ─── Spaced Repetition ──────────────────────────────────────────

export interface QuestionSRData {
  questionId: string;
  /** SM-2 fields */
  easeFactor: number; // starts at 2.5
  interval: number; // days until next review
  repetitions: number; // consecutive correct
  nextReviewDate: string; // ISO date string
  /** History */
  lastAttemptDate: string;
  totalAttempts: number;
  totalCorrect: number;
}

// ─── Progress types ─────────────────────────────────────────────

export interface TagStats {
  attempted: number;
  correct: number;
}

export interface DifficultyStats {
  attempted: number;
  correct: number;
}

export interface UserProgress {
  totalAttempted: number;
  totalCorrect: number;
  categoryStats: Record<Category, { attempted: number; correct: number }>;
  tagStats: Record<string, TagStats>;
  difficultyStats: Record<Difficulty, DifficultyStats>;
  history: QuizResult[];
  /** Spaced repetition data per question */
  srData: Record<string, QuestionSRData>;
  /** Gamification */
  streak: StreakData;
  achievements: string[]; // earned achievement IDs
}

// ─── Gamification ───────────────────────────────────────────────

export interface StreakData {
  current: number;
  longest: number;
  lastPracticeDate: string; // ISO date
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (progress: UserProgress) => boolean;
}

// ─── Learning paths ─────────────────────────────────────────────

export interface LearningPathStep {
  type: "guide" | "quiz";
  /** For guide: category + sectionId. For quiz: category + filters */
  category: Category;
  sectionId?: string; // for guide steps
  difficulty?: Difficulty; // for quiz steps
  title: string;
  description: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: Difficulty;
  estimatedHours: number;
  steps: LearningPathStep[];
}

// ─── Mental Math ────────────────────────────────────────────────

export type MathOperation = "add" | "subtract" | "multiply" | "divide";

export type MathDifficulty = "easy" | "medium" | "hard";

export interface MentalMathConfig {
  operations: MathOperation[];
  difficulty: MathDifficulty;
  durationSeconds: number; // 60, 120, 180
}

export interface MentalMathResult {
  correct: number;
  attempted: number;
  durationSeconds: number;
  difficulty: MathDifficulty;
  operations: MathOperation[];
  date: string;
  questionsPerMinute: number;
}

export interface MentalMathStats {
  totalSessions: number;
  totalCorrect: number;
  totalAttempted: number;
  bestScore: Record<MathDifficulty, number>; // best correct count per difficulty
  history: MentalMathResult[]; // last 20 sessions
}

export const MATH_OPERATION_CONFIG: Record<
  MathOperation,
  { label: string; symbol: string }
> = {
  add: { label: "Addition", symbol: "+" },
  subtract: { label: "Subtraction", symbol: "\u2212" },
  multiply: { label: "Multiplication", symbol: "\u00D7" },
  divide: { label: "Division", symbol: "\u00F7" },
};

export const MATH_DIFFICULTY_CONFIG: Record<
  MathDifficulty,
  { label: string; color: string; bg: string }
> = {
  easy: { label: "Easy", color: "#4ade80", bg: "#22c55e18" },
  medium: { label: "Medium", color: "#fbbf24", bg: "#f59e0b18" },
  hard: { label: "Hard", color: "#f87171", bg: "#ef444418" },
};

// ─── Filter types ───────────────────────────────────────────────

export interface FilterState {
  difficulty: Difficulty | null;
  duration: Duration | null;
  tags: Tag[];
}

// ─── Config constants ───────────────────────────────────────────

export const TAG_LABELS: Record<Tag, string> = {
  "interview-classic": "Interview Classic",
  "mental-math": "Mental Math",
  derivation: "Derivation",
  greeks: "Greeks",
  "risk-management": "Risk Mgmt",
  "portfolio-theory": "Portfolio",
  "fixed-income": "Fixed Income",
  "market-microstructure": "Microstructure",
  combinatorics: "Combinatorics",
  distributions: "Distributions",
  bayesian: "Bayesian",
  regression: "Regression",
  "time-series": "Time Series",
  martingale: "Martingale",
  "ito-calculus": "It\u00f4 Calculus",
  "mean-reversion": "Mean Reversion",
  "black-scholes": "Black-Scholes",
  volatility: "Volatility",
  hedging: "Hedging",
  "logic-puzzle": "Logic Puzzle",
  estimation: "Estimation",
  "matrix-ops": "Matrix Ops",
  decomposition: "Decomposition",
  "numerical-methods": "Numerical",
  "expected-value": "Expected Value",
  variance: "Variance",
  pde: "PDE",
  "monte-carlo": "Monte Carlo",
};

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; color: string; bg: string }
> = {
  easy: { label: "Easy", color: "#4ade80", bg: "#22c55e18" },
  medium: { label: "Medium", color: "#fbbf24", bg: "#f59e0b18" },
  hard: { label: "Hard", color: "#f87171", bg: "#ef444418" },
};

export const DURATION_CONFIG: Record<
  Duration,
  { label: string; icon: string; minutes: string }
> = {
  quick: { label: "Quick", icon: "\u26A1", minutes: "<1 min" },
  medium: { label: "Medium", icon: "\u23F1", minutes: "1-2 min" },
  long: { label: "Long", icon: "\uD83E\uDDEE", minutes: "3-5 min" },
};

export const RESOURCE_TYPE_CONFIG: Record<
  ResourceType,
  { label: string; icon: string; color: string }
> = {
  article: { label: "Article", icon: "\uD83D\uDCC4", color: "#3b82f6" },
  video: { label: "Video", icon: "\u25B6\uFE0F", color: "#ef4444" },
  book: { label: "Book", icon: "\uD83D\uDCDA", color: "#8b5cf6" },
  paper: { label: "Paper", icon: "\uD83D\uDCDD", color: "#06b6d4" },
  tool: { label: "Tool", icon: "\uD83D\uDD27", color: "#f59e0b" },
};

// ─── Achievements definitions ───────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-quiz",
    title: "First Steps",
    description: "Complete your first quiz",
    icon: "\uD83C\uDF1F",
    condition: (p) => p.history.length >= 1,
  },
  {
    id: "ten-quizzes",
    title: "Getting Serious",
    description: "Complete 10 quizzes",
    icon: "\uD83D\uDD25",
    condition: (p) => p.history.length >= 10,
  },
  {
    id: "fifty-questions",
    title: "Half Century",
    description: "Answer 50 questions",
    icon: "\uD83C\uDFAF",
    condition: (p) => p.totalAttempted >= 50,
  },
  {
    id: "perfect-quiz",
    title: "Flawless",
    description: "Score 100% on a quiz",
    icon: "\uD83D\uDC8E",
    condition: (p) =>
      p.history.some((r) => r.correctAnswers === r.totalQuestions && r.totalQuestions > 0),
  },
  {
    id: "streak-3",
    title: "On Fire",
    description: "Practice 3 days in a row",
    icon: "\uD83D\uDD25",
    condition: (p) => p.streak.current >= 3,
  },
  {
    id: "streak-7",
    title: "Week Warrior",
    description: "Practice 7 days in a row",
    icon: "\u2B50",
    condition: (p) => p.streak.current >= 7,
  },
  {
    id: "all-categories",
    title: "Well Rounded",
    description: "Attempt questions from all 6 categories",
    icon: "\uD83C\uDF0D",
    condition: (p) =>
      Object.values(p.categoryStats).every((s) => s.attempted > 0),
  },
  {
    id: "hard-master",
    title: "Hard Mode",
    description: "Score 80%+ on 10 hard questions",
    icon: "\uD83E\uDDE0",
    condition: (p) =>
      p.difficultyStats.hard.attempted >= 10 &&
      p.difficultyStats.hard.correct / p.difficultyStats.hard.attempted >= 0.8,
  },
  {
    id: "hundred-correct",
    title: "Century Club",
    description: "Get 100 questions correct",
    icon: "\uD83C\uDFC6",
    condition: (p) => p.totalCorrect >= 100,
  },
  {
    id: "streak-30",
    title: "Monthly Master",
    description: "Practice 30 days in a row",
    icon: "\uD83D\uDC51",
    condition: (p) => p.streak.longest >= 30,
  },
];
