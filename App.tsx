import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppRoot } from "./src/AppRoot";
import { getWriteFailureToast } from "./src/i18n";
import { FinanceProvider, useActions } from "./src/state";
import { ThemeProvider } from "./src/theme/ThemeProvider";

function AppShell() {
  const actions = useActions();

  return (
    <ThemeProvider
      onPreferenceWriteFailure={(storageKey) => {
        actions.setMessage(getWriteFailureToast(storageKey));
      }}
    >
      <AppRoot />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <FinanceProvider>
        <AppShell />
      </FinanceProvider>
    </SafeAreaProvider>
  );
}