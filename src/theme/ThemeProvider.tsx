import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Appearance, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getStrings, setRuntimeLocale, type AppStrings, type Locale } from "../i18n";
import { darkColors, darkShadows, lightColors, lightShadows } from "./palettes";
import {
  getColorSchemePreference,
  getLocalePreference,
  setColorSchemePreference,
  setLocalePreference
} from "../services/uiPreferences";
import { createAppStyles } from "./styles/app";
import { createComponentStyles } from "./styles/components";
import type { ColorScheme, ColorTokens, ShadowTokens } from "./types";

export type AppTheme = {
  colorScheme: ColorScheme;
  colors: ColorTokens;
  componentStyles: ReturnType<typeof createComponentStyles>;
  isDark: boolean;
  locale: Locale;
  resolvedScheme: "dark" | "light";
  setColorScheme: (scheme: ColorScheme) => void;
  setLocale: (locale: Locale) => void;
  shadows: ShadowTokens;
  strings: AppStrings;
  styles: ReturnType<typeof createAppStyles>;
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
  const strings = getStrings("en");

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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("system");
  const [locale, setLocaleState] = useState<Locale>("en");
  const [prefsReady, setPrefsReady] = useState(false);
  const [systemScheme, setSystemScheme] = useState<"dark" | "light">(resolveScheme("system"));

  useEffect(() => {
    let active = true;
    void (async () => {
      const [storedScheme, storedLocale] = await Promise.all([
        getColorSchemePreference(),
        getLocalePreference()
      ]);
      if (!active) {
        return;
      }
      setColorSchemeState(storedScheme);
      setLocaleState(storedLocale);
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

  const resolvedScheme = colorScheme === "system" ? systemScheme : colorScheme;
  const isDark = resolvedScheme === "dark";

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    setSystemScheme(resolveScheme(scheme));
    void setColorSchemePreference(scheme);
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    setRuntimeLocale(nextLocale);
    void setLocalePreference(nextLocale);
  }, []);

  useEffect(() => {
    setRuntimeLocale(locale);
  }, [locale]);

  const theme = useMemo<AppTheme>(() => {
    const { colors, shadows } = paletteForScheme(resolvedScheme);
    const componentStyles = createComponentStyles(colors, shadows);
    const styles = createAppStyles(colors, shadows);
    const strings = getStrings(locale);

    return {
      colorScheme,
      colors,
      componentStyles,
      isDark,
      locale,
      resolvedScheme,
      setColorScheme,
      setLocale,
      shadows,
      strings,
      styles
    };
  }, [colorScheme, isDark, locale, resolvedScheme, setColorScheme, setLocale]);

  if (!prefsReady) {
    return <ThemeBootSplash />;
  }

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}