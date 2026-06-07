import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../theme/styles/app";

const TAB_BAR_BODY_HEIGHT = 74;
const SCROLL_BOTTOM_BUFFER = 24;

export function useLayoutInsets() {
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const tabBarPaddingBottom = Math.max(insets.bottom, 10);
    const tabBarHeight = TAB_BAR_BODY_HEIGHT + tabBarPaddingBottom;
    const scrollContentStyle = [
      styles.scrollContent,
      { paddingBottom: tabBarHeight + SCROLL_BOTTOM_BUFFER }
    ];
    const tabBarStyle = [styles.tabBar, { paddingBottom: tabBarPaddingBottom }];

    return {
      scrollContentStyle,
      tabBarHeight,
      tabBarStyle
    };
  }, [insets.bottom]);
}