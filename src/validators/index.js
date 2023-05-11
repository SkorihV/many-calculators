export const isBoolean = (value) => {
  return value === false || value === true || value === 0 || value === 1;
}

export const isNotNaN = (value) => {
  return !isNaN(Number(value));
}

