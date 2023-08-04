import { onBeforeMount, onMounted } from "vue";
import {useBaseStore} from "@/store/piniaStore";

export function useDisplaySpinner(elementName) {
  const baseStore = useBaseStore()

  onBeforeMount(() => {
    baseStore.tryToggleElementIsMounted(elementName, false);
  });
  onMounted(() => {
    setTimeout(() => {
      baseStore.tryToggleElementIsMounted(elementName, true);
    }, 200);
  });
}
