import { computed, unref } from "vue";
import {useBaseStore} from "@/store/baseStore";
import {storeToRefs} from "pinia";

export function useHighlightElement(elementName) {
  const baseStoreRefs = storeToRefs(useBaseStore())

  const { getNameHighlightElement } = baseStoreRefs;
  const isHighlightElement = computed(() => {
    return unref(elementName) === getNameHighlightElement.value;
  });

  return {
    isHighlightElement,
  };
}
