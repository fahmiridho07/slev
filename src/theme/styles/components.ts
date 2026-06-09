import { StyleSheet } from "react-native";
import type { ColorTokens, ShadowTokens } from "../types";

export const SWIPE_DELETE_ACTION_WIDTH = 84;

export function createComponentStyles(colors: ColorTokens, shadows: ShadowTokens) {
  return StyleSheet.create({
  segmentedControl: {
    backgroundColor: colors.faint,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: "100%"
  },
  segmentedControlCompact: {
    alignSelf: "flex-start",
    maxWidth: "100%"
  },
  segmentedControlContent: {
    flexDirection: "row",
    gap: 3,
    padding: 4
  },
  swipeRowShell: {
    backgroundColor: colors.surface,
    overflow: "hidden",
    position: "relative"
  },
  swipeActionBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.coral,
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  swipeDeleteButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: colors.coral,
    gap: 3,
    justifyContent: "center",
    width: SWIPE_DELETE_ACTION_WIDTH
  },
  swipeDeleteText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0
  },
  swipeForeground: {
    backgroundColor: colors.surface
  },
  confirmBackdrop: {
    alignItems: "center",
    backgroundColor: colors.sheetBackdrop,
    flex: 1,
    justifyContent: "center",
    padding: 24
  },
  confirmCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    maxWidth: 360,
    padding: 18,
    width: "100%",
    ...shadows.soft
  },
  confirmIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceDanger,
    borderColor: colors.borderDanger,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  confirmTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 24
  },
  confirmBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  confirmActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 4
  },
  confirmCancelButton: {
    alignItems: "center",
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 16
  },
  confirmDeleteButton: {
    alignItems: "center",
    backgroundColor: colors.coral,
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 18
  },
  confirmDeleteText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0
  },
  secondaryButtonText: {
    color: colors.greenDark,
    fontSize: 14,
    fontWeight: "800"
  },
  accountPickerBlock: {
    gap: 8
  },
  microLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  accountChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  accountChip: {
    alignItems: "center",
    backgroundColor: colors.canvas,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 10
  },
  accountChipActive: {
    backgroundColor: colors.mint,
    borderColor: colors.green
  },
  chipDragging: {
    borderColor: colors.greenDark,
    opacity: 0.92,
    shadowColor: colors.ink,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8
  },
  chipDropTarget: {
    backgroundColor: colors.mint,
    borderColor: colors.greenDark
  },
  accountChipText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0
  },
  accountChipTextActive: {
    color: colors.greenDark
  },
  accountMark: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32
  },
  accountMarkSmall: {
    borderRadius: 6,
    height: 24,
    width: 24
  },
  accountMarkText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 13,
    textAlign: "center"
  },
  accountMarkTextSmall: {
    fontSize: 9,
    lineHeight: 11
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
  analyticsTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0
  },
  contextPickerBlock: {
    gap: 8
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
  contextChip: {
    alignItems: "center",
    backgroundColor: colors.canvas,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: "31.5%"
  },
  contextChipCompact: {
    minHeight: 36,
    paddingHorizontal: 8,
    paddingVertical: 8
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
  contextHintBox: {
    justifyContent: "center",
    minHeight: 34
  },
  contextHint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  },
  segmentedControlStretch: {
    alignSelf: "stretch",
    width: "100%"
  },
  segmentedControlContentStretch: {
    alignItems: "stretch",
    flex: 1,
    width: "100%"
  },
  screenTabBar: {
    flexDirection: "row",
    gap: 8,
    width: "100%"
  },
  screenTabBarWrap: {
    flexWrap: "wrap"
  },
  screenTabItem: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    justifyContent: "center",
    minHeight: 64,
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 10
  },
  screenTabItemWrap: {
    flex: 0,
    flexBasis: "31%",
    flexGrow: 1,
    maxWidth: "33%"
  },
  screenTabItemWrapWide: {
    flexBasis: "48%",
    maxWidth: "50%"
  },
  screenTabItemActive: {
    backgroundColor: colors.mint,
    borderColor: colors.borderMint
  },
  screenTabLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    textAlign: "center"
  },
  screenTabLabelActive: {
    color: colors.greenDark,
    fontWeight: "800"
  },
  choiceChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  choiceChipWrapCompact: {
    alignSelf: "flex-start"
  },
  choiceChip: {
    alignItems: "center",
    backgroundColor: colors.faint,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  choiceChipStretch: {
    borderRadius: 8,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8
  },
  choiceChipTextStretch: {
    fontSize: 12,
    lineHeight: 16
  },
  choiceChipActive: {
    backgroundColor: colors.mint,
    borderColor: colors.borderMint
  },
  choiceChipText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center"
  },
  choiceChipTextActive: {
    color: colors.greenDark,
    fontWeight: "800"
  },
  observationPanel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 8
  },
  patternCalm: {
    backgroundColor: colors.surface,
    borderColor: colors.line
  },
  patternNotice: {
    backgroundColor: colors.surfaceInfo,
    borderColor: colors.borderInfo
  },
  patternWarm: {
    backgroundColor: colors.surfaceWarning,
    borderColor: colors.borderWarning
  },
  patternTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  patternTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 22
  },
  patternDetail: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  feedbackRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  feedbackButton: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  feedbackButtonActive: {
    backgroundColor: colors.greenDark,
    borderColor: colors.greenDark
  },
  feedbackButtonDisabled: {
    opacity: 0.45
  },
  feedbackText: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: "700"
  },
  feedbackTextActive: {
    color: colors.surface
  },
  momentRow: {
    alignItems: "center",
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 68,
    padding: 14
  },
  momentRowLast: {
    borderBottomWidth: 0
  },
  momentIcon: {
    alignItems: "center",
    backgroundColor: colors.mint,
    borderRadius: 8,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  incomeMomentIcon: {
    backgroundColor: colors.surfaceInfo
  },
  momentText: {
    flex: 1,
    gap: 3
  },
  momentTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0
  },
  momentMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16
  },
  repeatHint: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16
  },
  momentAmount: {
    color: colors.greenDark,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0
  },
  incomeText: {
    color: colors.blue
  },
  sectionHeaderBlock: {
    paddingBottom: 2,
    paddingHorizontal: 2,
    paddingTop: 2
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    justifyContent: "center",
    minHeight: 112,
    padding: 18
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center"
  },
  emptyActionButton: {
    alignItems: "center",
    borderColor: colors.green,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  emptyActionText: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0
  },
  listActionPressable: {
    width: "100%"
  },
  textButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    minHeight: 44
  },
  textButtonLabel: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: "700"
  },
  deleteText: {
    color: colors.coral
  },
  fieldErrorText: {
    color: colors.coral,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4
  },
  editActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end"
  },
  onboardingTip: {
    backgroundColor: colors.surfaceInfo,
    borderColor: colors.borderInfo,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 14
  },
  onboardingTipTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  onboardingTipTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19
  },
  onboardingTipBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  onboardingTipAction: {
    alignSelf: "flex-start",
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 2
  },
  onboardingTipActionText: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: "700"
  },
  sheetRoot: {
    flex: 1,
    justifyContent: "flex-end"
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.sheetBackdrop
  },
  sheetBackdropPressable: {
    ...StyleSheet.absoluteFillObject
  },
  sheetKeyboard: {
    justifyContent: "flex-end",
    maxWidth: "100%",
    width: "100%"
  },
  sheetCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    gap: 12,
    maxHeight: "88%",
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingTop: 10,
    ...shadows.soft
  },
  sheetForm: {
    flexShrink: 1,
    minHeight: 0
  },
  sheetScroll: {
    flexShrink: 1
  },
  sheetFooter: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 12
  },
  purchaseSheet: {
    flexGrow: 1,
    gap: 14,
    paddingBottom: 8
  },
  purchaseSheetCard: {
    height: "46%",
    maxHeight: 500,
    minHeight: 360
  },
  purchaseSheetForm: {
    flex: 1,
    minHeight: 0
  },
  purchaseSheetScroll: {
    flex: 1
  },
  purchaseAmountField: {
    alignItems: "center",
    backgroundColor: colors.faint,
    borderColor: colors.borderMint,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  purchaseAmountPrefix: {
    color: colors.muted,
    fontSize: 22,
    fontWeight: "800"
  },
  purchaseAmountInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    padding: 0
  },
  purchaseVerdict: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 14
  },
  purchaseVerdictHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  purchaseVerdictIconBadge: {
    alignItems: "center",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  purchaseVerdictStatus: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  purchaseVerdictStatusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase"
  },
  purchaseVerdictBody: {
    gap: 4
  },
  purchaseVerdictHeadline: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20
  },
  purchaseVerdictNeutral: {
    backgroundColor: colors.faint,
    borderColor: colors.line
  },
  purchaseVerdictComfortable: {
    backgroundColor: colors.surfacePositive,
    borderColor: colors.borderMint
  },
  purchaseVerdictSafe: {
    backgroundColor: colors.mint,
    borderColor: colors.borderMint
  },
  purchaseVerdictWarn: {
    backgroundColor: colors.surfaceWarning,
    borderColor: colors.borderWarning
  },
  purchaseVerdictDanger: {
    backgroundColor: colors.surfaceDanger,
    borderColor: colors.borderDanger
  },
  purchaseVerdictCaution: {
    backgroundColor: colors.surfaceInfo,
    borderColor: colors.borderInfo
  },
  purchaseVerdictIconNeutral: {
    backgroundColor: colors.faint
  },
  purchaseVerdictIconComfortable: {
    backgroundColor: colors.surfacePositive
  },
  purchaseVerdictIconSafe: {
    backgroundColor: colors.surfacePositive
  },
  purchaseVerdictIconWarn: {
    backgroundColor: colors.iconWarning
  },
  purchaseVerdictIconCaution: {
    backgroundColor: colors.iconInfo
  },
  purchaseVerdictIconDanger: {
    backgroundColor: colors.iconDanger
  },
  purchaseVerdictStatusNeutral: {
    backgroundColor: colors.surface,
    borderColor: colors.line
  },
  purchaseVerdictStatusComfortable: {
    backgroundColor: colors.surface,
    borderColor: colors.borderMint
  },
  purchaseVerdictStatusSafe: {
    backgroundColor: colors.surface,
    borderColor: colors.borderMint
  },
  purchaseVerdictStatusWarn: {
    backgroundColor: colors.surface,
    borderColor: colors.borderWarning
  },
  purchaseVerdictStatusCaution: {
    backgroundColor: colors.surface,
    borderColor: colors.borderInfo
  },
  purchaseVerdictStatusDanger: {
    backgroundColor: colors.surface,
    borderColor: colors.borderDanger
  },
  purchaseVerdictDetail: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18
  },
  purchaseVerdictContextBox: {
    alignItems: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  purchaseVerdictContextNeutral: {
    backgroundColor: colors.surface,
    borderColor: colors.line
  },
  purchaseVerdictContextComfortable: {
    backgroundColor: colors.surface,
    borderColor: colors.borderMint
  },
  purchaseVerdictContextSafe: {
    backgroundColor: colors.surface,
    borderColor: colors.borderMint
  },
  purchaseVerdictContextWarn: {
    backgroundColor: colors.surface,
    borderColor: colors.borderWarning
  },
  purchaseVerdictContextCaution: {
    backgroundColor: colors.surface,
    borderColor: colors.borderInfo
  },
  purchaseVerdictContextDanger: {
    backgroundColor: colors.surface,
    borderColor: colors.borderDanger
  },
  purchaseVerdictContextText: {
    color: colors.ink,
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18
  },
  purchaseVerdictFootnoteRow: {
    alignItems: "flex-start",
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  purchaseVerdictFootnoteNeutral: {
    backgroundColor: colors.faint
  },
  purchaseVerdictFootnoteInfo: {
    backgroundColor: colors.surfaceInfo
  },
  purchaseVerdictFootnoteDanger: {
    backgroundColor: colors.surfaceDanger
  },
  purchaseVerdictFootnoteText: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16
  },
  purchaseMeterBlock: {
    gap: 8
  },
  purchaseMeterLabels: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  purchaseMeterLabelCol: {
    gap: 2
  },
  purchaseMeterLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase"
  },
  purchaseMeterValue: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  purchaseLogButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderMint,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14
  },
  purchaseSheetContext: {
    alignItems: "center",
    backgroundColor: colors.faint,
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  purchaseSheetContextText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16
  },
  purchaseMeterTrack: {
    backgroundColor: colors.line,
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
    width: "100%"
  },
  purchaseMeterFill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    height: 8
  },
  purchaseContext: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center"
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: colors.line,
    borderRadius: 999,
    height: 4,
    marginBottom: 4,
    width: 40
  },
  sheetTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "700"
  },
  numberPadAccessoryBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  numberPadAccessoryDoneButton: {
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 8
  },
  numberPadAccessoryDoneText: {
    color: colors.greenDark,
    fontSize: 17,
    fontWeight: "600"
  }
  });
}