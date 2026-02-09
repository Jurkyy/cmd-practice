import { CategoryInfo } from "../types";

export const categories: CategoryInfo[] = [
  {
    id: "probability",
    name: "Probability",
    icon: "🎲",
    description: "Combinatorics, conditional probability, distributions",
    color: "#3b82f6",
  },
  {
    id: "statistics",
    name: "Statistics",
    icon: "📊",
    description: "Estimation, hypothesis testing, regression",
    color: "#8b5cf6",
  },
  {
    id: "stochastic-calculus",
    name: "Stochastic Calculus",
    icon: "∫",
    description: "Brownian motion, Itô's lemma, SDEs",
    color: "#06b6d4",
  },
  {
    id: "options-pricing",
    name: "Options Pricing",
    icon: "📈",
    description: "Black-Scholes, Greeks, volatility",
    color: "#22c55e",
  },
  {
    id: "brain-teasers",
    name: "Brain Teasers",
    icon: "🧠",
    description: "Mental math, logic puzzles, estimation",
    color: "#f59e0b",
  },
  {
    id: "linear-algebra",
    name: "Linear Algebra",
    icon: "🔢",
    description: "Matrices, eigenvalues, decompositions",
    color: "#ef4444",
  },
];
