import { onMounted, onUnmounted, unref } from "vue";

export const useEventListener = (target, event, callback) => {
  onMounted(() => unref(target).addEventListener(event, callback));
  onUnmounted(() => unref(target).addEventListener(event, callback));
}
