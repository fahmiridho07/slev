import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppRoot } from "./src/AppRoot";
import { FinanceProvider } from "./src/state";

export default function App() {
  return (
    <SafeAreaProvider>
      <FinanceProvider>
        <AppRoot />
      </FinanceProvider>
    </SafeAreaProvider>
  );
}