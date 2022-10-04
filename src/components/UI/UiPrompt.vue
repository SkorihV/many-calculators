<template>
  <div
    class="calc__prompt-wrapper"
    @mouseleave="hidden"
    v-if="hiddenPromptWrapper"
  >
    <div
      class="calc__prompt-button"
      @mouseenter="show"
      @click="show"
      ref="promptBtn"
    >
      &#63;
    </div>
    <transition name="popup">
      <div
        ref="popup"
        class="calc__prompt-popup-wrapper"
        :class="classPosition"
        :style="widthPopup"
        @mouseenter="show"
        v-show="isShow"
      >
        <div class="calc__prompt-popup-item" v-html="promptText" />
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "UiPrompt",
  props: {
    promptText: {
      type: String,
    },
    minWidthPopup: {
      type: [Number, String],
    },
  },
  data() {
    return {
      isShow: false,
      timerName: null,
      classPosition: null,
    };
  },
  methods: {
    show() {
      clearTimeout(this.timerName);
      this.isShow = true;
      this.checkPosition();
    },
    hidden() {
      this.timerName = setTimeout(() => (this.isShow = false), 500);
    },
    checkPosition() {
      setTimeout(() => {
        this.classPosition = null;
        const popupWidth = this.$refs.popup.offsetWidth;
        const promptBtnWidth = this.$refs.promptBtn.offsetWidth;
        const promptBtnCenter =
          this.$refs.promptBtn.getBoundingClientRect().left +
          promptBtnWidth / 2;

        const popupRightSide = promptBtnCenter + popupWidth / 2;
        const popupLeftSide = promptBtnCenter - popupWidth / 2;
        const docWidth = document.documentElement.clientWidth;

        if (popupRightSide > docWidth) {
          this.classPosition = "isLeft";
        } else if (popupLeftSide < 50) {
          this.classPosition = "isRight";
        }
      }, 10);
    },
  },
  computed: {
    widthPopup() {
      return this.minWidthPopup
        ? "min-width:" + this.minWidthPopup + "px;"
        : "";
    },
    hiddenPromptWrapper() {
      const text = this.promptText;
      return Boolean(text?.toString()?.trim().length);
    },
  },
};
</script>

<style scoped lang="scss"></style>
