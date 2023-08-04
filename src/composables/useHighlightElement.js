import { getBaseStoreGetters } from "@/composables/useBaseStore";
import { computed, unref } from "vue";

export function useHighlightElement(elementName) {
  const { getNameHighlightElement } = getBaseStoreGetters([
    "getNameHighlightElement",
  ]);
  const isHighlightElement = computed(() => {
    return unref(elementName) === getNameHighlightElement.value;
  });

  return {
    isHighlightElement,
  };
}
