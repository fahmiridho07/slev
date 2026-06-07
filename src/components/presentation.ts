import { Ionicons } from "@expo/vector-icons";
import { SpendingContext, SpendingPattern } from "../features/spendingMemory.types";
import { lightColors } from "../theme/palettes";
import { componentStyles as defaultComponentStyles } from "../theme/styles/components";
import type { ColorTokens } from "../theme/types";

export function contextIcon(context: SpendingContext): keyof typeof Ionicons.glyphMap {
  if (context === "Meal") return "restaurant-outline";
  if (context === "Coffee") return "cafe-outline";
  if (context === "Transport") return "car-outline";
  if (context === "Groceries") return "basket-outline";
  if (context === "Bills") return "receipt-outline";
  if (context === "Treat") return "sparkles-outline";
  if (context === "Home") return "home-outline";
  return "ellipse-outline";
}

export function patternIcon(tone: SpendingPattern["tone"]): keyof typeof Ionicons.glyphMap {
  if (tone === "notice") return "radio-button-on-outline";
  if (tone === "warm") return "sunny-outline";
  return "leaf-outline";
}

export function patternColor(tone: SpendingPattern["tone"], colors: ColorTokens = lightColors): string {
  if (tone === "notice") return colors.blue;
  if (tone === "warm") return colors.amber;
  return colors.greenDark;
}

export function getPatternToneStyle(
  tone: SpendingPattern["tone"],
  styles = defaultComponentStyles
) {
  if (tone === "notice") return styles.patternNotice;
  if (tone === "warm") return styles.patternWarm;
  return styles.patternCalm;
}