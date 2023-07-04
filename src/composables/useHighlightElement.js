import { getBaseStoreGetters } from "@/composables/useBaseStore";
import { computed } from "vue";

export function useHighlightElement(elementName) {
  const {getNameHighlightElement} = getBaseStoreGetters(['getNameHighlightElement'])
  const isHighlightElement = computed(() => {
    return elementName.value === getNameHighlightElement.value
  })

  return {
    isHighlightElement
  }
}
