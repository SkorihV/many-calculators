export const REGEXP_HTML_TAG = /<\/?[a-z][^>]*(>|$)/gi;

export const REGEXP_VARIABLE =/^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё0-9_]*$/;
export const REGEXP_SIGN = /^(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)$/;
export const REGEXP_NUMBERS = /([0-9]*(\\.[0-9])*)/

export const REGEXP_VARIABLE_SIGN_NUMBERS = /([A-Za-zА-Яа-яЁё0-9_.,"']*)(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)([0-9]*(\.[0-9])*)/g

//([A-Za-zА-Яа-яЁё0-9_]*)(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)([0-9]*(\.[0-9])*)
//([A-Za-zА-Яа-яЁё0-9_]*)(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)([0-9]*(\.[0-9])*)/g


export const REGEXP_SPACES_IN_AROUND = /^\s*|\s*$/g;
export const REGEXP_SPACES = /\s/g;
export const REGEXP_QUOTES_AND_WORD = /^('|").*('|")$/;
export const REGEXP_QUOTES_AND_SPACE_AND_WORD = /^('|")\s*|\s*('|")$/g;

export const REGEXP_ELEMENT_VALUE_AS_WORLD = /^('|"|[0-9])\s*|\s*('|")$/g;
export const REGEXP_STRING_SPLIT_FORMULA = /(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)|([0-9]*(\.[0-9])*)/;
