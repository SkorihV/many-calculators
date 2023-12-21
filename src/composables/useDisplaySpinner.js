import { onBeforeMount, onMounted } from "vue";
import {useMountedListStore} from "@/store/mountedListStore";

export function useDisplaySpinner(elementName) {
  const mountedStore = useMountedListStore()

  onBeforeMount(() => {
    mountedStore.toggleElementIsMounted(elementName, false);
  });
  onMounted(() => {
    setTimeout(() => {
      mountedStore.toggleElementIsMounted(elementName, true);
    }, 200);
  });
}
