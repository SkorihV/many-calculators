import { unref } from "vue";

export function useCheckedValueMinMax(min, max) {
  let localMin = parseFloat(unref(min));
  let localMax = parseFloat(unref(max));

  /**
   *
   * @param checkedValue
   * @returns {number}
   */
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
