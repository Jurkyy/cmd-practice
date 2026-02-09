import { TopicGuide } from "../types";

export const topicGuides: TopicGuide[] = [
  // ═══════════════════════════════════════════════════════════════
  //  PROBABILITY
  // ═══════════════════════════════════════════════════════════════
  {
    category: "probability",
    title: "Probability Essentials",
    icon: "🎲",
    overview:
      "Master the fundamentals of probability theory — from counting techniques and conditional probability to key distributions and limit theorems. These concepts are the bedrock of every quant interview.",
    sections: [
      {
        title: "Counting & Combinatorics",
        content:
          "Most probability problems start with counting. The multiplication principle, permutations (n!), and combinations (n choose k) are your bread and butter. For harder problems, inclusion-exclusion and the stars-and-bars technique unlock complex counting arguments.",
        keyFormulas: [
          "C(n,k) = n! / (k!(n-k)!)",
          "Inclusion-exclusion: P(A∪B) = P(A) + P(B) − P(A∩B)",
          "Derangements: D(n) = n! × Σ(−1)^k/k! for k=0..n",
        ],
        tips: [
          "When counting, always check: order matters? replacement?",
          "For \"at least one\" problems, use complement: 1 − P(none)",
          "Derangement fraction → 1/e ≈ 0.368 for large n",
        ],
      },
      {
        title: "Conditional Probability & Bayes",
        content:
          "Bayes' theorem is arguably the single most important formula in quant finance interviews. The base rate fallacy (ignoring the prior) is a classic trap. Always set up the full Bayesian calculation before simplifying.",
        keyFormulas: [
          "P(A|B) = P(B|A)P(A) / P(B)",
          "Law of total probability: P(B) = ΣP(B|Aᵢ)P(Aᵢ)",
        ],
        tips: [
          "Draw a probability tree for multi-stage problems",
          "In medical/rare-event questions, the false positive rate dominates",
          "Check: does your answer change if you swap the conditioning?",
        ],
      },
      {
        title: "Expected Value & Variance",
        content:
          "Linearity of expectation is the most powerful trick in probability — it works even without independence. For variance, remember Var(X+Y) = Var(X) + Var(Y) + 2Cov(X,Y), which simplifies when independent.",
        keyFormulas: [
          "E[aX + bY] = aE[X] + bE[Y] (always!)",
          "Var(X) = E[X²] − (E[X])²",
          "Var(aX + b) = a²Var(X)",
          "Coupon collector: E = n × Hₙ",
        ],
        tips: [
          "Linearity of expectation doesn't need independence!",
          "For the coupon collector, think about waiting times between new types",
          "Use indicator variables to break complex expectations into simple sums",
        ],
      },
      {
        title: "Key Distributions",
        content:
          "Know the Bernoulli, Binomial, Geometric, Poisson, Uniform, Exponential, and Normal distributions cold. Understand their means, variances, and when each arises naturally.",
        keyFormulas: [
          "Geometric: E[X] = 1/p, Var = (1-p)/p²",
          "Poisson: P(X=k) = e^(-λ)λᵏ/k!, E=Var=λ",
          "Exponential: f(x) = λe^(-λx), memoryless",
          "Normal: 68-95-99.7 rule for 1σ, 2σ, 3σ",
        ],
        tips: [
          "Poisson approximates Binomial when n large, p small, np moderate",
          "Exponential is the only continuous memoryless distribution",
          "For max/min of uniforms: E[max] = n/(n+1), E[min] = 1/(n+1)",
        ],
      },
    ],
    resources: [
      {
        title: "Introduction to Probability (Blitzstein & Hwang)",
        url: "https://projects.iq.harvard.edu/stat110/home",
        type: "book",
        free: true,
      },
      {
        title: "Harvard Stat110 Lectures",
        url: "https://www.youtube.com/playlist?list=PL2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo",
        type: "video",
        free: true,
      },
      {
        title: "Fifty Challenging Problems in Probability (Mosteller)",
        url: "https://www.amazon.com/Fifty-Challenging-Problems-Probability-Solutions/dp/0486653552",
        type: "book",
      },
      {
        title: "A First Course in Probability (Sheldon Ross)",
        url: "https://www.amazon.com/First-Course-Probability-10th/dp/0134753119",
        type: "book",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  //  STATISTICS
  // ═══════════════════════════════════════════════════════════════
  {
    category: "statistics",
    title: "Statistics for Quant Finance",
    icon: "📊",
    overview:
      "Statistics bridges probability theory and real-world data. From estimation and hypothesis testing to regression and time series — these are the tools you use to make sense of noisy financial markets.",
    sections: [
      {
        title: "Estimation & MLE",
        content:
          "Maximum Likelihood Estimation (MLE) is the workhorse of parametric inference. Derive the log-likelihood, take the derivative, set to zero. For exponential families, the sufficient statistics simplify everything.",
        keyFormulas: [
          "MLE: argmax_θ Π f(xᵢ|θ) → argmax_θ Σ ln f(xᵢ|θ)",
          "Fisher information: I(θ) = −E[∂²ln f/∂θ²]",
          "Cramér-Rao: Var(θ̂) ≥ 1/I(θ)",
        ],
        tips: [
          "Always work with log-likelihood — products become sums",
          "Check second derivative is negative to confirm maximum",
          "MLE is invariant: if θ̂ is MLE of θ, then g(θ̂) is MLE of g(θ)",
        ],
      },
      {
        title: "Regression & Correlation",
        content:
          "Linear regression is everywhere in quant finance — from factor models to risk decomposition. Know OLS assumptions, R² interpretation, and what happens when assumptions break (multicollinearity, heteroskedasticity).",
        keyFormulas: [
          "β̂ = (X'X)⁻¹X'y",
          "R² = 1 − SSR/SST = ρ² (simple regression)",
          "ρ(X,Y) = Cov(X,Y) / (σ_X × σ_Y)",
        ],
        tips: [
          "R² = ρ² only in simple regression, not multiple",
          "Correlation ≠ causation (yes, really — it matters in trading)",
          "Residual diagnostics: check normality, homoskedasticity, independence",
        ],
      },
      {
        title: "Time Series",
        content:
          "Financial data is time-indexed. AR, MA, ARMA, and GARCH models capture the dynamics of returns, volatility clustering, and mean reversion. Stationarity is the fundamental requirement for most time series analysis.",
        keyFormulas: [
          "AR(1): Xₜ = ϕXₜ₋₁ + εₜ, stationary iff |ϕ| < 1",
          "Unconditional var: σ² = σ²_ε / (1−ϕ²)",
          "GARCH(1,1): σ²ₜ = ω + αε²ₜ₋₁ + βσ²ₜ₋₁",
          "GARCH persistence: α + β < 1 for finite variance",
        ],
        tips: [
          "Always test for stationarity (ADF test) before fitting models",
          "Volatility clustering is THE stylized fact of financial returns",
          "GARCH captures it; ARCH alone often needs too many lags",
        ],
      },
      {
        title: "Bayesian Methods",
        content:
          "Bayesian statistics treats parameters as random. The prior encodes beliefs before data; the posterior combines prior and likelihood. Conjugate priors keep things tractable.",
        keyFormulas: [
          "Posterior ∝ Likelihood × Prior",
          "Beta(α,β) conjugate for Bernoulli: posterior = Beta(α+s, β+f)",
          "Normal prior + Normal likelihood → Normal posterior",
        ],
        tips: [
          "Conjugate priors: Beta-Bernoulli, Gamma-Poisson, Normal-Normal",
          "With enough data, the prior washes out (Bayesian consistency)",
          "Credible intervals ≠ confidence intervals (interpretation differs!)",
        ],
      },
    ],
    resources: [
      {
        title: "All of Statistics (Larry Wasserman)",
        url: "https://www.stat.cmu.edu/~larry/all-of-statistics/",
        type: "book",
      },
      {
        title: "Statistical Inference (Casella & Berger)",
        url: "https://www.amazon.com/Statistical-Inference-George-Casella/dp/0534243126",
        type: "book",
      },
      {
        title: "Khan Academy: Statistics & Probability",
        url: "https://www.khanacademy.org/math/statistics-probability",
        type: "video",
        free: true,
      },
      {
        title: "Analysis of Financial Time Series (Ruey Tsay)",
        url: "https://www.amazon.com/Analysis-Financial-Time-Ruey-Tsay/dp/0470414359",
        type: "book",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  //  STOCHASTIC CALCULUS
  // ═══════════════════════════════════════════════════════════════
  {
    category: "stochastic-calculus",
    title: "Stochastic Calculus",
    icon: "∫",
    overview:
      "The mathematical language of continuous-time finance. Brownian motion, Itô's lemma, and measure changes form the toolkit for pricing derivatives and modeling asset dynamics.",
    sections: [
      {
        title: "Brownian Motion",
        content:
          "Standard Brownian motion W(t) is the continuous-time limit of a random walk. Its key properties: starts at 0, independent increments, Gaussian increments with variance = time elapsed, continuous but nowhere differentiable paths.",
        keyFormulas: [
          "W(t) − W(s) ~ N(0, t−s) for t > s",
          "E[W(t)] = 0, Var(W(t)) = t",
          "Cov(W(s), W(t)) = min(s,t)",
          "(dW)² = dt (quadratic variation)",
        ],
        tips: [
          "BM increments are independent, but W(t) values are NOT independent",
          "Quadratic variation [W,W](t) = t — this is why Itô calculus differs from ordinary calculus",
          "BM is a martingale; W(t)² − t is also a martingale",
        ],
      },
      {
        title: "Itô's Lemma",
        content:
          "Itô's lemma is the chain rule of stochastic calculus — with an extra second-order term because (dW)² = dt ≠ 0. This is the single most important formula in mathematical finance.",
        keyFormulas: [
          "df = (∂f/∂t)dt + (∂f/∂x)dX + ½(∂²f/∂x²)(dX)²",
          "For GBM: d(ln S) = (μ − σ²/2)dt + σdW",
          "Itô isometry: E[(∫f dW)²] = ∫f² dt",
        ],
        tips: [
          "The extra ½σ²f'' term is what makes Itô different from ordinary calculus",
          "Always remember: (dW)² = dt, (dt)² = 0, dW·dt = 0",
          "d(ln S) gives you the log-normal solution of GBM directly",
        ],
      },
      {
        title: "Girsanov & Measure Change",
        content:
          "Girsanov's theorem allows you to change probability measures so that a process with drift becomes a martingale under the new measure. This is the theoretical foundation for risk-neutral pricing.",
        keyFormulas: [
          "Under Q: W̃(t) = W(t) + ∫₀ᵗ θ(s)ds is a BM",
          "Radon-Nikodym: dQ/dP = exp(−∫θdW − ½∫θ²dt)",
          "Risk-neutral: drift μ → r (risk-free rate)",
        ],
        tips: [
          "Under Q, ALL assets earn the risk-free rate in expectation",
          "Girsanov changes drift but NOT volatility",
          "The 'market price of risk' θ = (μ−r)/σ drives the measure change",
        ],
      },
      {
        title: "SDEs & Solutions",
        content:
          "Stochastic differential equations describe continuous-time dynamics. GBM, Ornstein-Uhlenbeck, and CIR are the workhorses. Know their solutions and steady-state properties.",
        keyFormulas: [
          "GBM: S(t) = S(0)exp((μ−σ²/2)t + σW(t))",
          "OU: dX = θ(μ−X)dt + σdW → mean-reverts to μ",
          "OU variance: Var(X(∞)) = σ²/(2θ)",
          "CIR: dX = κ(θ−X)dt + σ√X dW",
        ],
        tips: [
          "GBM is log-normal — useful for stock prices (positive)",
          "OU is Gaussian — useful for rates, spreads (can go negative)",
          "CIR stays positive if 2κθ > σ² (Feller condition)",
        ],
      },
    ],
    resources: [
      {
        title: "Stochastic Calculus for Finance II (Shreve)",
        url: "https://www.amazon.com/Stochastic-Calculus-Finance-Continuous-Time-Springer/dp/0387401016",
        type: "book",
      },
      {
        title: "MIT OpenCourseWare: Stochastic Processes",
        url: "https://ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013/",
        type: "video",
        free: true,
      },
      {
        title: "Stochastic Calculus: An Introduction Through Theory & Exercises (Baldi)",
        url: "https://www.amazon.com/Stochastic-Calculus-Introduction-Through-Exercises/dp/3319622250",
        type: "book",
      },
      {
        title: "Brownian Motion and Stochastic Calculus (Karatzas & Shreve)",
        url: "https://www.amazon.com/Brownian-Motion-Stochastic-Calculus-Graduate/dp/0387976558",
        type: "book",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  //  OPTIONS PRICING
  // ═══════════════════════════════════════════════════════════════
  {
    category: "options-pricing",
    title: "Options & Derivatives Pricing",
    icon: "📈",
    overview:
      "From Black-Scholes to volatility surfaces and exotic Greeks — options pricing combines stochastic calculus, PDE theory, and market intuition. This is the heart of quantitative finance.",
    sections: [
      {
        title: "Black-Scholes Framework",
        content:
          "The BS model assumes GBM for the underlying, constant vol, constant rates, and continuous trading. Despite its limitations, it remains the lingua franca of options markets and the foundation for more complex models.",
        keyFormulas: [
          "C = SN(d₁) − Ke⁻ʳᵀN(d₂)",
          "d₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T)",
          "d₂ = d₁ − σ√T",
          "BS PDE: ∂V/∂t + ½σ²S²∂²V/∂S² + rS∂V/∂S − rV = 0",
        ],
        tips: [
          "The drift μ does NOT appear in BS formula — hedging removes it",
          "N(d₂) ≈ risk-neutral probability of finishing ITM",
          "N(d₁) = delta of the call option",
        ],
      },
      {
        title: "The Greeks",
        content:
          "Greeks measure option sensitivities. Delta (price), Gamma (convexity), Theta (time decay), Vega (volatility), and Rho (rates). Understanding their interactions is crucial for risk management.",
        keyFormulas: [
          "Δ = ∂V/∂S ≈ N(d₁) for calls",
          "Γ = ∂²V/∂S² = n(d₁)/(Sσ√T)",
          "Θ = ∂V/∂t (negative for long options)",
          "ν = ∂V/∂σ = S·n(d₁)·√T (always positive)",
          "BS relation: Θ + ½σ²S²Γ + rSΔ = rV",
        ],
        tips: [
          "ATM options: Δ ≈ 0.5, Γ maximized, Vega maximized",
          "Near expiry: Γ spikes ATM, Theta accelerates",
          "The BS PDE is literally the Greek relationship: Θ + ½σ²S²Γ + rSΔ = rV",
        ],
      },
      {
        title: "Put-Call Parity & Bounds",
        content:
          "Put-call parity is model-free — it holds by no-arbitrage alone. It's the first thing to check on any options question. Know the arbitrage bounds on European and American options.",
        keyFormulas: [
          "European: C − P = S − Ke⁻ʳᵀ",
          "American: C − P ≤ S − Ke⁻ʳᵀ (early exercise breaks equality)",
          "Call bound: max(S − Ke⁻ʳᵀ, 0) ≤ C ≤ S",
          "Put bound: max(Ke⁻ʳᵀ − S, 0) ≤ P ≤ Ke⁻ʳᵀ",
        ],
        tips: [
          "Put-call parity: Long Call + Short Put = Forward (synthetically)",
          "American calls on non-dividend stocks are never early-exercised",
          "American puts CAN be early-exercised (deep ITM, high rates)",
        ],
      },
      {
        title: "Volatility",
        content:
          "Implied volatility is what the market charges for options. The smile/skew reveals that BS's constant-vol assumption is wrong. Understanding vol surfaces, term structure, and dynamics is key to options trading.",
        keyFormulas: [
          "IV = σ such that BS(σ) = Market Price",
          "Straddle ≈ S × σ × √(T/2π) (ATM approx)",
          "Variance swap strike ≈ ∫(IV(K)²) across strikes",
          "VIX² ≈ E[realized var over 30 days]",
        ],
        tips: [
          "Equity skew: OTM puts have higher IV (crash protection)",
          "Vol of vol matters: when IV moves, your greeks change",
          "Realized vol > implied vol → long straddle profits (roughly)",
        ],
      },
    ],
    resources: [
      {
        title: "Options, Futures, and Other Derivatives (Hull)",
        url: "https://www.amazon.com/Options-Futures-Other-Derivatives-11th/dp/013693997X",
        type: "book",
      },
      {
        title: "The Concepts and Practice of Mathematical Finance (Joshi)",
        url: "https://www.amazon.com/Concepts-Practice-Mathematical-Finance-Mathematics/dp/0521514088",
        type: "book",
      },
      {
        title: "Option Volatility and Pricing (Natenberg)",
        url: "https://www.amazon.com/Option-Volatility-Pricing-Strategies-Techniques/dp/0071818774",
        type: "book",
      },
      {
        title: "Emanuel Derman's Volatility Smile lectures",
        url: "https://www.youtube.com/results?search_query=emanuel+derman+volatility+smile",
        type: "video",
        free: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  //  BRAIN TEASERS
  // ═══════════════════════════════════════════════════════════════
  {
    category: "brain-teasers",
    title: "Brain Teasers & Mental Math",
    icon: "🧠",
    overview:
      "Quant interviews love brain teasers — they test your ability to think clearly under pressure. Mental math speed, estimation skills, and logical reasoning are all fair game.",
    sections: [
      {
        title: "Mental Math Tricks",
        content:
          "Speed matters in quant interviews. Know your squares up to 25², common fractions as decimals, and shortcuts for multiplication. Practice until these are instant.",
        keyFormulas: [
          "Rule of 72: years to double ≈ 72/rate%",
          "x% of y = y% of x (commutative trick)",
          "√2 ≈ 1.414, √3 ≈ 1.732, √5 ≈ 2.236",
          "e ≈ 2.718, 1/e ≈ 0.368, ln2 ≈ 0.693",
        ],
        tips: [
          "Break multiplications: 25×16 = 25×4×4 = 100×4 = 400",
          "For fractions: 7/8 = 1 − 1/8 = 0.875",
          "Practice: all squares from 1² to 25²",
        ],
      },
      {
        title: "Fermi Estimation",
        content:
          "Fermi problems test your ability to make reasonable assumptions and break big questions into smaller, estimable pieces. The process matters more than the exact answer.",
        keyFormulas: [
          "World population ≈ 8 billion",
          "US population ≈ 330 million",
          "Hours/year ≈ 8,760 ≈ 10,000",
          "Seconds/day ≈ 86,400 ≈ 10⁵",
        ],
        tips: [
          "Always state assumptions explicitly",
          "Break into independent factors, multiply",
          "Sanity check: does the answer feel right?",
          "Aim for order-of-magnitude accuracy",
        ],
      },
      {
        title: "Classic Logic Puzzles",
        content:
          "Monty Hall, the two-envelopes paradox, prisoner lightbulb problems — know the canonical solutions and, more importantly, the reasoning. Interviewers want to see your thought process.",
        tips: [
          "Monty Hall: switching gives 2/3 — the host's action gives information",
          "Two envelopes: the paradox arises from conflating two sample spaces",
          "When stuck: try small cases first (2 prisoners, 3 doors, etc.)",
          "Draw it out — decision trees clarify everything",
        ],
      },
      {
        title: "Expected Value Games",
        content:
          "Many brain teasers reduce to computing expected values with optimal strategy. The key is knowing when to stop: compare EV of continuing vs. current value.",
        keyFormulas: [
          "Dice reroll: keep if ≥ E[roll] = 3.5, so keep 4,5,6",
          "Secretary problem: reject first n/e ≈ 37% then take first best",
          "St. Petersburg: E diverges but finite bankroll → finite value",
        ],
        tips: [
          "For optimal stopping: work backwards from the last decision",
          "Dynamic programming: what's the value of having k chances left?",
          "Always compare: E[stop now] vs E[continue]",
        ],
      },
    ],
    resources: [
      {
        title: "Heard on the Street (Timothy Crack)",
        url: "https://www.amazon.com/Heard-Street-Quantitative-Questions-Interviews/dp/0994138695",
        type: "book",
      },
      {
        title: "A Practical Guide to Quant Finance Interviews (Zhou)",
        url: "https://www.amazon.com/Practical-Guide-Quantitative-Finance-Interviews/dp/1735028800",
        type: "book",
      },
      {
        title: "Xinfeng Zhou's Green Book Problems",
        url: "https://www.youtube.com/results?search_query=quant+finance+brain+teaser+solutions",
        type: "video",
        free: true,
      },
      {
        title: "BrainStellar Puzzles",
        url: "https://brainstellar.com/",
        type: "tool",
        free: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  //  LINEAR ALGEBRA
  // ═══════════════════════════════════════════════════════════════
  {
    category: "linear-algebra",
    title: "Linear Algebra for Quants",
    icon: "🔢",
    overview:
      "Linear algebra is the backbone of portfolio theory, PCA, risk models, and numerical methods. Eigenvalues, decompositions, and positive definiteness come up constantly in quant practice.",
    sections: [
      {
        title: "Eigenvalues & Eigenvectors",
        content:
          "Eigenvalues capture the fundamental behavior of linear operators. In finance, they reveal principal risk factors (PCA), stability of dynamic systems, and the conditioning of numerical problems.",
        keyFormulas: [
          "Av = λv (definition)",
          "det(A − λI) = 0 (characteristic equation)",
          "tr(A) = Σλᵢ, det(A) = Πλᵢ",
          "Eigenvalues of A² are λ², of A⁻¹ are 1/λ",
        ],
        tips: [
          "Symmetric real matrices have real eigenvalues and orthogonal eigenvectors",
          "Trace = sum of eigenvalues = sum of diagonal (both!)",
          "Rank = number of non-zero eigenvalues",
        ],
      },
      {
        title: "Matrix Decompositions",
        content:
          "Know SVD, Cholesky, eigendecomposition, and QR. Each serves different purposes: Cholesky for correlated normal simulation, SVD for dimensionality reduction, eigen for PCA.",
        keyFormulas: [
          "SVD: A = UΣV' (any matrix)",
          "Cholesky: A = LL' (symmetric positive definite)",
          "Spectral: A = QΛQ' (symmetric → orthogonal Q)",
          "PCA: eigenvectors of covariance matrix",
        ],
        tips: [
          "Cholesky is ~2x faster than eigendecomposition for PD matrices",
          "SVD works for ANY matrix, not just square/symmetric",
          "For Monte Carlo: Cholesky of correlation matrix → correlated normals",
        ],
      },
      {
        title: "Positive Definiteness",
        content:
          "Covariance matrices must be positive semi-definite. Understanding PD/PSD is critical for portfolio optimization, risk models, and ensuring numerical stability.",
        keyFormulas: [
          "PD ⟺ all eigenvalues > 0",
          "PD ⟺ all leading minors > 0 (Sylvester)",
          "PD ⟺ x'Ax > 0 for all x ≠ 0",
          "PSD: same with ≥ instead of >",
        ],
        tips: [
          "Sample covariance with n < p is only PSD, not PD",
          "Add small ridge (λI) to make PSD → PD (regularization)",
          "Portfolio variance = w'Σw > 0 requires Σ PD",
        ],
      },
      {
        title: "Numerical Considerations",
        content:
          "In practice, you work with approximate arithmetic. Condition numbers measure sensitivity to perturbation. Ill-conditioned systems amplify rounding errors.",
        keyFormulas: [
          "Condition number: κ(A) = ||A|| × ||A⁻¹|| = λ_max/λ_min",
          "Relative error bound: ||δx||/||x|| ≤ κ(A) × ||δb||/||b||",
        ],
        tips: [
          "κ(A) >> 1 means the system is ill-conditioned",
          "Use SVD to compute pseudo-inverse for rank-deficient systems",
          "In finance: near-multicollinear factors → large κ → unstable betas",
        ],
      },
    ],
    resources: [
      {
        title: "Linear Algebra Done Right (Axler)",
        url: "https://linear.axler.net/",
        type: "book",
        free: true,
      },
      {
        title: "MIT 18.06 Linear Algebra (Gilbert Strang)",
        url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
        type: "video",
        free: true,
      },
      {
        title: "3Blue1Brown: Essence of Linear Algebra",
        url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
        type: "video",
        free: true,
      },
      {
        title: "Matrix Computations (Golub & Van Loan)",
        url: "https://www.amazon.com/Computations-Hopkins-Studies-Mathematical-Sciences/dp/1421407949",
        type: "book",
      },
    ],
  },
];
