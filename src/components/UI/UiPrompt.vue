<template>
  <div class="calc__prompt-wrapper" @mouseleave="hidden" v-if="promptText">
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
        class="calc__prompt-popup-wrapper"
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
  },
  data() {
    return {
      isShow: false,
      timerName: null,
    };
  },
  methods: {
    show() {
      clearTimeout(this.timerName);
      this.isShow = true;
    },
    hidden() {
      this.timerName = setTimeout(() => (this.isShow = false), 500);
    },
  },
};
</script>

<style scoped lang="scss"></style>
