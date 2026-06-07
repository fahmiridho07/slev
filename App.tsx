import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppRoot } from "./src/AppRoot";
import { FinanceProvider } from "./src/state";
import { ThemeProvider } from "./src/theme/ThemeProvider";

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FinanceProvider>
          <AppRoot />
        </FinanceProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}