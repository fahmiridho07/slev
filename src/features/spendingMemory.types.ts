export type SpendingContext =
  | "Meal"
  | "Coffee"
  | "Transport"
  | "Groceries"
  | "Bills"
  | "Treat"
  | "Home"
  | "Other";

export type SpendingMoment = {
  id: string;
  amount: number;
  occurredAt: string;
  label?: string;
  context: SpendingContext;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type PatternFeedbackResponse = "keep" | "less_often" | "not_sure";

export type PatternFeedback = {
  patternId: string;
  response: PatternFeedbackResponse;
  createdAt: string;
};

export type PatternGroup =
  | "Repeated lately"
  | "Stands out this week"
  | "Small spends adding up"
  | "Weekend shape";

export type SpendingPattern = {
  id: string;
  group: PatternGroup;
  title: string;
  detail: string;
  tone: "calm" | "notice" | "warm";
  recapQuestion?: string;
};
