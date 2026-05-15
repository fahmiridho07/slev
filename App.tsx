import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BRAND } from "./src/data/brand";
import { CONTEXT_HINTS, SPENDING_CONTEXTS } from "./src/data/spendingMemory";
import {
  PatternFeedback,
  PatternFeedbackResponse,
  SpendingContext,
  SpendingMoment,
  SpendingPattern
} from "./src/features/spendingMemory.types";
import {
  formatCompactRupiah,
  formatRupiah,
  generateSpendingPatterns,
  getHomeObservation
} from "./src/lib/spendingMemoryPatterns";
import {
  clearSpendingMemory,
  deleteSpendingMoment,
  listPatternFeedback,
  listSpendingMoments,
  savePatternFeedback,
  saveSpendingMoment,
  updateSpendingMoment
} from "./src/services/spendingMemoryRepository";
import { colors, shadows } from "./src/theme/colors";

type TabKey = "home" | "memory" | "patterns" | "settings";

const tabs: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "home", label: "Home", icon: "add-circle-outline" },
  { key: "memory", label: "Memory", icon: "albums-outline" },
  { key: "patterns", label: "Patterns", icon: "sparkles-outline" },
  { key: "settings", label: "Settings", icon: "shield-checkmark-outline" }
];

const SLEV_MARK = require("./assets/brand/slev-mark-transparent.png");

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [moments, setMoments] = useState<SpendingMoment[]>([]);
  const [feedback, setFeedback] = useState<PatternFeedback[]>([]);
  const [amountText, setAmountText] = useState("");
  const [label, setLabel] = useState("");
  const [context, setContext] = useState<SpendingContext>("Other");
  const [note, setNote] = useState("");
  const [editingMomentId, setEditingMomentId] = useState<string | null>(null);
  const [message, setMessage] = useState("A spending memory can be as small as an amount.");

  const reload = async () => {
    const [storedMoments, storedFeedback] = await Promise.all([
      listSpendingMoments(),
      listPatternFeedback()
    ]);
    setMoments(storedMoments);
    setFeedback(storedFeedback);
    if (storedMoments[0]) {
      setContext(storedMoments[0].context);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const patterns = useMemo(() => generateSpendingPatterns(moments), [moments]);
  const homeObservation = useMemo(() => getHomeObservation(moments), [moments]);
  const repeatSuggestions = useMemo(() => getRepeatSuggestions(moments), [moments]);
  const feedbackByPattern = useMemo(
    () => new Map(feedback.map((item) => [item.patternId, item.response])),
    [feedback]
  );

  async function saveCurrentMoment() {
    const amount = parseAmountInput(amountText);
    if (!amount) {
      setMessage("Enter an amount to save this memory.");
      return;
    }

    if (editingMomentId) {
      const updated = await updateSpendingMoment(editingMomentId, {
        amount,
        label,
        context,
        note
      });
      setMoments(updated);
      setEditingMomentId(null);
      setMessage("Memory updated.");
    } else {
      const saved = await saveSpendingMoment({
        amount,
        label,
        context,
        note
      });
      setMoments(await listSpendingMoments());
      setContext(saved.context);
      setMessage(`${formatRupiah(saved.amount)} saved${saved.label ? ` for ${saved.label}` : ""}.`);
    }

    setAmountText("");
    setLabel("");
    setNote("");
  }

  async function removeMoment(id: string) {
    const updated = await deleteSpendingMoment(id);
    setMoments(updated);
    setMessage("Memory removed.");
  }

  async function updateMoment(id: string, input: {
    amountText: string;
    label: string;
    context: SpendingContext;
    note: string;
  }) {
    const amount = parseAmountInput(input.amountText);
    if (!amount) {
      setMessage("Enter an amount before saving changes.");
      return;
    }

    const updated = await updateSpendingMoment(id, {
      amount,
      label: input.label,
      context: input.context,
      note: input.note
    });
    setMoments(updated);
    setMessage("Memory updated.");
  }

  async function undoLastMoment(moment: SpendingMoment) {
    const updated = await deleteSpendingMoment(moment.id);
    setMoments(updated);
    setEditingMomentId(null);
    setMessage("Last memory undone.");
  }

  function editLastMoment(moment: SpendingMoment) {
    setEditingMomentId(moment.id);
    setAmountText(String(moment.amount));
    setLabel(moment.label ?? "");
    setContext(moment.context);
    setNote(moment.note ?? "");
    setMessage("Editing the last saved memory.");
  }

  function useRepeatSuggestion(suggestion: RepeatSuggestion) {
    setLabel(suggestion.label);
    setContext(suggestion.context);
    if (!amountText.trim()) {
      setAmountText(String(suggestion.amount));
    }
  }

  async function answerPattern(patternId: string, response: PatternFeedbackResponse) {
    const updated = await savePatternFeedback(patternId, response);
    setFeedback(updated);
  }

  async function clearAll() {
    Alert.alert("Clear spending memory?", "This removes local spending moments and pattern responses from this device.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await clearSpendingMemory();
          setMoments([]);
          setFeedback([]);
          setMessage("Local spending memory cleared.");
        }
      }
    ]);
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.appShell}
        >
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <Image source={SLEV_MARK} style={styles.brandMark} />
              <View>
                <Text style={styles.brandName}>{BRAND.name}</Text>
                <Text style={styles.brandLine}>Spending memory</Text>
              </View>
            </View>
            <Text style={styles.headerMessage}>{message}</Text>
          </View>

          <View style={styles.content}>
            {activeTab === "home" && (
              <HomeScreen
                amountText={amountText}
                context={context}
                homeObservation={homeObservation}
                isEditing={Boolean(editingMomentId)}
                label={label}
                lastSavedMoment={moments[0]}
                note={note}
                recentMoments={moments.slice(0, 5)}
                repeatSuggestions={repeatSuggestions}
                onChangeAmount={setAmountText}
                onChangeContext={setContext}
                onChangeLabel={setLabel}
                onChangeNote={setNote}
                onEditLast={editLastMoment}
                onSave={saveCurrentMoment}
                onUndoLast={undoLastMoment}
                onUseRepeat={useRepeatSuggestion}
              />
            )}
            {activeTab === "memory" && (
              <MemoryScreen
                moments={moments}
                onDelete={removeMoment}
                onUpdate={updateMoment}
              />
            )}
            {activeTab === "patterns" && (
              <PatternsScreen
                feedbackByPattern={feedbackByPattern}
                moments={moments}
                patterns={patterns}
                onAnswer={answerPattern}
              />
            )}
            {activeTab === "settings" && (
              <SettingsScreen
                momentCount={moments.length}
                onClear={clearAll}
              />
            )}
          </View>

          <View style={styles.tabBar}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <Pressable
                  accessibilityRole="button"
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={20}
                    color={isActive ? colors.greenDark : colors.muted}
                  />
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function HomeScreen({
  amountText,
  context,
  homeObservation,
  isEditing,
  label,
  lastSavedMoment,
  note,
  recentMoments,
  repeatSuggestions,
  onChangeAmount,
  onChangeContext,
  onChangeLabel,
  onChangeNote,
  onEditLast,
  onSave,
  onUndoLast,
  onUseRepeat
}: {
  amountText: string;
  context: SpendingContext;
  homeObservation: SpendingPattern;
  isEditing: boolean;
  label: string;
  lastSavedMoment?: SpendingMoment;
  note: string;
  recentMoments: SpendingMoment[];
  repeatSuggestions: RepeatSuggestion[];
  onChangeAmount: (value: string) => void;
  onChangeContext: (value: SpendingContext) => void;
  onChangeLabel: (value: string) => void;
  onChangeNote: (value: string) => void;
  onEditLast: (moment: SpendingMoment) => void;
  onSave: () => void;
  onUndoLast: (moment: SpendingMoment) => void;
  onUseRepeat: (suggestion: RepeatSuggestion) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(Boolean(note));

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.capturePanel}>
        <Text style={styles.kicker}>{isEditing ? "Edit memory" : "Quick capture"}</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencyPrefix}>Rp</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={onChangeAmount}
            placeholder="0"
            placeholderTextColor={colors.muted}
            style={styles.amountInput}
            value={amountText}
          />
        </View>

        <TextInput
          onChangeText={onChangeLabel}
          placeholder="Label, optional"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={label}
        />

        {repeatSuggestions.length > 0 && (
          <View style={styles.repeatBlock}>
            <Text style={styles.microLabel}>Repeat faster</Text>
            <View style={styles.suggestionRow}>
              {repeatSuggestions.map((item) => (
                <Pressable key={`${item.label}-${item.context}`} onPress={() => onUseRepeat(item)} style={styles.repeatChip}>
                  <Text style={styles.repeatText}>{item.label}</Text>
                  <Text style={styles.repeatAmount}>{formatCompactRupiah(item.amount)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.contextHeaderRow}>
          <Text style={styles.microLabel}>Context</Text>
          <Text style={styles.contextDefault}>Defaults to last used</Text>
        </View>
        <ContextPicker selected={context} onSelect={onChangeContext} />

        {noteOpen ? (
          <TextInput
            multiline
            onChangeText={onChangeNote}
            placeholder="Tiny note, optional"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.noteInput]}
            value={note}
          />
        ) : (
          <Pressable accessibilityRole="button" onPress={() => setNoteOpen(true)} style={styles.addNoteButton}>
            <Ionicons name="create-outline" size={16} color={colors.muted} />
            <Text style={styles.addNoteText}>Add note only if it helps recall</Text>
          </Pressable>
        )}

        <Pressable accessibilityRole="button" onPress={onSave} style={styles.primaryButton}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.surface} />
          <Text style={styles.primaryButtonText}>{isEditing ? "Update memory" : "Save memory"}</Text>
        </Pressable>
      </View>

      {lastSavedMoment && !isEditing && (
        <View style={styles.lastSavedPanel}>
          <View style={styles.lastSavedText}>
            <Text style={styles.microLabel}>Last saved</Text>
            <Text style={styles.lastSavedTitle}>
              {formatCompactRupiah(lastSavedMoment.amount)} - {lastSavedMoment.label || lastSavedMoment.context}
            </Text>
          </View>
          <View style={styles.lastSavedActions}>
            <Pressable onPress={() => onEditLast(lastSavedMoment)} style={styles.textButton}>
              <Ionicons name="create-outline" size={16} color={colors.greenDark} />
              <Text style={styles.textButtonLabel}>Edit</Text>
            </Pressable>
            <Pressable onPress={() => onUndoLast(lastSavedMoment)} style={styles.textButton}>
              <Ionicons name="arrow-undo-outline" size={16} color={colors.coral} />
              <Text style={[styles.textButtonLabel, styles.deleteText]}>Undo</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ObservationPanel pattern={homeObservation} />

      <SectionHeader title="Recent memory" />
      {recentMoments.length === 0 ? (
        <EmptyState text="Saved moments will collect here quietly." />
      ) : (
        <View style={styles.listPanel}>
          {recentMoments.slice(0, 3).map((moment) => (
            <MomentRow
              key={moment.id}
              moment={moment}
              repeatHint={getRepeatHint(moment, recentMoments)}
              compact
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function MemoryScreen({
  moments,
  onDelete,
  onUpdate
}: {
  moments: SpendingMoment[];
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    input: { amountText: string; label: string; context: SpendingContext; note: string }
  ) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editContext, setEditContext] = useState<SpendingContext>("Other");
  const [editNote, setEditNote] = useState("");
  const [query, setQuery] = useState("");
  const filteredMoments = useMemo(() => filterMoments(moments, query), [moments, query]);
  const grouped = useMemo(() => groupMomentsByRecallRange(filteredMoments), [filteredMoments]);

  function startEditing(moment: SpendingMoment) {
    setEditingId(moment.id);
    setEditAmount(String(moment.amount));
    setEditLabel(moment.label ?? "");
    setEditContext(moment.context);
    setEditNote(moment.note ?? "");
  }

  function confirmDelete(moment: SpendingMoment) {
    Alert.alert("Delete this memory?", moment.label ?? formatRupiah(moment.amount), [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(moment.id) }
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.heroPanel}>
        <Text style={styles.kickerDark}>Memory</Text>
        <Text style={styles.heroTitle}>A quiet list of where money went.</Text>
      </View>

      {moments.length > 0 && (
        <TextInput
          onChangeText={setQuery}
          placeholder="Search label, context, or amount"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={query}
        />
      )}

      {moments.length === 0 ? (
        <EmptyState text="No saved spending memory yet." />
      ) : filteredMoments.length === 0 ? (
        <EmptyState text="No memory matches that search." />
      ) : (
        grouped.map((group) => (
          <View key={group.key} style={styles.memoryGroup}>
            <Text style={styles.groupTitle}>{group.label}</Text>
            <View style={styles.listPanel}>
              {group.items.map((moment) => (
                <View key={moment.id}>
                  <MomentRow moment={moment} repeatHint={getRepeatHint(moment, moments)} />
                  <View style={styles.rowActions}>
                    <Pressable onPress={() => startEditing(moment)} style={styles.textButton}>
                      <Ionicons name="create-outline" size={16} color={colors.greenDark} />
                      <Text style={styles.textButtonLabel}>Edit</Text>
                    </Pressable>
                    <Pressable onPress={() => confirmDelete(moment)} style={styles.textButton}>
                      <Ionicons name="trash-outline" size={16} color={colors.coral} />
                      <Text style={[styles.textButtonLabel, styles.deleteText]}>Delete</Text>
                    </Pressable>
                  </View>

                  {editingId === moment.id && (
                    <View style={styles.editPanel}>
                      <TextInput
                        keyboardType="number-pad"
                        onChangeText={setEditAmount}
                        placeholder="Amount"
                        placeholderTextColor={colors.muted}
                        style={styles.input}
                        value={editAmount}
                      />
                      <TextInput
                        onChangeText={setEditLabel}
                        placeholder="Label"
                        placeholderTextColor={colors.muted}
                        style={styles.input}
                        value={editLabel}
                      />
                      <ContextPicker selected={editContext} onSelect={setEditContext} compact />
                      <TextInput
                        multiline
                        onChangeText={setEditNote}
                        placeholder="Note"
                        placeholderTextColor={colors.muted}
                        style={[styles.input, styles.noteInput]}
                        value={editNote}
                      />
                      <View style={styles.editActions}>
                        <Pressable onPress={() => setEditingId(null)} style={styles.secondaryButton}>
                          <Text style={styles.secondaryButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            onUpdate(moment.id, {
                              amountText: editAmount,
                              label: editLabel,
                              context: editContext,
                              note: editNote
                            });
                            setEditingId(null);
                          }}
                          style={styles.smallPrimaryButton}
                        >
                          <Text style={styles.primaryButtonText}>Save</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function PatternsScreen({
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
  const enoughForRecap = moments.filter((moment) => Date.parse(moment.occurredAt) >= Date.now() - 14 * 24 * 60 * 60 * 1000).length >= 6;
  const groups = useMemo(() => groupPatterns(patterns), [patterns]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.heroPanel}>
        <Text style={styles.kickerDark}>Patterns</Text>
        <Text style={styles.heroTitle}>What has been repeating, standing out, or quietly adding up.</Text>
      </View>

      {patterns.length === 0 ? (
        <EmptyState text="Patterns appear after a few saved moments." />
      ) : (
        groups.map((group) => (
          <View key={group.title} style={styles.patternGroup}>
            <SectionHeader title={group.title} />
            {group.items.map((pattern) => (
              <View key={pattern.id} style={[styles.patternCard, patternStyle(pattern.tone)]}>
                <View style={styles.patternTitleRow}>
                  <Ionicons name={patternIcon(pattern.tone)} size={18} color={patternColor(pattern.tone)} />
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
    </ScrollView>
  );
}

function SettingsScreen({
  momentCount,
  onClear
}: {
  momentCount: number;
  onClear: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.heroPanel}>
        <Text style={styles.kickerDark}>Settings</Text>
        <Text style={styles.heroTitle}>Local, quiet, and permission-light.</Text>
      </View>

      <View style={styles.settingsPanel}>
        <View style={styles.settingRow}>
          <Ionicons name="phone-portrait-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Stored on this device</Text>
            <Text style={styles.settingCopy}>{momentCount} spending memor{momentCount === 1 ? "y" : "ies"} saved locally.</Text>
          </View>
        </View>
        <View style={styles.settingRow}>
          <Ionicons name="notifications-off-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>No notification access required</Text>
            <Text style={styles.settingCopy}>The MVP does not read bank or wallet notifications.</Text>
          </View>
        </View>
        <View style={styles.settingRow}>
          <Ionicons name="cloud-offline-outline" size={20} color={colors.greenDark} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>No sync connected</Text>
            <Text style={styles.settingCopy}>Export can return later as an optional tool.</Text>
          </View>
        </View>
      </View>

      <Pressable accessibilityRole="button" onPress={onClear} style={styles.dangerButton}>
        <Ionicons name="trash-outline" size={18} color={colors.coral} />
        <Text style={styles.dangerButtonText}>Clear local memory</Text>
      </Pressable>
    </ScrollView>
  );
}

function ContextPicker({
  compact = false,
  selected,
  onSelect
}: {
  compact?: boolean;
  selected: SpendingContext;
  onSelect: (context: SpendingContext) => void;
}) {
  return (
    <View style={compact ? styles.contextWrapCompact : styles.contextWrap}>
      {SPENDING_CONTEXTS.map((item) => (
        <Pressable
          accessibilityRole="button"
          key={item}
          onPress={() => onSelect(item)}
          style={[styles.contextChip, selected === item && styles.contextChipActive]}
        >
          <Text style={[styles.contextChipText, selected === item && styles.contextChipTextActive]}>
            {item}
          </Text>
          {!compact && selected === item && (
            <Text style={styles.contextHint}>{CONTEXT_HINTS[item]}</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

function ObservationPanel({ pattern }: { pattern: SpendingPattern }) {
  return (
    <View style={[styles.observationPanel, patternStyle(pattern.tone)]}>
      <View style={styles.patternTitleRow}>
        <Ionicons name={patternIcon(pattern.tone)} size={18} color={patternColor(pattern.tone)} />
        <Text style={styles.patternTitle}>{pattern.title}</Text>
      </View>
      <Text style={styles.patternDetail}>{pattern.detail}</Text>
    </View>
  );
}

function FeedbackButton({
  active,
  label,
  onPress
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.feedbackButton, active && styles.feedbackButtonActive]}>
      <Text style={[styles.feedbackText, active && styles.feedbackTextActive]}>{label}</Text>
    </Pressable>
  );
}

function MomentRow({
  compact = false,
  moment,
  repeatHint
}: {
  compact?: boolean;
  moment: SpendingMoment;
  repeatHint?: string;
}) {
  return (
    <View style={[styles.momentRow, compact && styles.momentRowCompact]}>
      <View style={styles.momentIcon}>
        <Ionicons name={contextIcon(moment.context)} size={18} color={colors.greenDark} />
      </View>
      <View style={styles.momentText}>
        <Text style={styles.momentTitle}>{moment.label || moment.context}</Text>
        <Text style={styles.momentMeta}>
          {moment.context} - {formatTime(moment.occurredAt)}
          {moment.note ? ` - ${moment.note}` : ""}
        </Text>
        {repeatHint && <Text style={styles.repeatHint}>{repeatHint}</Text>}
      </View>
      <Text style={styles.momentAmount}>{formatCompactRupiah(moment.amount)}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="leaf-outline" size={22} color={colors.greenDark} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function parseAmountInput(value: string): number | null {
  const amount = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

type RepeatSuggestion = {
  amount: number;
  context: SpendingContext;
  label: string;
};

function getRepeatSuggestions(moments: SpendingMoment[]): RepeatSuggestion[] {
  const seen = new Set<string>();
  const suggestions: RepeatSuggestion[] = [];

  for (const moment of moments) {
    const label = moment.label || moment.context;
    const key = `${label.toLowerCase()}-${moment.context}`;
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push({
      amount: moment.amount,
      context: moment.context,
      label
    });
    if (suggestions.length >= 4) break;
  }

  return suggestions;
}

function filterMoments(moments: SpendingMoment[], query: string): SpendingMoment[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return moments;

  return moments.filter((moment) => {
    const haystack = [
      moment.label,
      moment.context,
      moment.note,
      String(moment.amount),
      formatCompactRupiah(moment.amount)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

function getRepeatHint(moment: SpendingMoment, moments: SpendingMoment[]): string | undefined {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const count = moments.filter(
    (item) => item.context === moment.context && Date.parse(item.occurredAt) >= weekAgo
  ).length;
  return count >= 3 ? `${count} this week` : undefined;
}

function groupMomentsByRecallRange(moments: SpendingMoment[]) {
  const now = new Date();
  const todayKey = dateKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = dateKey(yesterday);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const groups = [
    { key: "today", label: "Today", items: [] as SpendingMoment[] },
    { key: "yesterday", label: "Yesterday", items: [] as SpendingMoment[] },
    { key: "this-week", label: "This week", items: [] as SpendingMoment[] },
    { key: "earlier", label: "Earlier", items: [] as SpendingMoment[] }
  ];

  moments.forEach((moment) => {
    const key = dateKey(new Date(moment.occurredAt));
    const time = Date.parse(moment.occurredAt);
    if (key === todayKey) {
      groups[0].items.push(moment);
    } else if (key === yesterdayKey) {
      groups[1].items.push(moment);
    } else if (time >= weekAgo) {
      groups[2].items.push(moment);
    } else {
      groups[3].items.push(moment);
    }
  });

  return groups.filter((group) => group.items.length > 0);
}

function groupPatterns(patterns: SpendingPattern[]) {
  const byGroup = patterns.reduce<Record<string, SpendingPattern[]>>((acc, pattern) => {
    acc[pattern.group] = [...(acc[pattern.group] ?? []), pattern];
    return acc;
  }, {});

  return Object.entries(byGroup).map(([title, items]) => ({ title, items }));
}

function formatDate(key: string): string {
  return new Date(`${key}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
}

function dateKey(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function contextIcon(context: SpendingContext): keyof typeof Ionicons.glyphMap {
  if (context === "Meal") return "restaurant-outline";
  if (context === "Coffee") return "cafe-outline";
  if (context === "Transport") return "car-outline";
  if (context === "Groceries") return "basket-outline";
  if (context === "Bills") return "receipt-outline";
  if (context === "Treat") return "sparkles-outline";
  if (context === "Home") return "home-outline";
  return "ellipse-outline";
}

function patternIcon(tone: SpendingPattern["tone"]): keyof typeof Ionicons.glyphMap {
  if (tone === "notice") return "radio-button-on-outline";
  if (tone === "warm") return "sunny-outline";
  return "leaf-outline";
}

function patternColor(tone: SpendingPattern["tone"]): string {
  if (tone === "notice") return colors.blue;
  if (tone === "warm") return colors.amber;
  return colors.greenDark;
}

function patternStyle(tone: SpendingPattern["tone"]) {
  if (tone === "notice") return styles.patternNotice;
  if (tone === "warm") return styles.patternWarm;
  return styles.patternCalm;
}

const styles = StyleSheet.create({
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
  content: {
    flex: 1
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 112,
    gap: 18
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
  kicker: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  kickerDark: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  amountRow: {
    alignItems: "center",
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 70
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
  microLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  repeatChip: {
    backgroundColor: colors.mint,
    borderColor: "#c3e3cc",
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
    minHeight: 36,
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
  lastSavedPanel: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 14
  },
  lastSavedText: {
    flex: 1,
    gap: 3
  },
  lastSavedTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0
  },
  lastSavedActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  observationPanel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 8
  },
  heroPanel: {
    backgroundColor: colors.mint,
    borderColor: "#c3e3cc",
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
    gap: 8
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
  momentRow: {
    alignItems: "center",
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 68,
    padding: 14
  },
  momentRowCompact: {
    minHeight: 62
  },
  momentIcon: {
    alignItems: "center",
    backgroundColor: colors.mint,
    borderRadius: 8,
    height: 38,
    justifyContent: "center",
    width: 38
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
  memoryGroup: {
    gap: 8
  },
  groupTitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  rowActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
    paddingBottom: 12,
    paddingHorizontal: 14
  },
  textButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    minHeight: 32
  },
  textButtonLabel: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: "800"
  },
  deleteText: {
    color: colors.coral
  },
  editPanel: {
    backgroundColor: colors.canvas,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    gap: 10,
    padding: 14
  },
  editActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end"
  },
  patternGroup: {
    gap: 10
  },
  patternCard: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16
  },
  patternCalm: {
    backgroundColor: colors.surface,
    borderColor: colors.line
  },
  patternNotice: {
    backgroundColor: "#eef6fa",
    borderColor: "#cfe3ed"
  },
  patternWarm: {
    backgroundColor: "#fff8e8",
    borderColor: "#f3dfad"
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
  recapBlock: {
    borderTopColor: "rgba(24,32,28,0.08)",
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
  feedbackText: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: "800"
  },
  feedbackTextActive: {
    color: colors.surface
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
  dangerButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: "#f3c8c0",
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
  tabBar: {
    backgroundColor: "rgba(247, 248, 244, 0.96)",
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
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0
  },
  tabLabelActive: {
    color: colors.greenDark
  }
});
