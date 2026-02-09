export type Category =
  | "probability"
  | "statistics"
  | "stochastic-calculus"
  | "options-pricing"
  | "brain-teasers"
  | "linear-algebra";

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
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
  category: Category;
  difficulty: Difficulty | "mixed";
  totalQuestions: number;
  correctAnswers: number;
  timeTakenMs: number;
  date: string;
}

export interface UserProgress {
  totalAttempted: number;
  totalCorrect: number;
  categoryStats: Record<Category, { attempted: number; correct: number }>;
  history: QuizResult[];
}
