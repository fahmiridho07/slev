import { ViewStyle } from "react-native";
import { clampPercent } from "../../lib/analysis";
import type { ColorTokens } from "../types";

export function getProgressFillStyle(
  progress: number,
  colors: ColorTokens
): Pick<ViewStyle, "backgroundColor" | "width"> {
  const clampedProgress = clampPercent(progress);
  const backgroundColor = progress > 1 ? colors.coral : progress >= 0.8 ? colors.amber : colors.green;
  return {
    backgroundColor,
    width: `${Math.round(clampedProgress * 100)}%` as ViewStyle["width"]
  };
}