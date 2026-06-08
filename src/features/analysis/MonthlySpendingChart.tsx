import React, { useMemo } from "react";
import { Text, View, type ViewStyle } from "react-native";
import { formatString } from "../../i18n";
import { formatLocaleMonthYear } from "../../i18n/localeDate";
import { getPercentWidthStyle } from "../../lib/analysis";
import { FinanceBreakdownRow } from "../../lib/financeEngine";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { isCurrentMonthDate } from "../../lib/spendingPeriod";
import { useTheme } from "../../hooks/useTheme";

type MonthlySpendingChartVariant = "bar" | "donut";

type MonthlySpendingChartProps = {
  compactLegend?: boolean;
  hero?: boolean;
  periodDate?: Date;
  rows: FinanceBreakdownRow[];
  variant?: MonthlySpendingChartVariant;
};

const DONUT_SIZE = 120;
const DONUT_SIZE_HERO = 152;
const DONUT_THICKNESS = 24;
const DONUT_THICKNESS_HERO = 32;

function DonutSlice({
  color,
  size,
  startAngle,
  sweepAngle
}: {
  color: string;
  size: number;
  startAngle: number;
  sweepAngle: number;
}) {
  if (sweepAngle <= 0) {
    return null;
  }

  if (sweepAngle > 180) {
    return (
      <>
        <DonutSlice color={color} size={size} startAngle={startAngle} sweepAngle={180} />
        <DonutSlice color={color} size={size} startAngle={startAngle + 180} sweepAngle={sweepAngle - 180} />
      </>
    );
  }

  const radius = size / 2;
  const pivot = radius / 2;

  return (
    <View
      style={{
        height: size,
        left: radius,
        position: "absolute",
        top: 0,
        transform: [{ rotate: `${startAngle}deg` }],
        width: radius
      }}
    >
      <View
        style={{
          backgroundColor: color,
          height: size,
          left: -radius,
          position: "absolute",
          top: 0,
          transform: [{ translateX: pivot }, { rotate: `${sweepAngle}deg` }, { translateX: -pivot }],
          width: radius
        }}
      />
    </View>
  );
}

function DonutChart({
  chartColors,
  rows,
  size,
  thickness,
  wrapStyle
}: {
  chartColors: string[];
  rows: FinanceBreakdownRow[];
  size: number;
  thickness: number;
  wrapStyle: ViewStyle[];
}) {
  const { styles } = useTheme();
  const innerSize = size - thickness * 2;
  let startAngle = -90;

  return (
    <View style={wrapStyle}>
      <View style={[styles.chartDonutCanvas, { height: size, width: size }]}>
        <View
          style={{
            borderRadius: size / 2,
            height: size,
            overflow: "hidden",
            position: "relative",
            width: size
          }}
        >
          {rows.map((row, index) => {
            const sweepAngle = row.share * 360;
            const slice = (
              <DonutSlice
                key={row.key}
                color={chartColors[index % chartColors.length]}
                size={size}
                startAngle={startAngle}
                sweepAngle={sweepAngle}
              />
            );
            startAngle += sweepAngle;
            return slice;
          })}
        </View>
        <View
          style={[
            styles.chartDonutHole,
            {
              borderRadius: innerSize / 2,
              height: innerSize,
              left: thickness,
              top: thickness,
              width: innerSize
            }
          ]}
        />
      </View>
    </View>
  );
}

export function MonthlySpendingChart({
  compactLegend = false,
  hero = false,
  periodDate,
  rows,
  variant = "bar"
}: MonthlySpendingChartProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const chartStrings = strings.patterns.chart;
  const chartColors = useMemo(
    () => [
      colors.greenDark,
      colors.blue,
      colors.amber,
      colors.coral,
      colors.chartSage,
      colors.chartLilac,
      colors.chartSlate,
      colors.chartCopper
    ],
    [
      colors.amber,
      colors.blue,
      colors.chartCopper,
      colors.chartLilac,
      colors.chartSage,
      colors.chartSlate,
      colors.coral,
      colors.greenDark
    ]
  );
  const total = useMemo(() => rows.reduce((sum, row) => sum + row.amount, 0), [rows]);
  const legendRows = compactLegend ? rows.slice(0, 5) : rows;
  const chartTitle =
    periodDate && !isCurrentMonthDate(periodDate)
      ? formatString(chartStrings.titleMonth, { month: formatLocaleMonthYear(periodDate) })
      : chartStrings.title;

  if (rows.length === 0 || total <= 0) {
    return null;
  }

  const breakdownSummary = legendRows
    .map((row) =>
      formatString(chartStrings.legendValue, {
        amount: formatRupiah(row.amount),
        percent: Math.round(row.share * 100)
      })
    )
    .join("; ");

  const donutSize = hero ? DONUT_SIZE_HERO : DONUT_SIZE;
  const donutThickness = hero ? DONUT_THICKNESS_HERO : DONUT_THICKNESS;

  return (
    <View
      accessibilityLabel={formatString(chartStrings.a11ySummary, {
        total: formatRupiah(total),
        count: rows.length,
        breakdown: breakdownSummary
      })}
      accessible
      style={styles.capturePanel}
    >
      <Text style={componentStyles.microLabel}>{chartTitle}</Text>
      <Text style={styles.settingCopy}>
        {formatString(chartStrings.totalAcross, { total: formatRupiah(total), count: rows.length })}
      </Text>

      {variant === "donut" ? (
        <DonutChart
          chartColors={chartColors}
          rows={rows}
          size={donutSize}
          thickness={donutThickness}
          wrapStyle={[styles.chartDonutWrap, ...(hero ? [styles.chartDonutWrapHero] : [])]}
        />
      ) : (
        <View style={hero ? styles.chartStackTrackHero : styles.chartStackTrack}>
          <View style={styles.chartStackRow}>
            {rows.map((row, index) => (
              <View
                key={row.key}
                style={[
                  styles.chartStackSegment,
                  getPercentWidthStyle(row.share),
                  { backgroundColor: chartColors[index % chartColors.length] }
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {!compactLegend && (
        <View style={styles.chartLegend}>
          {rows.map((row, index) => (
            <View key={row.key} style={styles.chartLegendRow}>
              <View style={styles.chartLegendLabelRow}>
                <View
                  style={[
                    styles.chartLegendSwatch,
                    { backgroundColor: chartColors[index % chartColors.length] }
                  ]}
                />
                <Text style={styles.chartLegendLabel}>{row.label}</Text>
              </View>
              <Text style={styles.chartLegendValue}>
                {formatString(chartStrings.legendValue, {
                  amount: formatRupiah(row.amount),
                  percent: Math.round(row.share * 100)
                })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}