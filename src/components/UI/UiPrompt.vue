<template>
  <div
    @click.stop
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
  </div>
  <teleport to="#prompt-text-element">
    <transition name="prompt">
      <div class="prompt-wrapper" v-if="isShow" :style="topPopupWrapper">
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
import { computed, ref } from "vue";

export default {
  name: "UiPrompt",
  props: {
    promptText: {
      type: String,
    },
  },
  setup(props) {
    const isShow = ref(false);
    const timerName = ref(null);
    const topCalcWrapper = ref(null);
    const topBtnPrompt = ref(null);
    const promptBtn = ref(null);

    const show = () => {
      clearTimeout(timerName.value);
      getTopForCalcWrapper();
      getTopBtnPrompt();
      isShow.value = true;
    };
    const hidden = () => {
      timerName.value = setTimeout(() => (isShow.value = false), 500);
    };
    const getTopForCalcWrapper = () => {
      topCalcWrapper.value =
        document
          .querySelector("#app-base-constructor-calculator")
          .getBoundingClientRect().top + window.pageYOffset;
    };
    const getTopBtnPrompt = () => {
      topBtnPrompt.value = promptBtn.value.getBoundingClientRect().top;
    };

    const hiddenPromptWrapper = computed(() => {
      const text = props.promptText;
      return Boolean(text?.toString()?.trim().length);
    });

    const topPopupWrapper = computed(() => {
      const btn = promptBtn.value.getBoundingClientRect();
      const btnCoordTop =
        topBtnPrompt.value -
        topCalcWrapper.value +
        window.pageYOffset +
        5 +
        btn.height;
      return `top: ${btnCoordTop}px;`;
    });

    return {
      promptBtn,
      isShow,
      topPopupWrapper,
      hiddenPromptWrapper,

      hidden,
      show,
    };
  },
};
</script>

<style scoped lang="scss"></style>
