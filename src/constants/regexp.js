export const REGEXP_HTML_TAG = /<\/?[a-z][^>]*(>|$)/gi;

export const REGEXP_VARIABLE = /^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё0-9_]*$/;
export const REGEXP_SIGN = /^(\)|\(|>=|<=|<|>|!==|===|==|&&|\|\||\+|-|\/|\*)$/;
export const REGEXP_NUMBERS = /\b[-+]?(?![A-Za-zА-Яа-яЁё0-9])\d+(\.\d*|,\d*)?\b/g;

/**
 * Десятичные числа включая дороби
 * @type {RegExp}
 */
export const REGEXP_NUMBER_ON_COMMA = /\b(\d+(,\d+)?)\b/g

export const REGEXP_VARIABLE_SIGN_NUMBERS =
  /([A-Za-zА-Яа-яЁё0-9_.,"']*)(\)|\(|>=|<=|<|>|!==|===|==|&&|\|\||\+|-|\/|\*)([0-9]*(\.|,[0-9])*)/g;

//([A-Za-zА-Яа-яЁё0-9_]*)(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)([0-9]*(\.[0-9])*)
//([A-Za-zА-Яа-яЁё0-9_]*)(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)([0-9]*(\.[0-9])*)/g

/**
 * находим все пробелы даже внутри текста
 * @type {RegExp}
 */
export const REGEXP_SPACES_IN_AROUND = /^\s*|\s*$/g;
export const REGEXP_SPACES = /\s/g;
export const REGEXP_QUOTES_AND_WORD = /^('|").*('|")$/;

/**
 * Поиск одинарных и двойных кавычек с учетом различного количества пробелов
 * @type {RegExp}
 */
export const REGEXP_QUOTES_AND_SPACE_AND_WORD = /^('|")\s*|\s*('|")$/g;

export const REGEXP_ELEMENT_VALUE_AS_WORLD = /^('|"|[0-9])\s*|\s*('|")$/g;
export const REGEXP_STRING_SPLIT_FORMULA =
  /(\)|\(|>=|<=|<|>|!==|===|==|&&|\|\||\+|-|\/|\*)|([0-9]*(\.[0-9])*)/;

export const REGEXP_VARIABLE_IN_TEXT_RESULT_COST = /\$\$_?[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё0-9_]*_?\$\$/g
export const REGEXP_VARIABLE_IN_TEXT_DEPENDENCY_VALUE = /{{_?[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё0-9_]*_?}}/g


export const REGEXP_QUOTES_FOR_VALUE = /{{|}}/g
export const REGEXP_QUOTES_FOR_COST = /\$\$/g
