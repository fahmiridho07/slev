import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { BottomSheet, EmptyState } from "../../components";
import { formatString } from "../../i18n";
import { formatLocaleMonthYear } from "../../i18n/localeDate";
import { filterBreakdownMoments } from "../../lib/breakdownDrilldown";
import { FinanceBreakdownRow } from "../../lib/financeEngine";
import { formatRupiah } from "../../lib/spendingMemoryPatterns";
import { EntryType, SpendingMoment } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";
import { BreakdownMomentItem } from "./BreakdownMomentItem";

type CategoryBreakdownSheetProps = {
  breakdownType: EntryType;
  moments: SpendingMoment[];
  onClose: () => void;
  onDeleteMoment: (moment: SpendingMoment) => void;
  onEditMoment: (moment: SpendingMoment) => void;
  referenceDate: Date;
  row: FinanceBreakdownRow | null;
  visible: boolean;
};

export function CategoryBreakdownSheet({
  breakdownType,
  moments,
  onClose,
  onDeleteMoment,
  onEditMoment,
  referenceDate,
  row,
  visible
}: CategoryBreakdownSheetProps) {
  const { componentStyles, strings, styles } = useTheme();
  const breakdownStrings = strings.patterns.breakdown;
  const entries = useMemo(
    () => (row ? filterBreakdownMoments(moments, breakdownType, row.key, referenceDate) : []),
    [breakdownType, moments, referenceDate, row]
  );

  if (!row) {
    return null;
  }

  const monthLabel = formatLocaleMonthYear(referenceDate);

  return (
    <BottomSheet
      onClose={onClose}
      title={formatString(breakdownStrings.drilldownTitle, { category: row.label, month: monthLabel })}
      visible={visible}
    >
      <View style={componentStyles.sheetForm}>
        <Text style={styles.settingCopy}>
          {formatString(breakdownStrings.drilldownSummary, {
            count: entries.length,
            total: formatRupiah(row.amount)
          })}
        </Text>

        <ScrollView
          contentContainerStyle={styles.repeatBlock}
          showsVerticalScrollIndicator={false}
          style={componentStyles.sheetScroll}
        >
          {entries.length === 0 ? (
            <EmptyState text={breakdownStrings.drilldownEmpty} />
          ) : (
            <View style={styles.listPanel}>
              {entries.map((moment) => (
                <BreakdownMomentItem
                  key={moment.id}
                  moment={moment}
                  onDelete={onDeleteMoment}
                  onStartEdit={onEditMoment}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}