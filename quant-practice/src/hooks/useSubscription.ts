import { useState, useEffect, useCallback, createContext, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Subscription hook — wraps RevenueCat or any IAP provider.
 *
 * For development / MVP, this uses a local flag.
 * Replace the internals with RevenueCat once App Store accounts are set up:
 *   import Purchases from 'react-native-purchases';
 *
 * Entitlement model:
 *   FREE: Limited questions, no SR, no mental math history, 1 learning path
 *   PRO:  Full question bank, SR, mental math, all paths, analytics, company filters
 */

const STORAGE_KEY = "quant-practice-subscription";

export type SubscriptionTier = "free" | "pro";

export interface SubscriptionState {
  tier: SubscriptionTier;
  trialActive: boolean;
  trialEndDate: string | null; // ISO date
  loaded: boolean;
}

const TRIAL_DURATION_DAYS = 7;

// Free tier limits
export const FREE_LIMITS = {
  questionsPerCategory: 3, // Only first 3 questions per category
  totalQuestions: 18, // 3 per category × 6 categories
  learningPaths: 1, // Only first path
  mentalMathSessions: 3, // 3 free sessions, then paywall
  hasSpacedRepetition: false,
  hasTagAnalytics: false,
  hasCompanyFilter: false,
  hasDetailedExplanations: false,
} as const;

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    tier: "free",
    trialActive: false,
    trialEndDate: null,
    loaded: false,
  });

  // Load subscription state
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Check if trial has expired
          if (parsed.trialActive && parsed.trialEndDate) {
            const endDate = new Date(parsed.trialEndDate);
            if (endDate <= new Date()) {
              // Trial expired
              const expired = {
                tier: "free" as const,
                trialActive: false,
                trialEndDate: parsed.trialEndDate,
                loaded: true,
              };
              setState(expired);
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expired));
              return;
            }
          }
          setState({ ...parsed, loaded: true });
        } else {
          setState((prev) => ({ ...prev, loaded: true }));
        }
      } catch {
        setState((prev) => ({ ...prev, loaded: true }));
      }
    })();
  }, []);

  // Start free trial
  const startTrial = useCallback(async () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + TRIAL_DURATION_DAYS);
    const newState: SubscriptionState = {
      tier: "pro",
      trialActive: true,
      trialEndDate: endDate.toISOString(),
      loaded: true,
    };
    setState(newState);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  // Upgrade to pro (called after RevenueCat purchase succeeds)
  const upgradeToPro = useCallback(async () => {
    const newState: SubscriptionState = {
      tier: "pro",
      trialActive: false,
      trialEndDate: null,
      loaded: true,
    };
    setState(newState);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  // Restore purchases (checks RevenueCat entitlements)
  const restorePurchases = useCallback(async () => {
    // TODO: Replace with RevenueCat restore
    // const customerInfo = await Purchases.restorePurchases();
    // if (customerInfo.entitlements.active['pro']) { upgradeToPro(); }
    return false;
  }, []);

  // Downgrade to free
  const downgradeToFree = useCallback(async () => {
    const newState: SubscriptionState = {
      tier: "free",
      trialActive: false,
      trialEndDate: null,
      loaded: true,
    };
    setState(newState);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  const isPro = state.tier === "pro";
  const trialDaysLeft = state.trialEndDate
    ? Math.max(0, Math.ceil((new Date(state.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    ...state,
    isPro,
    trialDaysLeft,
    startTrial,
    upgradeToPro,
    restorePurchases,
    downgradeToFree,
  };
}
