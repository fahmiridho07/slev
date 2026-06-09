import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Animated, Text, View, type LayoutChangeEvent } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import type { PurchaseVerdictTone, PurchaseVerdictUi } from "../../lib/purchaseVerdict";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";

type PurchaseVerdictPanelProps = {
  contextNote: string | null;
  detail: string | null;
  footnote: string | null;
  headline: string;
  meterColor: string;
  meterFillWidth: Animated.Value;
  newSafeDaily: number;
  onMeterTrackLayout: (event: LayoutChangeEvent) => void;
  safeDaily: number;
  showMeter: boolean;
  ui: PurchaseVerdictUi;
};

type TonePalette = {
  accent: string;
  card: object;
  context: object;
  footnote: object;
  iconBg: object;
  status: object;
  statusText: string;
};

function PurchaseVerdictPanelComponent({
  contextNote,
  detail,
  footnote,
  headline,
  meterColor,
  meterFillWidth,
  newSafeDaily,
  onMeterTrackLayout,
  safeDaily,
  showMeter,
  ui
}: PurchaseVerdictPanelProps) {
  const { colors, componentStyles, strings } = useTheme();
  const verdictCopy = strings.home.safeToSpend.purchaseVerdict;
  const palette = getTonePalette(ui.tone, colors, componentStyles);

  return (
    <View style={[componentStyles.purchaseVerdict, palette.card]}>
      <View style={componentStyles.purchaseVerdictHeader}>
        <View style={[componentStyles.purchaseVerdictIconBadge, palette.iconBg]}>
          <Ionicons color={palette.accent} name={ui.icon} size={20} />
        </View>
        <View style={[componentStyles.purchaseVerdictStatus, palette.status]}>
          <Text style={[componentStyles.purchaseVerdictStatusText, { color: palette.statusText }]}>
            {ui.statusLabel}
          </Text>
        </View>
      </View>

      <View accessibilityLiveRegion="polite" style={componentStyles.purchaseVerdictBody}>
        <Text style={componentStyles.purchaseVerdictHeadline}>{headline}</Text>
        {detail ? <Text style={componentStyles.purchaseVerdictDetail}>{detail}</Text> : null}
      </View>

      {contextNote ? (
        <View style={[componentStyles.purchaseVerdictContextBox, palette.context]}>
          <Ionicons color={palette.accent} name="pricetag-outline" size={14} />
          <Text style={componentStyles.purchaseVerdictContextText}>{contextNote}</Text>
        </View>
      ) : null}

      {footnote ? (
        <View style={[componentStyles.purchaseVerdictFootnoteRow, palette.footnote]}>
          <Ionicons color={colors.blue} name="information-circle-outline" size={14} />
          <Text style={componentStyles.purchaseVerdictFootnoteText}>{footnote}</Text>
        </View>
      ) : null}

      {showMeter ? (
        <View style={componentStyles.purchaseMeterBlock}>
          <View style={componentStyles.purchaseMeterLabels}>
            <View style={componentStyles.purchaseMeterLabelCol}>
              <Text style={componentStyles.purchaseMeterLabel}>{verdictCopy.meterBefore}</Text>
              <Text style={componentStyles.purchaseMeterValue}>{formatRupiah(safeDaily)}</Text>
            </View>
            <Ionicons color={colors.muted} name="arrow-forward" size={14} />
            <View style={componentStyles.purchaseMeterLabelCol}>
              <Text style={componentStyles.purchaseMeterLabel}>{verdictCopy.meterAfter}</Text>
              <Text style={[componentStyles.purchaseMeterValue, { color: palette.accent }]}>
                {formatRupiah(newSafeDaily)}
              </Text>
            </View>
          </View>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            onLayout={onMeterTrackLayout}
            style={componentStyles.purchaseMeterTrack}
          >
            <Animated.View
              style={[
                componentStyles.purchaseMeterFill,
                {
                  backgroundColor: meterColor,
                  width: meterFillWidth
                }
              ]}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function getTonePalette(
  tone: PurchaseVerdictTone,
  colors: ReturnType<typeof useTheme>["colors"],
  componentStyles: ReturnType<typeof useTheme>["componentStyles"]
): TonePalette {
  if (tone === "comfortable") {
    return {
      accent: colors.greenDark,
      card: componentStyles.purchaseVerdictComfortable,
      context: componentStyles.purchaseVerdictContextComfortable,
      footnote: componentStyles.purchaseVerdictFootnoteNeutral,
      iconBg: componentStyles.purchaseVerdictIconComfortable,
      status: componentStyles.purchaseVerdictStatusComfortable,
      statusText: colors.greenDark
    };
  }
  if (tone === "safe") {
    return {
      accent: colors.green,
      card: componentStyles.purchaseVerdictSafe,
      context: componentStyles.purchaseVerdictContextSafe,
      footnote: componentStyles.purchaseVerdictFootnoteNeutral,
      iconBg: componentStyles.purchaseVerdictIconSafe,
      status: componentStyles.purchaseVerdictStatusSafe,
      statusText: colors.greenDark
    };
  }
  if (tone === "warn") {
    return {
      accent: colors.amber,
      card: componentStyles.purchaseVerdictWarn,
      context: componentStyles.purchaseVerdictContextWarn,
      footnote: componentStyles.purchaseVerdictFootnoteNeutral,
      iconBg: componentStyles.purchaseVerdictIconWarn,
      status: componentStyles.purchaseVerdictStatusWarn,
      statusText: colors.amber
    };
  }
  if (tone === "caution") {
    return {
      accent: colors.blue,
      card: componentStyles.purchaseVerdictCaution,
      context: componentStyles.purchaseVerdictContextCaution,
      footnote: componentStyles.purchaseVerdictFootnoteInfo,
      iconBg: componentStyles.purchaseVerdictIconCaution,
      status: componentStyles.purchaseVerdictStatusCaution,
      statusText: colors.blue
    };
  }
  if (tone === "danger") {
    return {
      accent: colors.coral,
      card: componentStyles.purchaseVerdictDanger,
      context: componentStyles.purchaseVerdictContextDanger,
      footnote: componentStyles.purchaseVerdictFootnoteDanger,
      iconBg: componentStyles.purchaseVerdictIconDanger,
      status: componentStyles.purchaseVerdictStatusDanger,
      statusText: colors.coral
    };
  }

  return {
    accent: colors.muted,
    card: componentStyles.purchaseVerdictNeutral,
    context: componentStyles.purchaseVerdictContextNeutral,
    footnote: componentStyles.purchaseVerdictFootnoteNeutral,
    iconBg: componentStyles.purchaseVerdictIconNeutral,
    status: componentStyles.purchaseVerdictStatusNeutral,
    statusText: colors.muted
  };
}

export const PurchaseVerdictPanel = memo(PurchaseVerdictPanelComponent);