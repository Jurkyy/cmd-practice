import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  MathOperation,
  MathDifficulty,
  MentalMathResult,
  MATH_OPERATION_CONFIG,
  MATH_DIFFICULTY_CONFIG,
} from "../src/types";
import { useMentalMath } from "../src/hooks/useMentalMath";
import { colors, spacing, fontSize, borderRadius, shadow } from "../src/utils/theme";

type Phase = "setup" | "playing" | "results";

// Generate a random problem
function generateProblem(
  ops: MathOperation[],
  diff: MathDifficulty
): { a: number; b: number; op: MathOperation; answer: number } {
  const op = ops[Math.floor(Math.random() * ops.length)];

  let a: number, b: number, answer: number;
  const range =
    diff === "easy" ? { min: 1, max: 20 } :
    diff === "medium" ? { min: 2, max: 99 } :
    { min: 2, max: 999 };

  switch (op) {
    case "add":
      a = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      b = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      answer = a + b;
      break;
    case "subtract":
      a = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      b = Math.floor(Math.random() * (Math.min(a, range.max) - range.min + 1)) + range.min;
      // Ensure a >= b for non-negative results
      if (a < b) [a, b] = [b, a];
      answer = a - b;
      break;
    case "multiply": {
      const mRange =
        diff === "easy" ? { min: 2, max: 12 } :
        diff === "medium" ? { min: 2, max: 25 } :
        { min: 2, max: 50 };
      a = Math.floor(Math.random() * (mRange.max - mRange.min + 1)) + mRange.min;
      b = Math.floor(Math.random() * (mRange.max - mRange.min + 1)) + mRange.min;
      answer = a * b;
      break;
    }
    case "divide": {
      const dRange =
        diff === "easy" ? { min: 1, max: 12 } :
        diff === "medium" ? { min: 2, max: 20 } :
        { min: 2, max: 30 };
      b = Math.floor(Math.random() * (dRange.max - dRange.min + 1)) + dRange.min;
      answer = Math.floor(Math.random() * (dRange.max - dRange.min + 1)) + dRange.min;
      a = b * answer; // Ensure clean division
      break;
    }
  }

  return { a, b, op, answer };
}

const DURATION_OPTIONS = [60, 120, 180] as const;

