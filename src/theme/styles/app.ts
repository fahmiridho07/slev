import { StyleSheet } from "react-native";
import { lightColors, lightShadows } from "../palettes";
import type { ColorTokens, ShadowTokens } from "../types";
import { createComponentStyles } from "./components";

export const CARD_STACK_GAP = 12;

export function createScreenStyles(colors: ColorTokens, shadows: ShadowTokens) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas
  },
  appShell: {
    flex: 1
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12
  },
  headerTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  brandMark: {
    height: 42,
    width: 42
  },
  brandName: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0
  },
  brandLine: {
    color: colors.muted,
    fontSize: 13,
    letterSpacing: 0
  },
  headerMessage: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  iconButton: {
    alignItems: "center",
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  iconButtonActive: {
    backgroundColor: colors.mint,
    borderColor: colors.green
  },
  content: {
    flex: 1
  },
  bootState: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24
  },
  bootText: {
    color: colors.muted,
    fontSize: 14,
    letterSpacing: 0
  },
  scrollContent: {
    gap: CARD_STACK_GAP,
    padding: 20,
    paddingBottom: 98
  },
  cardStack: {
    gap: CARD_STACK_GAP
  },
  capturePanel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    ...shadows.soft
  },
  pulsePanel: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_STACK_GAP
  },
  pulseItem: {
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    gap: 8,
    minHeight: 96,
    minWidth: 0,
    padding: 14
  },
  pulseItemIncome: {
    backgroundColor: colors.surfacePositive,
    borderColor: colors.borderMint
  },
  pulseItemDanger: {
    backgroundColor: colors.surfaceDanger,
    borderColor: colors.borderDanger
  },
  pulseItemSpending: {
    backgroundColor: colors.surfaceExpense,
    borderColor: colors.borderDanger
  },
  pulseItemBalance: {
    backgroundColor: colors.surfaceInfo,
    borderColor: colors.borderInfo
  },
  pulseTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  pulseIconBadge: {
    alignItems: "center",
    borderRadius: 8,
    height: 32,
    justifyContent: "center",
    width: 32
  },
  pulseIconIncome: {
    backgroundColor: colors.mint
  },
  pulseIconDanger: {
    backgroundColor: colors.iconDanger
  },
  pulseIconSpending: {
    backgroundColor: colors.iconExpense
  },
  pulseIconBalance: {
    backgroundColor: colors.iconInfo
  },
  pulseLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 16
  },
  pulseWideItem: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "100%",
    flexDirection: "row",
    gap: 10,
    padding: 14
  },
  pulseValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 23
  },
  pulseValueIncome: {
    color: colors.greenDark
  },
  pulseValueDanger: {
    color: colors.coral
  },
  pulseValueBalance: {
    color: colors.blue
  },
  pulseSavingsText: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
    lineHeight: 18
  },
  pulseHero: {
    backgroundColor: colors.mint,
    borderColor: colors.borderMint,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "100%",
    gap: 8,
    padding: 18
  },
  pulseHeroLabel: {
    color: colors.greenDark,
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  pulseHeroValue: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 40
  },
  pulseHeroHint: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  allocationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  allocationMetric: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "48%",
    flexGrow: 1,
    gap: 5,
    minHeight: 104,
    minWidth: 138,
    padding: 14
  },
  allocationValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0
  },
  kicker: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  amountRow: {
    alignItems: "center",
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 70,
    paddingBottom: 4
  },
  captureTypeBlock: {
    gap: 10
  },
  captureTypeLead: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0
  },
  captureTypeCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  captureTypeGrid: {
    flexDirection: "row",
    gap: 8
  },
  captureTypeTile: {
    alignItems: "flex-start",
    backgroundColor: colors.canvas,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    minHeight: 108,
    padding: 12
  },
  captureTypeTileActive: {
    backgroundColor: colors.surfacePositive,
    borderColor: colors.borderMint
  },
  captureTypeIconBadge: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  captureTypeIconBadgeActive: {
    backgroundColor: colors.mint,
    borderColor: colors.green
  },
  captureTypeLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  captureTypeLabelActive: {
    color: colors.greenDark
  },
  captureTypeHint: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15
  },
  captureTypeCompactRow: {
    flexDirection: "row",
    gap: 8
  },
  captureTypeCompactChip: {
    alignItems: "center",
    backgroundColor: colors.faint,
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  captureTypeCompactChipActive: {
    backgroundColor: colors.mint,
    borderColor: colors.borderMint
  },
  captureTypeCompactLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  captureTypeCompactLabelActive: {
    color: colors.greenDark,
    fontWeight: "800"
  },
  currencyPrefix: {
    color: colors.greenDark,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0
  },
  amountInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: 0,
    paddingVertical: 8
  },
  input: {
    backgroundColor: colors.faint,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 15,
    letterSpacing: 0,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  captureExpandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 40
  },
  captureExpandText: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: "700"
  },
  transferPickerBlock: {
    gap: 12
  },
  accountPickerBlock: {
    gap: 8
  },
  accountTitleRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minWidth: 0
  },
  transferTitleRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 6,
    minWidth: 0
  },
  noteInput: {
    minHeight: 64,
    textAlignVertical: "top"
  },
  suggestionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  repeatBlock: {
    gap: 8
  },
  templateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  templateChip: {
    alignItems: "stretch",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    overflow: "hidden"
  },
  templateMain: {
    gap: 2,
    minWidth: 104,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  templateRemoveButton: {
    alignItems: "center",
    borderLeftColor: colors.line,
    borderLeftWidth: 1,
    justifyContent: "center",
    minWidth: 44
  },
  repeatChip: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  repeatText: {
    color: colors.greenDark,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0
  },
  repeatAmount: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0
  },
  suggestionChip: {
    backgroundColor: colors.canvas,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  suggestionText: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: "700"
  },
  contextWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  contextWrapCompact: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  contextHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  contextDefault: {
    color: colors.muted,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right"
  },
  contextChip: {
    backgroundColor: colors.canvas,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 42,
    minWidth: "30%",
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  contextChipActive: {
    backgroundColor: colors.mint,
    borderColor: colors.green
  },
  contextChipText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0
  },
  contextChipTextActive: {
    color: colors.greenDark
  },
  contextHint: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2
  },
  addNoteButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 2
  },
  addNoteText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.greenDark,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 16
  },
  smallPrimaryButton: {
    alignItems: "center",
    backgroundColor: colors.greenDark,
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 18
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 18
  },
  secondaryButtonText: {
    color: colors.greenDark,
    fontSize: 14,
    fontWeight: "800"
  },
  secondaryInlineButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 2
  },
  observationPanel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 8
  },
  heroPanel: {
    backgroundColor: colors.mint,
    borderColor: colors.borderMint,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 18
  },
  heroPanelInfo: {
    backgroundColor: colors.surfaceInfo,
    borderColor: colors.borderInfo,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 18
  },
  heroPanelSurface: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 18
  },
  heroActionButton: {
    alignSelf: "flex-start",
    minHeight: 36,
    justifyContent: "center"
  },
  heroActionText: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: "700"
  },
  heroValue: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 34
  },
  heroHint: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  heroTitle: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 30
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0
  },
  listPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden"
  },
  listPanelContinued: {
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: -1
  },
  listPanelMiddle: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0
  },
  expenseText: {
    color: colors.coral
  },
  memoryGroup: {
    gap: 8,
    paddingTop: 4
  },
  memorySectionLead: {
    marginTop: CARD_STACK_GAP
  },
  groupTitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  editPanel: {
    backgroundColor: colors.canvas,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    gap: 10,
    padding: 14
  },
  inlineEditor: {
    backgroundColor: colors.canvas,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    gap: 10,
    marginHorizontal: -14,
    marginTop: 12,
    padding: 14
  },
  budgetRow: {
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    gap: 10,
    padding: 14
  },
  budgetHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  budgetTitleBlock: {
    flex: 1,
    gap: 4
  },
  budgetCategory: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0
  },
  budgetMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16
  },
  progressTrack: {
    backgroundColor: colors.faint,
    borderRadius: 8,
    height: 10,
    overflow: "hidden"
  },
  progressFill: {
    borderRadius: 8,
    height: 10
  },
  planSummaryRow: {
    alignItems: "center",
    backgroundColor: colors.faint,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
    paddingHorizontal: 12
  },
  accordionCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 4
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 14
  },
  patternGroup: {
    gap: CARD_STACK_GAP
  },
  patternCard: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16
  },
  recapBlock: {
    borderTopColor: colors.recapDivider,
    borderTopWidth: 1,
    gap: 10,
    marginTop: 4,
    paddingTop: 12
  },
  recapQuestion: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19
  },
  analyticsBlock: {
    gap: CARD_STACK_GAP
  },
  analyticsRow: {
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    gap: 10,
    padding: 14
  },
  analyticsRowHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  analyticsTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0
  },
  analyticsAmount: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0,
    textAlign: "right"
  },
  breakdownFill: {
    backgroundColor: colors.blue,
    borderRadius: 8,
    height: 10
  },
  chartStackTrack: {
    backgroundColor: colors.faint,
    borderRadius: 8,
    height: 18,
    overflow: "hidden"
  },
  chartStackRow: {
    flexDirection: "row",
    height: "100%",
    width: "100%"
  },
  chartStackSegment: {
    height: "100%",
    minWidth: 2
  },
  chartLegend: {
    gap: 10
  },
  chartLegendRow: {
    gap: 4
  },
  chartLegendLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  chartLegendSwatch: {
    borderRadius: 4,
    height: 10,
    width: 10
  },
  chartLegendLabel: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: "800"
  },
  chartLegendValue: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    paddingLeft: 18
  },
  trendFill: {
    backgroundColor: colors.green,
    borderRadius: 8,
    height: 10
  },
  cashflowRow: {
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    gap: 12,
    padding: 14
  },
  cashflowRowRecent: {
    backgroundColor: colors.surfacePositive
  },
  cashflowBars: {
    gap: 8
  },
  cashflowBarLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    minHeight: 24
  },
  cashflowLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    width: 56
  },
  cashflowTrack: {
    backgroundColor: colors.faint,
    borderRadius: 8,
    flex: 1,
    height: 9,
    overflow: "hidden"
  },
  incomeFill: {
    backgroundColor: colors.blue,
    borderRadius: 8,
    height: 9
  },
  expenseFill: {
    backgroundColor: colors.coral,
    borderRadius: 8,
    height: 9
  },
  cashflowAmount: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "right",
    width: 64
  },
  settingsPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden"
  },
  settingRow: {
    alignItems: "flex-start",
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 16
  },
  settingText: {
    flex: 1,
    gap: 4
  },
  settingTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0
  },
  settingCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  cardGrid: {
    gap: CARD_STACK_GAP
  },
  dangerButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: colors.borderDanger,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 14
  },
  dangerButtonText: {
    color: colors.coral,
    fontSize: 14,
    fontWeight: "800"
  },
  tabBar: {
    backgroundColor: colors.tabBar,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    gap: 6,
    left: 0,
    paddingBottom: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    position: "absolute",
    right: 0
  },
  tabItem: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    gap: 3,
    justifyContent: "center",
    minHeight: 54
  },
  tabItemActive: {
    backgroundColor: colors.mint
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0
  },
  tabLabelActive: {
    color: colors.greenDark
  },
  captureFab: {
    alignItems: "center",
    backgroundColor: colors.greenDark,
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    right: 20,
    width: 56,
    ...shadows.soft
  }
  });
}

export function createAppStyles(colors: ColorTokens, shadows: ShadowTokens) {
  const componentStyles = createComponentStyles(colors, shadows);
  const screenStyles = createScreenStyles(colors, shadows);
  return { ...componentStyles, ...screenStyles };
}

export const styles = createAppStyles(lightColors, lightShadows);
