import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { Appearance } from "react-native";
import { getStrings, type AppStrings, type Locale } from "../i18n";
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("system");
  const [locale, setLocaleState] = useState<Locale>("en");
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
      setSystemScheme(resolveScheme(storedScheme));
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
    void setLocalePreference(nextLocale);
  }, []);

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

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}