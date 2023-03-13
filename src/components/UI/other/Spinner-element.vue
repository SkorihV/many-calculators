<template>
  <div class="calc__spinner-wrapper" v-if="allowShow">
    <div class="calc__spinner-block"></div>
    <div class="calc__spinner-text" v-if="text.length">{{ text }}</div>
  </div>
</template>

<script>
export default {
  name: "spinner-element",
  emits: ["finished"],
  props: {
    text: {
      type: String,
      default: "",
    },
    initShow: {
      type: Boolean,
      default: false,
    },
    timerTime: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      allowShow: false,
    };
  },
  watch: {
    initShow: {
      handler(newValue) {
        if (newValue) {
          this.allowShow = newValue;
          if (this.timerTime) {
            setTimeout(() => {
              this.allowShow = false;
              this.$emit("finished");
            }, this.timerTime * 1000);
          }
        } else {
          this.allowShow = newValue;
          this.$emit("finished");
        }
      },
      deep: true,
    },
  },
};
</script>
