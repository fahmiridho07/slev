import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { EmptyState, FeedbackButton, getPatternToneStyle, patternColor, patternIcon, SectionHeader } from "../../components";
import { formatString } from "../../i18n";
import { groupPatterns } from "../../lib/analysis";
import { PatternFeedbackResponse, SpendingMoment, SpendingPattern } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";

const RECAP_EXPENSE_THRESHOLD = 6;
const RECAP_LOOKBACK_MS = 14 * 24 * 60 * 60 * 1000;

function countRecentExpenses(moments: SpendingMoment[]) {
  const cutoff = Date.now() - RECAP_LOOKBACK_MS;
  return moments.filter(
    (moment) => moment.type === "expense" && Date.parse(moment.occurredAt) >= cutoff
  ).length;
}

export function PatternOverview({
  feedbackByPattern,
  moments,
  onOpenCapture,
  patterns,
  onAnswer
}: {
  feedbackByPattern: Map<string, PatternFeedbackResponse>;
  moments: SpendingMoment[];
  onOpenCapture: () => void;
  patterns: SpendingPattern[];
  onAnswer: (patternId: string, response: PatternFeedbackResponse) => void;
}) {
  const { colors, componentStyles, strings, styles } = useTheme();
  const recentExpenseCount = useMemo(() => countRecentExpenses(moments), [moments]);
  const enoughForRecap = recentExpenseCount >= RECAP_EXPENSE_THRESHOLD;
  const groups = useMemo(() => groupPatterns(patterns), [patterns]);

  return (
    <View style={styles.cardStack}>
      {patterns.length === 0 ? (
        <EmptyState
          actionLabel={strings.patterns.recapEmptyAction}
          onAction={onOpenCapture}
          text={strings.patterns.recapEmpty}
        />
      ) : (
        groups.map((group) => (
          <View key={group.title} style={styles.patternGroup}>
            <SectionHeader title={group.title} />
            {group.items.map((pattern) => (
              <View key={pattern.id} style={[styles.patternCard, getPatternToneStyle(pattern.tone, componentStyles)]}>
                <View style={componentStyles.patternTitleRow}>
                  <Ionicons name={patternIcon(pattern.tone)} size={18} color={patternColor(pattern.tone, colors)} />
                  <Text style={componentStyles.patternTitle}>{pattern.title}</Text>
                </View>
                <Text style={componentStyles.patternDetail}>{pattern.detail}</Text>

                {pattern.recapQuestion && (
                  <View style={styles.recapBlock}>
                    {enoughForRecap ? (
                      <>
                        <Text style={styles.recapQuestion}>{pattern.recapQuestion}</Text>
                        <View style={componentStyles.feedbackRow}>
                          <FeedbackButton
                            active={feedbackByPattern.get(pattern.id) === "keep"}
                            label={strings.patterns.recap.feedbackKeep}
                            onPress={() => onAnswer(pattern.id, "keep")}
                          />
                          <FeedbackButton
                            active={feedbackByPattern.get(pattern.id) === "less_often"}
                            label={strings.patterns.recap.feedbackLessOften}
                            onPress={() => onAnswer(pattern.id, "less_often")}
                          />
                          <FeedbackButton
                            active={feedbackByPattern.get(pattern.id) === "not_sure"}
                            label={strings.patterns.recap.feedbackNotSure}
                            onPress={() => onAnswer(pattern.id, "not_sure")}
                          />
                        </View>
                      </>
                    ) : (
                      <Text style={styles.settingCopy}>
                        {formatString(strings.patterns.recap.expensesProgress, { count: recentExpenseCount })}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        ))
      )}
    </View>
  );
}