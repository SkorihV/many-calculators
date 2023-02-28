<template>
  <div
    @click.stop
    class="calc__prompt-wrapper"
    @mouseleave="hidden"
    v-if="hiddenPromptWrapper"
  >
    <div
      class="calc__prompt-button"
      :class="classes"
      @mouseenter="show"
      @click="show"
      ref="promptBtn"
    >
      &#63;
    </div>
  </div>
  <teleport to="#prompt-text-element">
    <transition name="prompt">
      <div
        class="prompt-wrapper"
        v-if="isShow"
        :style="topPopupWrapper"
        @click.stop
      >
        <div
          @mouseenter="show"
          @mouseleave="hidden"
          class="prompt-content"
          v-html="promptText"
        ></div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: "UiPrompt",
  props: {
    promptText: {
      type: String,
    },
    classes: {
      type: String
    }
  },
  data() {
    return {
      isShow: false,
      timerName: null,
      topCalcWrapper: null,
      topBtnPrompt: null,
    };
  },
  methods: {
    show() {
      clearTimeout(this.timerName);
      this.getTopForCalcWrapper();
      this.getTopBtnPrompt();
      this.isShow = true;
    },
    hidden() {
      this.timerName = setTimeout(() => (this.isShow = false), 500);
    },
    getTopForCalcWrapper() {
      this.topCalcWrapper =
        document
          .querySelector("#app-base-constructor-calculator")
          .getBoundingClientRect().top + window.pageYOffset;
    },
    getTopBtnPrompt() {
      this.topBtnPrompt = this.$refs.promptBtn.getBoundingClientRect().top;
    },
  },
  computed: {
    hiddenPromptWrapper() {
      const text = this.promptText;
      return Boolean(text?.toString()?.trim().length);
    },
    topPopupWrapper() {
      const btn = this.$refs.promptBtn.getBoundingClientRect();
      const btnCoordTop =
        this.topBtnPrompt -
        this.topCalcWrapper +
        window.pageYOffset +
        5 +
        btn.height;
      return `top: ${btnCoordTop}px;`;
    },
  },
};
</script>
