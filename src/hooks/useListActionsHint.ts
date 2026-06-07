import { useCallback, useEffect, useState } from "react";
import { hasSeenListActionsHint, ListActionsHintKey, markListActionsHintSeen } from "../services/uiPreferences";

export function useListActionsHint(key: ListActionsHintKey, enabled: boolean) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }

    let active = true;
    void (async () => {
      const seen = await hasSeenListActionsHint(key);
      if (active) {
        setVisible(!seen);
      }
    })();

    return () => {
      active = false;
    };
  }, [enabled, key]);

  const dismiss = useCallback(() => {
    setVisible(false);
    void markListActionsHintSeen(key);
  }, [key]);

  return { dismiss, visible };
}