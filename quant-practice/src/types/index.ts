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
}

export interface CategoryInfo {
  id: Category;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  answers: (number | null)[];
  startedAt: number;
}

export interface QuizResult {
  category: Category | "all";
  difficulty: Difficulty | "mixed";
  totalQuestions: number;
  correctAnswers: number;
  timeTakenMs: number;
  date: string;
  tags?: Tag[];
}

export interface UserProgress {
  totalAttempted: number;
  totalCorrect: number;
  categoryStats: Record<Category, { attempted: number; correct: number }>;
  history: QuizResult[];
}

export interface FilterState {
  difficulty: Difficulty | null;
  duration: Duration | null;
  tags: Tag[];
}

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
  "ito-calculus": "Itô Calculus",
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
  quick: { label: "Quick", icon: "⚡", minutes: "<1 min" },
  medium: { label: "Medium", icon: "⏱", minutes: "1-2 min" },
  long: { label: "Long", icon: "🧮", minutes: "3-5 min" },
};
