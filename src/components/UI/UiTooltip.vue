<template>
  <transition name="tooltip-transition" v-cloak v-show="isShow && tooltipText">
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
  mounted() {
    this.checkPosition();
    window.addEventListener("resize", () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.checkPosition();
      }, 500);
    });
    setTimeout(() => {
      this.$el.classList.add("isFlex");
    }, 100);
  },
  props: {
    tooltipText: {
      type: String,
      default: null,
    },
    isShow: {
      type: [Boolean, Number],
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
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
          const parentRightSide = parent.getBoundingClientRect().right;
          const parentLeftSide = parent.getBoundingClientRect().left;
          const parentWidth = parent.offsetWidth;
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
    isShow() {
      this.checkPosition();
    },
  },
};
</script>

<style scoped lang="scss"></style>
