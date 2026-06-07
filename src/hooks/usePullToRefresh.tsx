import { useCallback, useMemo, useState } from "react";
import { RefreshControl } from "react-native";
import { useActions } from "../state/useFinance";
import { useTheme } from "./useTheme";

export function usePullToRefresh() {
  const { colors, strings } = useTheme();
  const actions = useActions();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await actions.reloadOrNotify();
    } finally {
      setRefreshing(false);
    }
  }, [actions]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        accessibilityLabel={strings.common.pullToRefresh}
        colors={[colors.greenDark]}
        onRefresh={onRefresh}
        refreshing={refreshing}
        tintColor={colors.greenDark}
      />
    ),
    [colors.greenDark, onRefresh, refreshing, strings.common.pullToRefresh]
  );

  return { onRefresh, refreshControl, refreshing };
}