import { StyleSheet } from "react-native";
import { colors, shadows } from "../colors";

export const SWIPE_DELETE_ACTION_WIDTH = 84;

export const componentStyles = StyleSheet.create({
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
  segmentButton: {
    alignItems: "center",
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 6,
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: "center",
    minHeight: 40,
    minWidth: 88,
    paddingHorizontal: 10
  },
  segmentButtonCompact: {
    minHeight: 34,
    minWidth: 84
  },
  segmentButtonActive: {
    backgroundColor: colors.surface,
    borderColor: colors.line
  },
  segmentButtonText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0,
    textAlign: "center"
  },
  segmentButtonTextActive: {
    color: colors.greenDark,
    fontWeight: "700"
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
    backgroundColor: "rgba(24, 32, 28, 0.36)",
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
    fontWeight: "900",
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
  segmentButtonStretch: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 6
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
  feedbackText: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: "800"
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
    paddingHorizontal: 2
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
  }
});