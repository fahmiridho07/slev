import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { EmptyState, FeedbackButton, getPatternToneStyle, patternColor, patternIcon, SectionHeader } from "../../components";
import { groupPatterns } from "../../lib/analysis";
import { PatternFeedbackResponse, SpendingMoment, SpendingPattern } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";

export function PatternOverview({
  feedbackByPattern,
  moments,
  patterns,
  onAnswer
}: {
  feedbackByPattern: Map<string, PatternFeedbackResponse>;
  moments: SpendingMoment[];
  patterns: SpendingPattern[];
  onAnswer: (patternId: string, response: PatternFeedbackResponse) => void;
}) {
  const { colors, componentStyles, styles } = useTheme();
  const enoughForRecap = moments.filter((moment) => moment.type === "expense" && Date.parse(moment.occurredAt) >= Date.now() - 14 * 24 * 60 * 60 * 1000).length >= 6;
  const groups = useMemo(() => groupPatterns(patterns), [patterns]);

  return (
    <>
      {patterns.length === 0 ? (
        <EmptyState text="Patterns appear after a few saved moments." />
      ) : (
        groups.map((group) => (
          <View key={group.title} style={styles.patternGroup}>
            <SectionHeader title={group.title} />
            {group.items.map((pattern) => (
              <View key={pattern.id} style={[styles.patternCard, getPatternToneStyle(pattern.tone, componentStyles)]}>
                <View style={styles.patternTitleRow}>
                  <Ionicons name={patternIcon(pattern.tone)} size={18} color={patternColor(pattern.tone, colors)} />
                  <Text style={styles.patternTitle}>{pattern.title}</Text>
                </View>
                <Text style={styles.patternDetail}>{pattern.detail}</Text>

                {enoughForRecap && pattern.recapQuestion && (
                  <View style={styles.recapBlock}>
                    <Text style={styles.recapQuestion}>{pattern.recapQuestion}</Text>
                    <View style={styles.feedbackRow}>
                      <FeedbackButton
                        active={feedbackByPattern.get(pattern.id) === "keep"}
                        label="Keep"
                        onPress={() => onAnswer(pattern.id, "keep")}
                      />
                      <FeedbackButton
                        active={feedbackByPattern.get(pattern.id) === "less_often"}
                        label="Less often"
                        onPress={() => onAnswer(pattern.id, "less_often")}
                      />
                      <FeedbackButton
                        active={feedbackByPattern.get(pattern.id) === "not_sure"}
                        label="Not sure"
                        onPress={() => onAnswer(pattern.id, "not_sure")}
                      />
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))
      )}
    </>
  );
}
