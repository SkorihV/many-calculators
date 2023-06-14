import { REGEXP_NUMBERS, REGEXP_QUOTES_AND_SPACE_AND_WORD, REGEXP_SIGN, REGEXP_VARIABLE } from "@/constants/regexp";
import { LIST_BANNED_ELEMENTS_NAME } from "@/constants/localData";

export const isBoolean = (value) => {
  return value === false || value === true || value === 0 || value === 1;
};

export const isNotNaN = (value) => {
  return !isNaN(Number(value));
};


export const isSign = (sign) => {
  return sign.toString().trim().match(REGEXP_SIGN) !== null
}

export const isNumber = (number) => {
  return number.toString().trim().match(REGEXP_NUMBERS) !== null
}

export const isVariable = (variable) => {
  return variable.toString().trim().match(REGEXP_VARIABLE) !== null && isNotNull(variable) && !isSpecSymbol(variable)
}

export const isValueOnElement = (text) => {
  return text.toString().trim().match(REGEXP_QUOTES_AND_SPACE_AND_WORD) !== null
}

export const isNotNull = (data) => {
  return data?.toString().trim() !== "null" && data !== null
}

export const isSpecSymbol = (data) => {
  return ["true","false",].includes(data)
}
