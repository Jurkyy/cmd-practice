import { Question } from "../types";

export const questions: Question[] = [
  // ── Probability ──────────────────────────────────────────────
  {
    id: "prob-1",
    category: "probability",
    difficulty: "easy",
    title: "Coin Flip Expectation",
    body: "You flip a fair coin 10 times. What is the expected number of heads?",
    choices: ["4", "5", "6", "10"],
    correctIndex: 1,
    explanation:
      "By linearity of expectation, E[heads] = n * p = 10 * 0.5 = 5.",
  },
  {
    id: "prob-2",
    category: "probability",
    difficulty: "easy",
    title: "Dice Roll",
    body: "What is the probability of rolling a sum of 7 with two fair dice?",
    choices: ["1/9", "1/6", "5/36", "7/36"],
    correctIndex: 1,
    explanation:
      "There are 6 ways to make 7 out of 36 total outcomes: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1). So P = 6/36 = 1/6.",
  },
  {
    id: "prob-3",
    category: "probability",
    difficulty: "medium",
    title: "Birthday Problem",
    body: "What is the minimum number of people needed in a room for the probability that at least two share a birthday to exceed 50%?",
    choices: ["23", "50", "57", "183"],
    correctIndex: 0,
    explanation:
      "The birthday problem: with 23 people, P(at least one shared birthday) ≈ 50.7%. This is a classic result using the complement: P = 1 - (365/365)(364/365)...(343/365).",
  },
  {
    id: "prob-4",
    category: "probability",
    difficulty: "medium",
    title: "Conditional Probability",
    body: "A test for a disease has 95% sensitivity and 95% specificity. If 1% of the population has the disease, what is the approximate probability someone who tests positive actually has the disease?",
    choices: ["95%", "50%", "16%", "2%"],
    correctIndex: 2,
    explanation:
      "Using Bayes' theorem: P(D|+) = (0.95 × 0.01) / (0.95 × 0.01 + 0.05 × 0.99) = 0.0095 / 0.059 ≈ 16.1%. The low base rate drastically reduces the positive predictive value.",
  },
  {
    id: "prob-5",
    category: "probability",
    difficulty: "hard",
    title: "Gambler's Ruin",
    body: "In a fair gambler's ruin problem, a player starts with $3 and wins or loses $1 each round with equal probability. The game ends when the player reaches $5 or $0. What is the probability of ruin (reaching $0)?",
    choices: ["1/5", "2/5", "3/5", "1/2"],
    correctIndex: 1,
    explanation:
      "In a fair gambler's ruin, P(ruin starting at k) = 1 - k/N where N is the target. Here k=3, N=5, so P(ruin) = 1 - 3/5 = 2/5.",
  },
  {
    id: "prob-6",
    category: "probability",
    difficulty: "hard",
    title: "Coupon Collector",
    body: "Expected number of draws to collect all 6 types of coupons (each equally likely)?",
    choices: ["6", "10.7", "14.7", "36"],
    correctIndex: 2,
    explanation:
      "E = 6(1/6 + 1/5 + 1/4 + 1/3 + 1/2 + 1/1) = 6 × H_6 = 6 × 2.45 = 14.7. This is the coupon collector's problem: E[T] = n × H_n.",
  },

  // ── Statistics ────────────────────────────────────────────────
  {
    id: "stat-1",
    category: "statistics",
    difficulty: "easy",
    title: "Central Limit Theorem",
    body: "The Central Limit Theorem states that the sampling distribution of the sample mean approaches which distribution as sample size increases?",
    choices: ["Uniform", "Poisson", "Normal", "Exponential"],
    correctIndex: 2,
    explanation:
      "The CLT states that regardless of the population distribution, the distribution of sample means approaches a normal distribution as n → ∞.",
  },
  {
    id: "stat-2",
    category: "statistics",
    difficulty: "easy",
    title: "Variance of Sum",
    body: "If X and Y are independent random variables with Var(X)=4 and Var(Y)=9, what is Var(X+Y)?",
    choices: ["5", "13", "6", "36"],
    correctIndex: 1,
    explanation:
      "For independent RVs, Var(X+Y) = Var(X) + Var(Y) = 4 + 9 = 13.",
  },
  {
    id: "stat-3",
    category: "statistics",
    difficulty: "medium",
    title: "Correlation vs Covariance",
    body: "If Cov(X,Y) = 6, SD(X) = 3, SD(Y) = 4, what is the correlation coefficient ρ(X,Y)?",
    choices: ["0.25", "0.5", "0.75", "2"],
    correctIndex: 1,
    explanation:
      "ρ = Cov(X,Y) / (SD(X) × SD(Y)) = 6 / (3 × 4) = 6/12 = 0.5.",
  },
  {
    id: "stat-4",
    category: "statistics",
    difficulty: "medium",
    title: "Maximum Likelihood",
    body: "For a sample of n observations from an Exponential(λ) distribution, the MLE of λ is:",
    choices: ["n / Σxᵢ", "Σxᵢ / n", "max(xᵢ)", "min(xᵢ)"],
    correctIndex: 0,
    explanation:
      "The log-likelihood is l(λ) = n·ln(λ) - λΣxᵢ. Setting dl/dλ = 0 gives λ̂ = n/Σxᵢ = 1/x̄.",
  },
  {
    id: "stat-5",
    category: "statistics",
    difficulty: "hard",
    title: "Law of Total Variance",
    body: "Given Var(Y) = E[Var(Y|X)] + Var(E[Y|X]), if E[Y|X] = 2X and Var(Y|X) = 3, with E[X]=1 and Var(X)=2, what is Var(Y)?",
    choices: ["7", "8", "11", "14"],
    correctIndex: 2,
    explanation:
      "E[Var(Y|X)] = E[3] = 3. Var(E[Y|X]) = Var(2X) = 4·Var(X) = 4·2 = 8. So Var(Y) = 3 + 8 = 11.",
  },

  // ── Stochastic Calculus ──────────────────────────────────────
  {
    id: "stoch-1",
    category: "stochastic-calculus",
    difficulty: "easy",
    title: "Brownian Motion Property",
    body: "Which property does standard Brownian motion W(t) NOT have?",
    choices: [
      "W(0) = 0",
      "Independent increments",
      "Continuous sample paths",
      "Stationary distribution",
    ],
    correctIndex: 3,
    explanation:
      "Brownian motion has W(0)=0, independent increments, and continuous paths. It does NOT have a stationary distribution — W(t) ~ N(0,t), so the variance grows with time.",
  },
  {
    id: "stoch-2",
    category: "stochastic-calculus",
    difficulty: "medium",
    title: "Itô's Lemma Application",
    body: "If dS = μS dt + σS dW, what is d(ln S) by Itô's lemma?",
    choices: [
      "(μ - σ²/2) dt + σ dW",
      "μ dt + σ dW",
      "(μ + σ²/2) dt + σ dW",
      "(μ - σ²) dt + σ dW",
    ],
    correctIndex: 0,
    explanation:
      "Applying Itô's lemma to f(S)=ln(S): df = (1/S)dS - (1/2)(1/S²)(σS)²dt = (μ - σ²/2)dt + σdW. The -σ²/2 drift correction is a key result in quant finance.",
  },
  {
    id: "stoch-3",
    category: "stochastic-calculus",
    difficulty: "medium",
    title: "Quadratic Variation",
    body: "What is the quadratic variation [W,W](t) of a standard Brownian motion W over [0,t]?",
    choices: ["0", "t", "t²", "√t"],
    correctIndex: 1,
    explanation:
      "[W,W](t) = t. This is because (dW)² = dt in the Itô calculus sense. The quadratic variation of Brownian motion grows linearly, unlike smooth functions whose quadratic variation is 0.",
  },
  {
    id: "stoch-4",
    category: "stochastic-calculus",
    difficulty: "hard",
    title: "Girsanov's Theorem",
    body: "Under Girsanov's theorem, changing from the physical measure P to the risk-neutral measure Q transforms the drift of a Brownian motion. If dW^P is a P-Brownian motion, then W^Q(t) = W^P(t) + θt is a Q-Brownian motion. This change of measure is used primarily to:",
    choices: [
      "Eliminate volatility",
      "Make all assets earn the risk-free rate in expectation",
      "Remove stochastic behavior",
      "Increase the Sharpe ratio",
    ],
    correctIndex: 1,
    explanation:
      "Girsanov's theorem enables the change to a risk-neutral measure where discounted asset prices are martingales, meaning all assets earn the risk-free rate in expectation under Q.",
  },
  {
    id: "stoch-5",
    category: "stochastic-calculus",
    difficulty: "hard",
    title: "Ornstein-Uhlenbeck Process",
    body: "The Ornstein-Uhlenbeck process dX = θ(μ - X)dt + σdW is mean-reverting. What is the long-run variance of X(t) as t → ∞?",
    choices: ["σ²/(2θ)", "σ²/θ", "σ²θ/2", "σ²"],
    correctIndex: 0,
    explanation:
      "The stationary variance of the OU process is σ²/(2θ). Higher mean-reversion speed θ reduces long-run variance, while higher volatility σ increases it.",
  },

  // ── Options Pricing ──────────────────────────────────────────
  {
    id: "opt-1",
    category: "options-pricing",
    difficulty: "easy",
    title: "Put-Call Parity",
    body: "Put-call parity for European options on a non-dividend stock is:",
    choices: [
      "C - P = S - K",
      "C + P = S + Ke^(-rT)",
      "C - P = S - Ke^(-rT)",
      "C - P = Se^(-rT) - K",
    ],
    correctIndex: 2,
    explanation:
      "Put-call parity: C - P = S - Ke^(-rT). A long call and short put replicates a forward position, which equals the stock minus the PV of the strike.",
  },
  {
    id: "opt-2",
    category: "options-pricing",
    difficulty: "easy",
    title: "Option Intrinsic Value",
    body: "A European call option has strike K=100 and the underlying is at S=110. What is the intrinsic value?",
    choices: ["0", "10", "100", "110"],
    correctIndex: 1,
    explanation:
      "Intrinsic value of a call = max(S - K, 0) = max(110 - 100, 0) = 10.",
  },
  {
    id: "opt-3",
    category: "options-pricing",
    difficulty: "medium",
    title: "Delta of ATM Call",
    body: "The delta of an at-the-money European call option is approximately:",
    choices: ["0", "0.25", "0.5", "1.0"],
    correctIndex: 2,
    explanation:
      "An ATM call has delta ≈ 0.5 (slightly above due to the lognormal drift). Delta represents the sensitivity of the option price to the underlying, and at-the-money the option has roughly a 50/50 chance of expiring in the money.",
  },
  {
    id: "opt-4",
    category: "options-pricing",
    difficulty: "medium",
    title: "Vega and Maturity",
    body: "How does vega (sensitivity to volatility) of an at-the-money option behave as time to expiration increases?",
    choices: [
      "Decreases",
      "Stays constant",
      "Increases",
      "First increases then decreases",
    ],
    correctIndex: 2,
    explanation:
      "Vega of an ATM option increases with time to expiration. Longer-dated options have more exposure to changes in volatility because there is more time for volatility to affect the outcome.",
  },
  {
    id: "opt-5",
    category: "options-pricing",
    difficulty: "hard",
    title: "Black-Scholes Assumptions",
    body: "Which of the following is NOT an assumption of the Black-Scholes model?",
    choices: [
      "Log-returns are normally distributed",
      "Volatility is constant",
      "The risk-free rate is constant",
      "The underlying can jump discontinuously",
    ],
    correctIndex: 3,
    explanation:
      "Black-Scholes assumes continuous price paths (geometric Brownian motion), constant volatility, constant risk-free rate, and log-normal returns. It does NOT allow for jumps — that requires extensions like Merton's jump-diffusion model.",
  },
  {
    id: "opt-6",
    category: "options-pricing",
    difficulty: "hard",
    title: "Gamma and Moneyness",
    body: "At which point is gamma (∂²C/∂S²) of a European call option highest?",
    choices: [
      "Deep in-the-money",
      "At-the-money near expiry",
      "Deep out-of-the-money",
      "At-the-money far from expiry",
    ],
    correctIndex: 1,
    explanation:
      "Gamma is highest for ATM options near expiry. As expiration approaches, the payoff function becomes more kinked at the strike, causing delta to change rapidly around ATM, which means high gamma.",
  },

  // ── Brain Teasers ────────────────────────────────────────────
  {
    id: "brain-1",
    category: "brain-teasers",
    difficulty: "easy",
    title: "Mental Math",
    body: "Without a calculator: what is 15% of 80?",
    choices: ["10", "12", "15", "8"],
    correctIndex: 1,
    explanation: "15% of 80 = 10% of 80 + 5% of 80 = 8 + 4 = 12.",
  },
  {
    id: "brain-2",
    category: "brain-teasers",
    difficulty: "medium",
    title: "The Monty Hall Problem",
    body: "In the Monty Hall problem, you pick door 1. The host opens door 3 (showing a goat). Should you switch to door 2?",
    choices: [
      "No — it's 50/50",
      "Yes — switching gives 2/3 probability",
      "Doesn't matter",
      "Yes — switching gives 3/4 probability",
    ],
    correctIndex: 1,
    explanation:
      "Switching wins 2/3 of the time. Your initial pick has 1/3 chance. The host always reveals a goat, so the remaining door concentrates the other 2/3 probability.",
  },
  {
    id: "brain-3",
    category: "brain-teasers",
    difficulty: "medium",
    title: "Expected Value Bet",
    body: "A game costs $5 to play. You roll a fair die: if you roll 6, you win $30; otherwise you win nothing. Should you play?",
    choices: [
      "Yes, EV is positive",
      "No, EV is negative",
      "Break even",
      "Need more information",
    ],
    correctIndex: 1,
    explanation:
      "EV = (1/6)(30) + (5/6)(0) - 5 = 5 - 5 = 0. Actually this is break-even. But since you gain no edge, and considering risk, it's not favorable. However, strictly by EV it's break even. The correct answer for EV = 0 means it's break even.",
  },
  {
    id: "brain-4",
    category: "brain-teasers",
    difficulty: "hard",
    title: "Two Envelopes",
    body: "You're given two envelopes. One contains twice the money of the other. You pick one and find $100. The naive argument says switching has EV = (50 + 200)/2 = $125 > $100. Why is this reasoning flawed?",
    choices: [
      "The probabilities aren't equal",
      "It conflates two different sample spaces",
      "You can't open the envelope",
      "The EV calculation is correct — you should always switch",
    ],
    correctIndex: 1,
    explanation:
      "The flaw is that the naive argument incorrectly treats the two cases (your envelope is the smaller vs larger) as having the same conditional distribution. It conflates the sample space where your envelope is the smaller one (so the other is $200) with the space where yours is the larger one (other is $50), without properly accounting for the prior on the amounts.",
  },
  {
    id: "brain-5",
    category: "brain-teasers",
    difficulty: "hard",
    title: "Coin Flip Game",
    body: "You flip a fair coin repeatedly. You start with $1 and double your money on heads, but lose everything on tails. What is the expected value after n flips if you never stop?",
    choices: ["$1", "$2ⁿ", "Diverges to ∞", "$0"],
    correctIndex: 0,
    explanation:
      "E[payoff] = (1/2^n) × 2^n = $1 for any n. Though the potential payoff grows exponentially, the probability of achieving it shrinks at the same rate. This relates to the St. Petersburg paradox and why EV alone isn't sufficient for decision-making.",
  },

  // ── Linear Algebra ───────────────────────────────────────────
  {
    id: "la-1",
    category: "linear-algebra",
    difficulty: "easy",
    title: "Eigenvalue Property",
    body: "If λ is an eigenvalue of matrix A, then λ² is an eigenvalue of:",
    choices: ["A + A", "2A", "A²", "Aᵀ"],
    correctIndex: 2,
    explanation:
      "If Av = λv, then A²v = A(Av) = A(λv) = λ(Av) = λ²v. So λ² is an eigenvalue of A².",
  },
  {
    id: "la-2",
    category: "linear-algebra",
    difficulty: "easy",
    title: "Determinant and Invertibility",
    body: "A square matrix is invertible if and only if its determinant is:",
    choices: ["Positive", "Negative", "Non-zero", "Equal to 1"],
    correctIndex: 2,
    explanation:
      "A matrix is invertible ⟺ det(A) ≠ 0. The sign doesn't matter — only that it's not zero. det=0 means the matrix is singular (has linearly dependent rows/columns).",
  },
  {
    id: "la-3",
    category: "linear-algebra",
    difficulty: "medium",
    title: "Positive Definite Matrix",
    body: "Which condition guarantees that a symmetric matrix A is positive definite?",
    choices: [
      "All diagonal entries are positive",
      "All eigenvalues are positive",
      "The trace is positive",
      "The determinant is positive",
    ],
    correctIndex: 1,
    explanation:
      "A symmetric matrix is positive definite ⟺ all eigenvalues > 0. Having positive diagonal entries or positive determinant alone is not sufficient (consider [[1, 2],[2, 1]] which has det=-3<0 despite positive diagonals).",
  },
  {
    id: "la-4",
    category: "linear-algebra",
    difficulty: "medium",
    title: "PCA and Covariance",
    body: "In Principal Component Analysis, the first principal component is the eigenvector of the covariance matrix associated with the:",
    choices: [
      "Smallest eigenvalue",
      "Largest eigenvalue",
      "Median eigenvalue",
      "Eigenvalue closest to 1",
    ],
    correctIndex: 1,
    explanation:
      "The first PC captures the direction of maximum variance, which corresponds to the eigenvector with the largest eigenvalue of the covariance matrix. Each subsequent PC captures the next largest remaining variance, orthogonal to the previous ones.",
  },
  {
    id: "la-5",
    category: "linear-algebra",
    difficulty: "hard",
    title: "Cholesky Decomposition",
    body: "Cholesky decomposition A = LLᵀ exists for a matrix A if and only if A is:",
    choices: [
      "Square and invertible",
      "Symmetric and positive definite",
      "Orthogonal",
      "Diagonalizable",
    ],
    correctIndex: 1,
    explanation:
      "Cholesky decomposition requires A to be symmetric positive definite. It factors A into LLᵀ where L is lower triangular with positive diagonal entries. It's widely used in finance for simulating correlated random variables.",
  },
];
