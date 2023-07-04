import { unref } from "vue";

export function useCheckedValueMinMax(min, max) {
  let localMin = unref(min);
  let localMax = unref(max);
  function checkValidValueReturnNumber(checkedValue) {
    let localCheckedValue = unref(checkedValue);
    let value = !isNaN(parseFloat(localCheckedValue))
      ? parseFloat(localCheckedValue)
      : null;

    if (value > localMax) {
      value = localMax;
    }

    if (value < localMin) {
      value = localMin;
    }
    return value;
  }
  return {
    checkValidValueReturnNumber,
  };
}
