import React from "react";
import { BottomSheet, DeleteConfirmDialog } from "../../components";
import { formatString } from "../../i18n";
import { getMomentTitle } from "../../lib/analysis";
import { BreakdownFilterType } from "../../lib/breakdownDrilldown";
import { FinanceBreakdownRow } from "../../lib/financeEngine";
import { SpendingMoment } from "../spendingMemory.types";
import { MomentEditForm } from "../memory/MomentEditForm";
import { useActions } from "../../state/useFinance";
import { useTheme } from "../../hooks/useTheme";
import { CategoryBreakdownSheet } from "./CategoryBreakdownSheet";

type BreakdownDrilldownOverlaysProps = {
  breakdownType: BreakdownFilterType;
  editingMoment: SpendingMoment | null;
  moments: SpendingMoment[];
  onCloseEdit: () => void;
  onCloseRow: () => void;
  onEditMoment: (moment: SpendingMoment) => void;
  onSaved: () => void;
  pendingDeleteMoment: SpendingMoment | null;
  referenceDate: Date;
  selectedRow: FinanceBreakdownRow | null;
  setPendingDeleteMoment: (moment: SpendingMoment | null) => void;
};

export function BreakdownDrilldownOverlays({
  breakdownType,
  editingMoment,
  moments,
  onCloseEdit,
  onCloseRow,
  onEditMoment,
  onSaved,
  pendingDeleteMoment,
  referenceDate,
  selectedRow,
  setPendingDeleteMoment
}: BreakdownDrilldownOverlaysProps) {
  const { strings } = useTheme();
  const actions = useActions();

  return (
    <>
      <CategoryBreakdownSheet
        breakdownType={breakdownType}
        moments={moments}
        onClose={onCloseRow}
        onDeleteMoment={setPendingDeleteMoment}
        onEditMoment={onEditMoment}
        referenceDate={referenceDate}
        row={selectedRow}
        visible={Boolean(selectedRow)}
      />

      <BottomSheet
        onClose={onCloseEdit}
        title={
          editingMoment
            ? formatString(strings.activity.editSheetTitleNamed, { title: getMomentTitle(editingMoment) })
            : strings.activity.editSheetTitle
        }
        visible={Boolean(editingMoment)}
      >
        {editingMoment ? (
          <MomentEditForm
            key={editingMoment.id}
            moment={editingMoment}
            onCancel={onCloseEdit}
            onSaved={onSaved}
          />
        ) : null}
      </BottomSheet>

      <DeleteConfirmDialog
        body={
          pendingDeleteMoment
            ? formatString(strings.dialogs.activityDeleteBody, { title: getMomentTitle(pendingDeleteMoment) })
            : ""
        }
        onCancel={() => setPendingDeleteMoment(null)}
        onConfirm={() => {
          if (pendingDeleteMoment) {
            void actions.removeMoment(pendingDeleteMoment.id);
          }
          setPendingDeleteMoment(null);
        }}
        title={strings.dialogs.activityDeleteTitle}
        visible={Boolean(pendingDeleteMoment)}
      />
    </>
  );
}