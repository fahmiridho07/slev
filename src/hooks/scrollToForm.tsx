import React, { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { findNodeHandle, ScrollView, View } from "react-native";

type ScrollToFormContextValue = {
  registerAnchor: (ref: View | null) => void;
  scrollToForm: () => void;
};

const ScrollToFormContext = createContext<ScrollToFormContextValue | null>(null);

export function ScrollToFormProvider({
  children,
  scrollRef
}: {
  children: React.ReactNode;
  scrollRef: React.RefObject<ScrollView | null>;
}) {
  const anchorRef = useRef<View | null>(null);

  const registerAnchor = useCallback((ref: View | null) => {
    anchorRef.current = ref;
  }, []);

  const scrollToForm = useCallback(() => {
    const scroll = scrollRef.current;
    const anchor = anchorRef.current;
    if (!scroll || !anchor) {
      return;
    }

    const scrollHandle = findNodeHandle(scroll);
    if (!scrollHandle) {
      return;
    }

    anchor.measureLayout(
      scrollHandle,
      (_x, y) => {
        scroll.scrollTo({ y: Math.max(0, y - 12), animated: true });
      },
      () => {}
    );
  }, [scrollRef]);

  return (
    <ScrollToFormContext.Provider value={{ registerAnchor, scrollToForm }}>
      {children}
    </ScrollToFormContext.Provider>
  );
}

export function FormScrollAnchor({ children }: { children: React.ReactNode }) {
  const context = useContext(ScrollToFormContext);
  const viewRef = useRef<View>(null);

  useEffect(() => {
    context?.registerAnchor(viewRef.current);
    return () => context?.registerAnchor(null);
  }, [context]);

  return (
    <View ref={viewRef} collapsable={false}>
      {children}
    </View>
  );
}

export function useScrollToForm() {
  const context = useContext(ScrollToFormContext);
  return context?.scrollToForm ?? (() => {});
}