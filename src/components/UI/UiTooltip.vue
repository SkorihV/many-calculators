<template>
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
export default {
  name: "UiTooltip",
  inject: ["globalCanBeShownTooltip"],
  mounted() {
    this.checkPosition();
    window.addEventListener("resize", () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.checkPosition();
      }, 500);
    });
    // setTimeout(() => {
    //   this.$el.classList.add("isFlex");
    // }, 1000);
  },
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
  data() {
    return {
      resizeTimer: null,
      classPosition: null,
      width: null,
    };
  },
  methods: {
    checkPosition() {
      setTimeout(() => {
        if (this.$refs.tooltip) {
          this.classPosition = null;
          const parent = this.$parent.$el;
          const parentRightSide = parent?.getBoundingClientRect().right;
          const parentLeftSide = parent?.getBoundingClientRect().left;
          const parentWidth = parent?.offsetWidth;
          const docWidth = document.documentElement.clientWidth;
          this.classPosition =
            parentWidth > 400
              ? ""
              : docWidth - parentRightSide < 150
              ? "isLeft"
              : parentLeftSide < 150
              ? "isRight"
              : "";
        }
      }, 10);
    },
  },
  watch: {
    /**
     * Обновить позицию подсказки после инициализации отображения
     */
    isShow() {
      this.checkPosition();
    },
  },
  computed: {
    canBeShown() {
      return this.globalCanBeShownTooltip && this.localCanBeShown;
    },
  },
};
</script>

<style scoped lang="scss"></style>
