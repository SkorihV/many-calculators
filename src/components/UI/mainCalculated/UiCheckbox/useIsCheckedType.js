import { computed } from "vue";

export function useIsCheckedType(type) {
  const checkboxType = computed(() => {
    return type ? type : "base";
  })
  const isButton = computed(() => {
    return checkboxType.value === "button";
  })
  const isSwitcher = computed(() => {
    return checkboxType.value === "switcher";
  })
  const isBase = computed(() => {
    return checkboxType.value === "base";
  })
  const isSwitcherVertical = computed(() => {
    return checkboxType.value === "switcher-vertical";
  })

  return {
    isButton,
    isSwitcher,
    isBase,
    isSwitcherVertical
  }
}
