import { SavingsGoal } from "../features/spendingMemory.types";

export function sumSavingsGoals(goals: SavingsGoal[]) {
  return goals.reduce(
    (totals, goal) => ({
      saved: totals.saved + goal.savedAmount,
      target: totals.target + goal.targetAmount
    }),
    { saved: 0, target: 0 }
  );
}