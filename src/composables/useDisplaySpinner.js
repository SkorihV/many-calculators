import { onBeforeMount, onMounted } from "vue";
import { getBaseStoreAction } from "@/composables/useBaseStore";

export function useDisplaySpinner(elementName) {
  const { tryToggleElementIsMounted } = getBaseStoreAction([
    "tryToggleElementIsMounted",
  ]);
  onBeforeMount(() => {
    tryToggleElementIsMounted(elementName, false);
  });
  onMounted(() => {
    setTimeout(() => {
      tryToggleElementIsMounted(elementName, true);
    }, 200);
  });
}
