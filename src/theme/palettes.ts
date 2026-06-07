import type { ColorTokens, ShadowTokens } from "./types";

export const lightColors: ColorTokens = {
  ink: "#18201c",
  muted: "#68736d",
  faint: "#edf1ee",
  line: "#dde5df",
  surface: "#ffffff",
  canvas: "#f7f8f4",
  mint: "#d8f2df",
  green: "#1f7a4f",
  greenDark: "#14543a",
  coral: "#f36f56",
  amber: "#f4b94f",
  blue: "#4c7d9b",
  surfacePositive: "#f2fbf4",
  surfaceDanger: "#fff1ee",
  surfaceExpense: "#fff1ee",
  surfaceWarning: "#fff8e8",
  surfaceInfo: "#eef6fa",
  borderMint: "#c3e3cc",
  borderDanger: "#f3c8c0",
  borderWarning: "#f3dfad",
  borderInfo: "#cfe3ed",
  iconDanger: "#ffe0da",
  iconExpense: "#ffe0da",
  iconWarning: "#ffe9bd",
  iconInfo: "#d9edf6",
  sheetBackdrop: "rgba(24, 32, 28, 0.36)"
};

export const darkColors: ColorTokens = {
  ink: "#e8ede9",
  muted: "#9aa8a0",
  faint: "#2a332e",
  line: "#3a4540",
  surface: "#1e2622",
  canvas: "#141a17",
  mint: "#1f3d2e",
  green: "#3dbf7a",
  greenDark: "#8ce8b0",
  coral: "#ff8a75",
  amber: "#f5c96a",
  blue: "#6ba3c4",
  surfacePositive: "#1a2e22",
  surfaceDanger: "#3a2420",
  surfaceExpense: "#3a2420",
  surfaceWarning: "#3a3220",
  surfaceInfo: "#1e2c34",
  borderMint: "#2f5a42",
  borderDanger: "#6a4038",
  borderWarning: "#6a5530",
  borderInfo: "#355568",
  iconDanger: "#4a302c",
  iconExpense: "#4a302c",
  iconWarning: "#4a3e28",
  iconInfo: "#243640",
  sheetBackdrop: "rgba(0, 0, 0, 0.55)"
};

export const lightShadows: ShadowTokens = {
  soft: {
    shadowColor: "#18201c",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2
  }
};

export const darkShadows: ShadowTokens = {
  soft: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 4
  }
};