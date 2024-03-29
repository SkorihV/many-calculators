<script setup>
import { defineProps, onMounted, ref, watch, computed } from "vue";
import {useBaseStore} from "@/store/baseStore";
import {storeToRefs} from "pinia";
import { isBoolean } from "@/validators/validators";
import { useEventListener } from "@/composables/useEventsListener";
import { getParent } from "@/composables/useInstance";

const baseStore = useBaseStore()
const baseStoreRefs = storeToRefs(baseStore)
const { isCanShowAllTooltips, isTooltipOn } = baseStoreRefs;
const props = defineProps({
  /**
   * Текст ошибки
   */
  tooltipText: {
    type: String,
    default: null,
  },
  /**
   * Динамический параметр зависит от наличия ошибок в компоненте
   */
  isShow: {
    type: [Boolean, Number],
    validator: isBoolean,
  },
  /**
   *  Инициализирует возможность показа как таковую
   *  параметр зависит не от наличия ошибок в компоненте, а от сторонних параметров.
   */
  localCanBeShown: {
    type: Boolean,
  },
});
let parentRef = ref(null)
onMounted(() => {
  parentRef.value = getParent();
})

onMounted(checkPosition);
useEventListener(window, "resize", resize);

const classPosition = ref(null);
const tooltip = ref(null);
function checkPosition() {
  setTimeout(() => {
    if (tooltip.value) {
      classPosition.value = null;

      if (!parentRef?.value || parentRef?.value.nodeType === 3) {
        return false;
      }
      const parentRightSide = parentRef?.value?.getBoundingClientRect().right;
      const parentLeftSide = parentRef?.value?.getBoundingClientRect().left;
      const parentWidth = parentRef?.value?.offsetWidth;
      const docWidth = document.documentElement.clientWidth;
      classPosition.value =
        parentWidth > 400
          ? ""
          : docWidth - parentRightSide < 150
          ? "isLeft"
          : parentLeftSide < 150
          ? "isRight"
          : "";
    }
  }, 10);
}

const resizeTimer = ref(null);
function resize() {
  clearTimeout(resizeTimer.value);
  resizeTimer.value = setTimeout(() => {
    checkPosition();
  }, 500);
}

/**
 * Обновить позицию подсказки после инициализации отображения
 */
watch(() => props.isShow, checkPosition);

const canBeShown = computed(() => {
  return isCanShowAllTooltips.value || props.localCanBeShown;
});

const showTooltip = computed(() => {
  return (
    props.isShow &&
    props.tooltipText?.length &&
    canBeShown.value &&
    isTooltipOn.value
  );
});
</script>

<template>
  <transition name="tooltip-transition" v-cloak v-show="showTooltip">
    <div
      class="calc__tooltip calc__tooltip-wrapper"
      ref="tooltip"
      :class="classPosition"
    >
      <div class="calc__tooltip-text">{{ tooltipText }}</div>
      <div class="calc__tooltip-decor"></div>
    </div>
  </transition>
</template>
