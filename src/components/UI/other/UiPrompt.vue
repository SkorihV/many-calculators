<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  promptText: {
    type: String,
  },
  classes: {
    type: String,
  },
});

const isShow = ref(false);
const promptBtn = ref(null);
const timerName = ref(null);
const topBtnPrompt = ref(null);
const topCalcWrapper = ref(null);

const hiddenPromptWrapper = computed(() => {
  const text = props.promptText;
  return Boolean(text?.toString()?.trim().length);
});

const topPopupWrapper = computed(() => {
  const btn = promptBtn.value?.getBoundingClientRect();
  const btnCoordTop =
    topBtnPrompt.value -
    topCalcWrapper.value +
    window.pageYOffset +
    5 +
    btn.height;
  return `top: ${btnCoordTop}px;`;
});

function show() {
  clearTimeout(timerName.value);
  getTopForCalcWrapper();
  getTopBtnPrompt();
  isShow.value = true;
}
function hidden() {
  timerName.value = setTimeout(() => (isShow.value = false), 500);
}
function getTopForCalcWrapper() {
  topCalcWrapper.value =
    document.querySelector("#App_calc").getBoundingClientRect().top +
    window.pageYOffset;
}
function getTopBtnPrompt() {
  topBtnPrompt.value = promptBtn.value?.getBoundingClientRect().top;
}
</script>

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
