<script setup>

import {ref, watch} from "vue";

const props = defineProps({
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
})
const emits = defineEmits(['finished'])
const allowShow = ref(false)

watch(() => props.initShow, (newValue) => {
  if (newValue) {
    allowShow.value = newValue;
    if (props.timerTime) {
      setTimeout(() => {
        allowShow.value = false;
        emits("finished");
      }, props.timerTime * 1000);
    }
  } else {
    allowShow.value = newValue;
    emits("finished");
  }
}, {deep: true})

</script>

<template>
  <div class="calc__spinner-wrapper" v-if="allowShow">
    <div class="calc__spinner-block"></div>
    <div class="calc__spinner-text" v-if="text.length">{{ text }}</div>
  </div>
</template>