export default function DrillScreen() {
  const router = useRouter();
  const { stats, saveDrillResult } = useMentalMath();

  // Setup state
  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedOps, setSelectedOps] = useState<MathOperation[]>(["add", "subtract", "multiply", "divide"]);
  const [selectedDiff, setSelectedDiff] = useState<MathDifficulty>("medium");
  const [selectedDuration, setSelectedDuration] = useState<number>(120);

  // Game state
  const [timeLeft, setTimeLeft] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [problem, setProblem] = useState<ReturnType<typeof generateProblem> | null>(null);
  const [input, setInput] = useState("");
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const inputRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Results state
  const [result, setResult] = useState<MentalMathResult | null>(null);

  const toggleOp = (op: MathOperation) => {
    setSelectedOps((prev) => {
      if (prev.includes(op)) {
        if (prev.length === 1) return prev; // Must have at least one
        return prev.filter((o) => o !== op);
      }
      return [...prev, op];
    });
  };

  const startGame = useCallback(() => {
    setPhase("playing");
    setTimeLeft(selectedDuration);
    setCorrect(0);
    setAttempted(0);
    setInput("");
    setFlash(null);
    setProblem(generateProblem(selectedOps, selectedDiff));

    // Focus input after render
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [selectedDuration, selectedOps, selectedDiff]);

  // Timer countdown
  useEffect(() => {
    if (phase !== "playing") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // End game when timer hits 0
  useEffect(() => {
    if (phase === "playing" && timeLeft === 0) {
      const finalResult: MentalMathResult = {
        correct,
        attempted,
        durationSeconds: selectedDuration,
        difficulty: selectedDiff,
        operations: selectedOps,
        date: new Date().toLocaleDateString(),
        questionsPerMinute: Math.round((correct / selectedDuration) * 60 * 10) / 10,
      };
      setResult(finalResult);
      saveDrillResult(finalResult);
      setPhase("results");
      Keyboard.dismiss();
    }
  }, [timeLeft, phase, correct, attempted, selectedDuration, selectedDiff, selectedOps, saveDrillResult]);

  const handleSubmit = useCallback(() => {
    if (!problem || !input.trim()) return;

    const userAnswer = parseFloat(input.trim());
    const isCorrect = userAnswer === problem.answer;

    setAttempted((a) => a + 1);
    if (isCorrect) {
      setCorrect((c) => c + 1);
      setFlash("correct");
    } else {
      setFlash("wrong");
    }

    // Clear flash and move to next
    setTimeout(() => {
      setFlash(null);
      setInput("");
      setProblem(generateProblem(selectedOps, selectedDiff));
      inputRef.current?.focus();
    }, 150);
  }, [problem, input, selectedOps, selectedDiff]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ─── Setup Phase ──────────────────────────────────────────
  if (phase === "setup") {
    const bestScore = stats.bestScore[selectedDiff] ?? 0;

    return (
      <View style={styles.container}>
        <View style={styles.setupContent}>
          <Text style={styles.setupTitle}>{"\u{1F9EE}"} Mental Math</Text>
          <Text style={styles.setupSub}>
            Sharpen your arithmetic speed. Top quant firms test this.
          </Text>

          {/* Operations */}
          <Text style={styles.setupLabel}>OPERATIONS</Text>
          <View style={styles.opsRow}>
            {(["add", "subtract", "multiply", "divide"] as const).map((op) => {
              const config = MATH_OPERATION_CONFIG[op];
              const selected = selectedOps.includes(op);
              return (
                <Pressable
                  key={op}
                  style={[styles.opChip, selected && styles.opChipSelected]}
                  onPress={() => toggleOp(op)}
                >
                  <Text style={[styles.opSymbol, selected && styles.opSymbolSelected]}>
                    {config.symbol}
                  </Text>
                  <Text style={[styles.opLabel, selected && styles.opLabelSelected]}>
                    {config.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Difficulty */}
          <Text style={styles.setupLabel}>DIFFICULTY</Text>
          <View style={styles.diffRow}>
            {(["easy", "medium", "hard"] as const).map((d) => {
              const config = MATH_DIFFICULTY_CONFIG[d];
              const selected = selectedDiff === d;
              return (
                <Pressable
                  key={d}
                  style={[
                    styles.diffChip,
                    selected && { backgroundColor: config.bg, borderColor: config.color },
                  ]}
                  onPress={() => setSelectedDiff(d)}
                >
                  <Text
                    style={[styles.diffChipText, selected && { color: config.color }]}
                  >
                    {config.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Duration */}
          <Text style={styles.setupLabel}>DURATION</Text>
          <View style={styles.durRow}>
            {DURATION_OPTIONS.map((dur) => {
              const selected = selectedDuration === dur;
              return (
                <Pressable
                  key={dur}
                  style={[styles.durChip, selected && styles.durChipSelected]}
                  onPress={() => setSelectedDuration(dur)}
                >
                  <Text style={[styles.durChipText, selected && styles.durChipTextSelected]}>
                    {dur}s
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Personal best */}
          {bestScore > 0 && (
            <View style={styles.bestRow}>
              <Text style={styles.bestLabel}>{"\uD83C\uDFC6"} Best ({selectedDiff})</Text>
              <Text style={styles.bestValue}>{bestScore} correct</Text>
            </View>
          )}

          {/* Start button */}
          <Pressable
            style={({ pressed }) => [styles.startButton, pressed && styles.startPressed]}
            onPress={startGame}
          >
            <Text style={styles.startText}>Start Drill</Text>
          </Pressable>

          {/* Back */}
          <Pressable style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Back to Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ─── Playing Phase ────────────────────────────────────────
  if (phase === "playing" && problem) {
    const opSymbol = MATH_OPERATION_CONFIG[problem.op].symbol;
    const progress = ((selectedDuration - timeLeft) / selectedDuration) * 100;
    const urgentTime = timeLeft <= 10;

    return (
      <View
        style={[
          styles.container,
          flash === "correct" && styles.flashCorrect,
          flash === "wrong" && styles.flashWrong,
        ]}
      >
        {/* Timer bar */}
        <View style={styles.timerBarContainer}>
          <View
            style={[
              styles.timerBar,
              {
                width: `${100 - progress}%`,
                backgroundColor: urgentTime ? colors.error : colors.primary,
              },
            ]}
          />
        </View>

        {/* Score and timer */}
        <View style={styles.gameHeader}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Correct</Text>
            <Text style={styles.scoreNum}>{correct}</Text>
          </View>
          <View style={styles.timerBox}>
            <Text style={[styles.timerText, urgentTime && styles.timerUrgent]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Accuracy</Text>
            <Text style={styles.scoreNum}>
              {attempted > 0 ? `${Math.round((correct / attempted) * 100)}%` : "\u2014"}
            </Text>
          </View>
        </View>

        {/* Problem */}
        <View style={styles.problemArea}>
          <Text style={styles.problemText}>
            {problem.a} {opSymbol} {problem.b}
          </Text>
        </View>

        {/* Input */}
        <View style={styles.inputArea}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            keyboardType="numeric"
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
            placeholder="?"
            placeholderTextColor={colors.textDim}
            autoFocus
            selectTextOnFocus
          />
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitPressed,
              !input.trim() && styles.submitDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!input.trim()}
          >
            <Text style={styles.submitText}>{"\u2192"}</Text>
          </Pressable>
        </View>

        {/* Skip */}
        <Pressable
          style={styles.skipButton}
          onPress={() => {
            setAttempted((a) => a + 1);
            setFlash("wrong");
            setTimeout(() => {
              setFlash(null);
              setInput("");
              setProblem(generateProblem(selectedOps, selectedDiff));
              inputRef.current?.focus();
            }, 150);
          }}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
    );
  }

  // ─── Results Phase ────────────────────────────────────────
  if (phase === "results" && result) {
    const accuracy = result.attempted > 0
      ? Math.round((result.correct / result.attempted) * 100)
      : 0;
    const isNewBest = result.correct >= (stats.bestScore[result.difficulty] ?? 0) && result.correct > 0;

    return (
      <View style={styles.container}>
        <View style={styles.resultsContent}>
          <Text style={styles.resultsEmoji}>
            {accuracy >= 90 ? "\uD83C\uDF1F" : accuracy >= 70 ? "\uD83D\uDD25" : accuracy >= 50 ? "\uD83D\uDCAA" : "\uD83D\uDCD6"}
          </Text>

          {isNewBest && (
            <View style={styles.newBestBadge}>
              <Text style={styles.newBestText}>{"\uD83C\uDFC6"} New Personal Best!</Text>
            </View>
          )}

          <Text style={styles.resultsScore}>{result.correct}</Text>
          <Text style={styles.resultsScoreLabel}>correct answers</Text>

          <View style={styles.resultsStats}>
            <View style={styles.resultsStat}>
              <Text style={styles.resultsStatValue}>{result.attempted}</Text>
              <Text style={styles.resultsStatLabel}>Attempted</Text>
            </View>
            <View style={styles.resultsDivider} />
            <View style={styles.resultsStat}>
              <Text style={styles.resultsStatValue}>{accuracy}%</Text>
              <Text style={styles.resultsStatLabel}>Accuracy</Text>
            </View>
            <View style={styles.resultsDivider} />
            <View style={styles.resultsStat}>
              <Text style={styles.resultsStatValue}>{result.questionsPerMinute}</Text>
              <Text style={styles.resultsStatLabel}>Q/min</Text>
            </View>
          </View>

          <View style={styles.resultsMeta}>
            <Text style={styles.resultsMetaText}>
              {MATH_DIFFICULTY_CONFIG[result.difficulty].label} {"\u00b7"} {result.durationSeconds}s {"\u00b7"}{" "}
              {result.operations.map((o) => MATH_OPERATION_CONFIG[o].symbol).join(" ")}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.startButton, pressed && styles.startPressed]}
            onPress={startGame}
          >
            <Text style={styles.startText}>Try Again</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.setupButton, pressed && { opacity: 0.7 }]}
            onPress={() => setPhase("setup")}
          >
            <Text style={styles.setupButtonText}>Change Settings</Text>
          </Pressable>

          <Pressable style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Back to Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flashCorrect: {
    backgroundColor: "rgba(52,211,153,0.08)",
  },
  flashWrong: {
    backgroundColor: "rgba(248,113,113,0.08)",
  },

  // Setup
  setupContent: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxl + 20,
    justifyContent: "center",
  },
  setupTitle: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: spacing.xs,
  },
  setupSub: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  setupLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  opsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  opChip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  opChipSelected: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  opSymbol: {
    color: colors.textDim,
    fontSize: fontSize.xl,
    fontWeight: "800",
  },
  opSymbolSelected: {
    color: colors.primaryLight,
  },
  opLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
  },
  opLabelSelected: {
    color: colors.primaryLight,
  },
  diffRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  diffChip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  diffChipText: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    fontWeight: "700",
  },
  durRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  durChip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  durChipSelected: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  durChipText: {
    color: colors.textDim,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
  durChipTextSelected: {
    color: colors.primaryLight,
  },
  bestRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bestLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  bestValue: {
    color: colors.warning,
    fontSize: fontSize.md,
    fontWeight: "800",
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  startPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  startText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  backLink: {
    alignItems: "center",
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  backLinkText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },

  // Playing
  timerBarContainer: {
    height: 4,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  timerBar: {
    height: 4,
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    paddingTop: Platform.OS === "ios" ? spacing.xxl + 10 : spacing.md,
  },
  scoreBox: {
    alignItems: "center",
    minWidth: 70,
  },
  scoreLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  scoreNum: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
    marginTop: 2,
  },
  timerBox: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerText: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  timerUrgent: {
    color: colors.error,
  },
  problemArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  problemText: {
    color: colors.text,
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: -1,
    textAlign: "center",
  },
  inputArea: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "700",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  submitPressed: {
    opacity: 0.9,
  },
  submitDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  submitText: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "800",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  skipText: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },

  // Results
  resultsContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  resultsEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  newBestBadge: {
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  newBestText: {
    color: colors.warning,
    fontSize: fontSize.sm,
    fontWeight: "700",
  },
  resultsScore: {
    color: colors.text,
    fontSize: 72,
    fontWeight: "900",
    letterSpacing: -2,
  },
  resultsScoreLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: "600",
    marginBottom: spacing.xl,
  },
  resultsStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  resultsStat: {
    flex: 1,
    alignItems: "center",
  },
  resultsStatValue: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
  },
  resultsStatLabel: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  resultsDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  resultsMeta: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  resultsMetaText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  setupButton: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: spacing.md,
    width: "100%",
  },
  setupButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
