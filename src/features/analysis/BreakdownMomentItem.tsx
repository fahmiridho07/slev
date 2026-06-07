import React, { memo } from "react";
import { ListActionRow, MomentRow } from "../../components";
import { getMomentTitle } from "../../lib/analysis";
import { SpendingMoment } from "../spendingMemory.types";
import { useTheme } from "../../hooks/useTheme";

type BreakdownMomentItemProps = {
  moment: SpendingMoment;
  onDelete: (moment: SpendingMoment) => void;
  onStartEdit: (moment: SpendingMoment) => void;
};

function BreakdownMomentItemComponent({ moment, onDelete, onStartEdit }: BreakdownMomentItemProps) {
  const { strings } = useTheme();

  return (
    <ListActionRow
      accessibilityHint={strings.common.swipeToDelete}
      accessibilityLabel={getMomentTitle(moment)}
      onDelete={() => onDelete(moment)}
      onPress={() => onStartEdit(moment)}
    >
      <MomentRow moment={moment} />
    </ListActionRow>
  );
}

export const BreakdownMomentItem = memo(BreakdownMomentItemComponent);