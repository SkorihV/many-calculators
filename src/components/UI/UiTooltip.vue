<template>
  {{localCanBeShown}}
  {{isShow}}
  {{isCanShowAllTooltips}}
  <transition
    name="tooltip-transition"
    v-cloak
    v-show="isShow && tooltipText && canBeShown"
  >
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
import { mapGetters, useStore } from "vuex";
import {ref, onMounted, getCurrentInstance, watch, computed, reactive} from "vue";

export default {
  name: "UiTooltip",
  // mounted() {
  //   this.checkPosition();
  //   window.addEventListener("resize", () => {
  //     clearTimeout(this.resizeTimer);
  //     this.resizeTimer = setTimeout(() => {
  //       this.checkPosition();
  //     }, 500);
  //   });
  // },
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
  setup({isShow, localCanBeShown}, context) {
    const store = useStore();
    const resizeTimer = ref(null);
    const classPosition = ref('');
    const tooltip = ref(null);
    const isCanShowAllTooltips = computed(() => store.getters.isCanShowAllTooltips);
    const instance = getCurrentInstance();

    onMounted(() => {
      checkPosition();
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer.value);
        resizeTimer.value = setTimeout(() => {
          checkPosition();
        }, 500);
      });
    })

    const checkPosition = () => {
      setTimeout(() => {
        if (tooltip.value) {
          classPosition.value = null;

          const parent = instance.parent.refs.parent;
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
    }

    watch(() => isShow , () => {
        checkPosition();
    })

    const canBeShown = computed(() => {
      console.log(isShow);
      return isCanShowAllTooltips.value && localCanBeShown;
    })

    return {
      tooltip,
      canBeShown,
      classPosition,
      isCanShowAllTooltips
    }
  },

  // data() {
  //   return {
  //     resizeTimer: null,
  //     classPosition: null,
  //     width: null,
  //   };
  // },
  // methods: {
  //   checkPosition() {
  //     setTimeout(() => {
  //       if (this.$refs.tooltip) {
  //         this.classPosition = null;
  //         const parent = this.$parent.$el;
  //         if (!parent || parent.nodeType === 3) {
  //           return false;
  //         }
  //         const parentRightSide = parent?.getBoundingClientRect().right;
  //         const parentLeftSide = parent?.getBoundingClientRect().left;
  //         const parentWidth = parent?.offsetWidth;
  //         const docWidth = document.documentElement.clientWidth;
  //         this.classPosition =
  //           parentWidth > 400
  //             ? ""
  //             : docWidth - parentRightSide < 150
  //             ? "isLeft"
  //             : parentLeftSide < 150
  //             ? "isRight"
  //             : "";
  //       }
  //     }, 10);
  //   },
  // },
  // watch: {
  //   /**
  //    * Обновить позицию подсказки после инициализации отображения
  //    */
  //   isShow() {
  //     this.checkPosition();
  //   },
  // },
  // computed: {
  //   ...mapGetters(["isCanShowAllTooltips"]),
  //   canBeShown() {
  //     return this.isCanShowAllTooltips && this.localCanBeShown;
  //   },
  // },
};
</script>

<style scoped lang="scss"></style>
