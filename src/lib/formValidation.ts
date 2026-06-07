export type FormValidationError<TField extends string = string> = {
  field: TField;
  message: string;
};

export type FormActionResult<TField extends string = string> =
  | { ok: true }
  | { ok: false; validation?: FormValidationError<TField> };