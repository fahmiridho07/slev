import { Ionicons } from "@expo/vector-icons";
import React, { memo, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { BottomSheet } from "../../components";
import { SettingsTabKey } from "../app.types";
import { MoneyAccount, MoneyTransfer, RecurringBill, SpendingMoment } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";
import type { SafeToSpendPace, SafeToSpendResult } from "../../lib/safeToSpend";
import { buildHomeHintSections, hasActionableHomeHints, type HomeHintItem } from "./homeHints";

type HomeHintsSheetProps = {
  accounts: MoneyAccount[];
  moments: SpendingMoment[];
  onOpenSettings: (tab?: SettingsTabKey) => void;
  paydayDayOfMonth: number | null;
  recurringBills: RecurringBill[];
  safe: SafeToSpendResult;
  transfers: MoneyTransfer[];
};

function getCalloutStyle(
  pace: SafeToSpendPace,
  styles: ReturnType<typeof useTheme>["styles"]
) {
  if (pace === "under") {
    return {
      container: styles.homeHintsCalloutPositive,
      text: styles.homeHintsCalloutTextPositive
    };
  }
  if (pace === "over") {
    return {
      container: styles.homeHintsCalloutWarning,
      text: styles.homeHintsCalloutTextWarning
    };
  }
  if (pace === "even") {
    return {
      container: styles.homeHintsCalloutNeutral,
      text: styles.homeHintsCalloutTextNeutral
    };
  }
  return {
    container: styles.homeHintsCalloutInfo,
    text: styles.homeHintsCalloutTextInfo
  };
}

type HintItemProps = {
  item: HomeHintItem;
  onOpenSettings: (tab?: SettingsTabKey) => void;
  onClose: () => void;
  pace: SafeToSpendPace;
  showDefinitionDivider: boolean;
};

function HintItem({ item, onClose, onOpenSettings, pace, showDefinitionDivider }: HintItemProps) {
  const { styles } = useTheme();
  const kind = item.kind ?? "text";

  if (kind === "callout") {
    const calloutStyle = getCalloutStyle(pace, styles);
    return (
      <View style={[styles.homeHintsCallout, calloutStyle.container]}>
        {item.title ? <Text style={styles.homeHintsCalloutLabel}>{item.title}</Text> : null}
        <Text style={[styles.homeHintsCalloutValue, calloutStyle.text]}>{item.message}</Text>
      </View>
    );
  }

  if (kind === "definition") {
    return (
      <View style={[styles.homeHintsDefinition, showDefinitionDivider ? styles.homeHintsDefinitionDivider : null]}>
        {item.title ? <Text style={styles.homeHintsDefinitionTitle}>{item.title}</Text> : null}
        <Text style={styles.homeHintsDefinitionBody}>{item.message}</Text>
      </View>
    );
  }

  if (kind === "fact") {
    return (
      <View style={styles.homeHintsFact}>
        <View style={styles.homeHintsFactDot} />
        <Text style={styles.homeHintsFactText}>{item.message}</Text>
      </View>
    );
  }

  if (kind === "action") {
    return (
      <View style={styles.homeHintsAction}>
        <Text style={styles.homeHintsActionText}>
          {item.message}
          {item.actionLabel && item.actionTab ? (
            <>
              {" "}
              <Text
                accessibilityLabel={item.actionA11y}
                accessibilityRole="link"
                onPress={() => {
                  onClose();
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
    );
  }

  return <Text style={styles.homeHintsText}>{item.message}</Text>;
}

function HomeHintsSheetComponent({
  accounts,
  moments,
  onOpenSettings,
  paydayDayOfMonth,
  recurringBills,
  safe,
  transfers
}: HomeHintsSheetProps) {
  const { colors, strings, styles } = useTheme();
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

  function closeSheet() {
    setOpen(false);
  }

  return (
    <>
      <Pressable
        accessibilityLabel={hintStrings.triggerA11y}
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => setOpen(true)}
        style={styles.homeHintsTrigger}
      >
        <Ionicons color={colors.muted} name="help-circle-outline" size={20} />
        {showBadge ? <View style={styles.homeHintsBadge} /> : null}
      </Pressable>

      <BottomSheet onClose={closeSheet} title={hintStrings.sheetTitle} visible={open}>
        <ScrollView
          contentContainerStyle={styles.homeHintsSheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section) => (
            <View key={section.key} style={styles.homeHintsSectionCard}>
              {section.title ? <Text style={styles.homeHintsSectionTitle}>{section.title}</Text> : null}
              {section.items.map((item, index) => {
                const previousKind = index > 0 ? section.items[index - 1]?.kind : undefined;
                const showDefinitionDivider = item.kind === "definition" && previousKind === "definition";

                return (
                  <HintItem
                    key={item.id}
                    item={item}
                    onClose={closeSheet}
                    onOpenSettings={onOpenSettings}
                    pace={safe.pace}
                    showDefinitionDivider={showDefinitionDivider}
                  />
                );
              })}
            </View>
          ))}
        </ScrollView>
      </BottomSheet>
    </>
  );
}

export const HomeHintsSheet = memo(HomeHintsSheetComponent);