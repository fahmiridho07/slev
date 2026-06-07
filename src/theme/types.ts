export type ColorTokens = {
  ink: string;
  muted: string;
  faint: string;
  line: string;
  surface: string;
  canvas: string;
  mint: string;
  green: string;
  greenDark: string;
  coral: string;
  amber: string;
  blue: string;
  surfacePositive: string;
  surfaceDanger: string;
  surfaceExpense: string;
  surfaceWarning: string;
  surfaceInfo: string;
  borderMint: string;
  borderDanger: string;
  borderWarning: string;
  borderInfo: string;
  iconDanger: string;
  iconExpense: string;
  iconWarning: string;
  iconInfo: string;
  sheetBackdrop: string;
  tabBar: string;
  recapDivider: string;
};

export type ShadowTokens = {
  soft: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
};

export type ColorScheme = "dark" | "light" | "system";