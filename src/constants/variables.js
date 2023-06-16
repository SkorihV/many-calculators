
export const NAME_RESERVED_VARIABLE_SUM = "_otherSum_"
export const NAME_RESERVED_VARIABLE_GLOBAL_SUM = "_globalSum_"
export const LIST_BANNED_ELEMENTS_NAME = [
  NAME_RESERVED_VARIABLE_SUM,
  NAME_RESERVED_VARIABLE_GLOBAL_SUM,
  "_self_",
  "true",
  "false",
  "empty",
]
export const EXCEPTION_VARIABLES_IN_FORMULA = [
  "-",
  "+",
  "/",
  "*",
  "(",
  ")",
  "!==",
  "!=",
  "=",
  ">=",
  "<=",
  "<",
  ">",
  "==",
  "===",
  "||",
  "&&",
  "_otherSum_",
  "_self_",
  "_globalSum_",
  "true",
  "false",
  "empty",
  "null",
]

export const SPEC_SYMBOLS = Object.entries({
  "&gt;": ">",
  "&lt;": "<",
  "&amp;": "&",
  "&quot;": '"',
})


export const ERROR_PADDING = "ОшибкаЗаполнения";
export const ERROR_ELEMENT_IS_NOT_EXIST = "ЭлементаСТакимИменемНеСуществует";
