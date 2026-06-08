import type { ColorTokens } from "../../theme/types";

export function getCategoryChartColors(colors: ColorTokens): string[] {
  return [
    colors.greenDark,
    colors.blue,
    colors.amber,
    colors.coral,
    colors.chartSage,
    colors.chartLilac,
    colors.chartSlate,
    colors.chartCopper
  ];
}