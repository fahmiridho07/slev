import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { AccessibilityInfo, ActivityIndicator, Appearance, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getStrings, setRuntimeLocale, type AppStrings, type Locale } from "../i18n";
import { darkColors, darkShadows, lightColors, lightShadows } from "./palettes";
import {
  detectDeviceLocale,
  getColorSchemePreference,
  getLocalePreference,
  getPaydayDayPreference,
  getReduceMotionPreference,
  getSpendBufferPreference,
  type ReduceMotionPreference,
  setColorSchemePreference,
  setLocalePreference,
  setPaydayDayPreference as persistPaydayDayPreference,
  setReduceMotionPreference as persistReduceMotionPreference,
  setSpendBufferPreference as persistSpendBufferPreference,
  UI_PREFERENCE_KEYS
} from "../services/uiPreferences";
import { createScreenStyles } from "./styles/app";
import { createComponentStyles } from "./styles/components";
import type { ColorScheme, ColorTokens, ShadowTokens } from "./types";

export type AppTheme = {
  colorScheme: ColorScheme;
  colors: ColorTokens;
  componentStyles: ReturnType<typeof createComponentStyles>;
  isDark: boolean;
  locale: Locale;
  reduceMotion: boolean;
  reduceMotionPreference: ReduceMotionPreference;
  resolvedScheme: "dark" | "light";
  paydayDayOfMonth: number | null;
  spendBuffer: number;
  setColorScheme: (scheme: ColorScheme) => void;
  setLocale: (locale: Locale) => void;
  setPaydayDay: (day: number | null) => void;
  setSpendBuffer: (amount: number) => void;
  setReduceMotionPreference: (preference: ReduceMotionPreference) => void;
  shadows: ShadowTokens;
  strings: AppStrings;
  styles: ReturnType<typeof createScreenStyles>;
};

export const ThemeContext = createContext<AppTheme | null>(null);

function resolveScheme(preference: ColorScheme): "dark" | "light" {
  if (preference === "system") {
    return Appearance.getColorScheme() === "dark" ? "dark" : "light";
  }
  return preference;
}

function paletteForScheme(scheme: "dark" | "light") {
  return scheme === "dark"
    ? { colors: darkColors, shadows: darkShadows }
    : { colors: lightColors, shadows: lightShadows };
}

function ThemeBootSplash() {
  const scheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
  const { colors } = paletteForScheme(scheme);
  const strings = getStrings(detectDeviceLocale());

  return (
    <SafeAreaView style={{ backgroundColor: colors.canvas, flex: 1 }}>
      <View
        accessibilityLabel={strings.boot.preparing}
        accessibilityRole="progressbar"
        style={{ alignItems: "center", flex: 1, gap: 12, justifyContent: "center", padding: 24 }}
      >
        <ActivityIndicator color={colors.greenDark} size="small" />
        <Text style={{ color: colors.muted, fontSize: 14, letterSpacing: 0, textAlign: "center" }}>
          {strings.boot.preparing}
        </Text>
      </View>
    </SafeAreaView>
  );
}

function resolveReduceMotion(
  preference: ReduceMotionPreference,
  systemReduceMotion: boolean
): boolean {
  if (preference === "on") {
    return true;
  }
  if (preference === "off") {
    return false;
  }
  return systemReduceMotion;
}

type ThemeProviderProps = {
  children: React.ReactNode;
  onPreferenceWriteFailure?: (storageKey: string) => void;
};

