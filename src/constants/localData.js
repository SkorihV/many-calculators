export const IS_LOCAL = window.location.hostname === "localhost";
export const LOCAL_PATH_DATA = "http://localhost:5000/test-test";
export const LOCAL_PATH_OPTIONS = "http://localhost:5000/calculator-options";
export const LIST_BANNED_ELEMENTS_NAME = [
  "_otherSum_",
  "_globalSum_",
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


