<template>
  <transition name="tooltip-transition" v-cloak v-show="canBeShown">
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

<script>
import { ref, getCurrentInstance, watch, onMounted, computed } from "vue";
import { useBaseStore } from "@/store/piniaStore";

export default {
  name: "UiTooltip",
  props: {
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
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    /**
     *  Инициализирует возможность показа как таковую
     *  параметр зависит не от наличия ошибок в компоненте, а от сторонних параметров.
     */
    localCanBeShown: {
      type: Boolean,
    },
  },
  setup(props) {
    const store = useBaseStore();

    const resizeTimer = ref(null);
    const classPosition = ref(null);
    const tooltip = ref(null);

    const instance = getCurrentInstance();

    const checkPosition = () => {
      setTimeout(() => {
        if (tooltip) {
          classPosition.value = null;
          const parent = instance?.parent?.refs?.parent;
          if (!parent || parent.nodeType === 3) {
            return false;
          }

          const parentRightSide = parent?.getBoundingClientRect().right;
          const parentLeftSide = parent?.getBoundingClientRect().left;
          const parentWidth = parent?.offsetWidth;
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
    };

    /**
     * Обновить позицию подсказки после инициализации отображения
     */
    watch(
      () => props.isShow,
      (newValue) => {
        if (newValue !== undefined) {
          checkPosition();
        }
      }
    );

    /**
     * Отобразить
     * @type {ComputedRef<Boolean>}
     */
    const canBeShown = computed(() => {
      return (
        store.isCanShowAllTooltips &&
        props.localCanBeShown &&
        props.isShow &&
        props.tooltipText?.length
      );
    });

    onMounted(() => {
      checkPosition();
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer.value);
        resizeTimer.value = setTimeout(() => {
          checkPosition();
        }, 500);
      });
    });

    return {
      tooltip,
      classPosition,
      canBeShown,
    };
  },
};
</script>

<style scoped lang="scss"></style>