export function ThemeProvider({ children, onPreferenceWriteFailure }: ThemeProviderProps) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("system");
  const [locale, setLocaleState] = useState<Locale>("en");
  const [reduceMotionPreference, setReduceMotionPreferenceState] =
    useState<ReduceMotionPreference>("system");
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  const [paydayDayOfMonth, setPaydayDayState] = useState<number | null>(null);
  const [spendBuffer, setSpendBufferState] = useState<number>(0);
  const [prefsReady, setPrefsReady] = useState(false);
  const [systemScheme, setSystemScheme] = useState<"dark" | "light">(resolveScheme("system"));

  useEffect(() => {
    let active = true;
    void (async () => {
      const [storedScheme, storedLocale, storedReduceMotion, storedPayday, storedBuffer, reduceMotionEnabled] =
        await Promise.all([
          getColorSchemePreference(),
          getLocalePreference(),
          getReduceMotionPreference(),
          getPaydayDayPreference(),
          getSpendBufferPreference(),
          AccessibilityInfo.isReduceMotionEnabled()
        ]);
      if (!active) {
        return;
      }
      setColorSchemeState(storedScheme);
      setLocaleState(storedLocale);
      setReduceMotionPreferenceState(storedReduceMotion);
      setPaydayDayState(storedPayday);
      setSpendBufferState(storedBuffer);
      setSystemReduceMotion(reduceMotionEnabled);
      setRuntimeLocale(storedLocale);
      setSystemScheme(resolveScheme(storedScheme));
      setPrefsReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: nextScheme }) => {
      setSystemScheme(nextScheme === "dark" ? "dark" : "light");
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled) => {
      setSystemReduceMotion(enabled);
    });
    return () => subscription.remove();
  }, []);

  const resolvedScheme = colorScheme === "system" ? systemScheme : colorScheme;
  const isDark = resolvedScheme === "dark";
  const reduceMotion = resolveReduceMotion(reduceMotionPreference, systemReduceMotion);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    const previous = colorScheme;
    setColorSchemeState(scheme);
    setSystemScheme(resolveScheme(scheme));
    void setColorSchemePreference(scheme).then((persisted) => {
      if (persisted) {
        return;
      }
      setColorSchemeState(previous);
      setSystemScheme(resolveScheme(previous));
      onPreferenceWriteFailure?.(UI_PREFERENCE_KEYS.colorScheme);
    });
  }, [colorScheme, onPreferenceWriteFailure]);

  const setLocale = useCallback((nextLocale: Locale) => {
    const previous = locale;
    setLocaleState(nextLocale);
    setRuntimeLocale(nextLocale);
    void setLocalePreference(nextLocale).then((persisted) => {
      if (persisted) {
        return;
      }
      setLocaleState(previous);
      setRuntimeLocale(previous);
      onPreferenceWriteFailure?.(UI_PREFERENCE_KEYS.locale);
    });
  }, [locale, onPreferenceWriteFailure]);

  const setReduceMotionPreference = useCallback((preference: ReduceMotionPreference) => {
    const previous = reduceMotionPreference;
    setReduceMotionPreferenceState(preference);
    void persistReduceMotionPreference(preference).then((persisted) => {
      if (persisted) {
        return;
      }
      setReduceMotionPreferenceState(previous);
      onPreferenceWriteFailure?.(UI_PREFERENCE_KEYS.reduceMotion);
    });
  }, [onPreferenceWriteFailure, reduceMotionPreference]);

  const setPaydayDay = useCallback((day: number | null) => {
    const previous = paydayDayOfMonth;
    setPaydayDayState(day);
    void persistPaydayDayPreference(day).then((persisted) => {
      if (persisted) {
        return;
      }
      setPaydayDayState(previous);
      onPreferenceWriteFailure?.(UI_PREFERENCE_KEYS.paydayDay);
    });
  }, [onPreferenceWriteFailure, paydayDayOfMonth]);

  const setSpendBuffer = useCallback((amount: number) => {
    const previous = spendBuffer;
    setSpendBufferState(amount);
    void persistSpendBufferPreference(amount).then((persisted) => {
      if (persisted) {
        return;
      }
      setSpendBufferState(previous);
      onPreferenceWriteFailure?.(UI_PREFERENCE_KEYS.spendBuffer);
    });
  }, [onPreferenceWriteFailure, spendBuffer]);

  useEffect(() => {
    setRuntimeLocale(locale);
  }, [locale]);

  const theme = useMemo<AppTheme>(() => {
    const { colors, shadows } = paletteForScheme(resolvedScheme);
    const componentStyles = createComponentStyles(colors, shadows);
    const styles = createScreenStyles(colors, shadows);
    const strings = getStrings(locale);

    return {
      colorScheme,
      colors,
      componentStyles,
      isDark,
      locale,
      paydayDayOfMonth,
      spendBuffer,
      reduceMotion,
      reduceMotionPreference,
      resolvedScheme,
      setColorScheme,
      setLocale,
      setPaydayDay,
      setSpendBuffer,
      setReduceMotionPreference,
      shadows,
      strings,
      styles
    };
  }, [
    colorScheme,
    isDark,
    locale,
    paydayDayOfMonth,
    spendBuffer,
    reduceMotion,
    reduceMotionPreference,
    resolvedScheme,
    setColorScheme,
    setLocale,
    setPaydayDay,
    setSpendBuffer,
    setReduceMotionPreference
  ]);

  if (!prefsReady) {
    return <ThemeBootSplash />;
  }

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}