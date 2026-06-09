import { Ionicons } from "@expo/vector-icons";
import React, { memo, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { BottomSheet } from "../../components";
import { SettingsTabKey } from "../app.types";
import { MoneyAccount, MoneyTransfer, RecurringBill, SpendingMoment } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";
import type { SafeToSpendResult } from "../../lib/safeToSpend";
import { buildHomeHintSections, hasActionableHomeHints } from "./homeHints";

type HomeHintsSheetProps = {
  accounts: MoneyAccount[];
  moments: SpendingMoment[];
  onOpenSettings: (tab?: SettingsTabKey) => void;
  paydayDayOfMonth: number | null;
  recurringBills: RecurringBill[];
  safe: SafeToSpendResult;
  transfers: MoneyTransfer[];
};

function HomeHintsSheetComponent({
  accounts,
  moments,
  onOpenSettings,
  paydayDayOfMonth,
  recurringBills,
  safe,
  transfers
}: HomeHintsSheetProps) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const [open, setOpen] = useState(false);
  const hintStrings = strings.home.hints;

  const sections = useMemo(
    () =>
      buildHomeHintSections({
        accounts,
        moments,
        paydayDayOfMonth,
        recurringBills,
        safe,
        strings,
        transfers
      }),
    [accounts, moments, paydayDayOfMonth, recurringBills, safe, strings, transfers]
  );

  const showBadge = useMemo(
    () =>
      hasActionableHomeHints({
        accounts,
        moments,
        paydayDayOfMonth,
        recurringBills,
        transfers
      }),
    [accounts, moments, paydayDayOfMonth, recurringBills, transfers]
  );

  return (
    <>
      <Pressable
        accessibilityLabel={hintStrings.triggerA11y}
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => setOpen(true)}
        style={styles.homeHintsTrigger}
      >
        <Ionicons color={colors.muted} name="help-circle-outline" size={22} />
        {showBadge ? <View style={styles.homeHintsBadge} /> : null}
      </Pressable>

      <BottomSheet onClose={() => setOpen(false)} title={hintStrings.sheetTitle} visible={open}>
        <ScrollView
          contentContainerStyle={styles.homeHintsSheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section) => (
            <View key={section.key} style={styles.homeHintsSection}>
              {section.title ? (
                <Text style={componentStyles.microLabel}>{section.title}</Text>
              ) : null}
              {section.items.map((item) => (
                <View key={item.id} style={styles.homeHintsItem}>
                  <Text style={styles.homeHintsItemText}>
                    {item.message}
                    {item.actionLabel && item.actionTab ? (
                      <>
                        {" "}
                        <Text
                          accessibilityLabel={item.actionA11y}
                          accessibilityRole="link"
                          onPress={() => {
                            setOpen(false);
                            onOpenSettings(item.actionTab);
                          }}
                          style={styles.homeBalanceHintAction}
                        >
                          {item.actionLabel}
                        </Text>
                      </>
                    ) : null}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </BottomSheet>
    </>
  );
}

export const HomeHintsSheet = memo(HomeHintsSheetComponent);