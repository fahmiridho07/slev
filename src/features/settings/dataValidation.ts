import { getBackupInvalidJsonToast } from "../../i18n";
import { FormValidationError } from "../../lib/formValidation";

export type ImportFieldError = "importJson";

export function getImportJsonValidationError(jsonText: string): FormValidationError<ImportFieldError> | null {
  if (!jsonText.trim()) {
    return { field: "importJson", message: getBackupInvalidJsonToast() };
  }

  try {
    JSON.parse(jsonText);
    return null;
  } catch {
    return { field: "importJson", message: getBackupInvalidJsonToast() };
  }
}