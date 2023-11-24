import { computed, onMounted, ref, watch } from "vue";
import { useEventListener } from "@/composables/useEventsListener";
import { initFuncForInterval } from "@/servises/UtilityServices";

/**
 * Получаем ширину элемента
 * @param elementIsShow
 * @param parentRef
 * @returns {{currentWidthElement: Ref<UnwrapRef<number>>, updatedCurrentWidth: updatedCurrentWidth}}
 */
export const getCurrentWidthElement = (elementIsShow, parentRef) => {
  const currentWidthElement = ref(980);
  const timerName = ref(null);

  useEventListener(window, "resize", resizeWidth);
  onMounted(() => {
    initFuncForInterval(updatedCurrentWidth, 3, )
  });

  function resizeWidth() {
    initFuncForInterval(updatedCurrentWidth, 3, )
  }
  function updatedCurrentWidth() {
    if (parentRef?.value && parentRef?.value?.offsetWidth !== 0) {
      currentWidthElement.value = parentRef?.value.offsetWidth;
      clearInterval(timerName.value);
    }
  }

  watch(
    () => elementIsShow.value,
    (newValue) => {
      if (newValue) {
        initFuncForInterval(updatedCurrentWidth, 10, )
      }
    }
  );

  return {
    currentWidthElement,
    updatedCurrentWidth,
  };
};

/**
 * Переключаем элемент в режим Колонка при достижении ширины элемента в 220px и в 350px если у него есть заголовок
 * @param currentWidthElement
 * @param isExistLabel
 * @returns {{isMakeElementColumn: ComputedRef<unknown>}}
 */
export const getIsMakeElementColumn = (currentWidthElement, isExistLabel) => {
  const isMakeElementColumn = computed(() => {
    return (
      (currentWidthElement?.value <= 350 && isExistLabel.value) ||
      currentWidthElement.value <= 220
    );
  });
  return {
    isMakeElementColumn,
  };
};
