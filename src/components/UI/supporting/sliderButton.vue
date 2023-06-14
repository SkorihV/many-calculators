<script setup>
import { ref } from "vue";



const props = defineProps({
  classes: {
    type:String,
    default: ''
  }
})


const sliderRef = ref(null)
const isDrag = false;

</script>

<template>
  {{isDrag}}
  <div
    class="calc__slider"
    :class="classes"
    ref="sliderRef"
  >

  </div>
</template>

<style lang="scss" scoped>

.calc__slider {
  width: 20px;
  height: 20px;
  border: solid black 2px;
  border-radius: 50%;
  position: absolute;
  left: -10px;
  top:50%;
  transform: translateY(-50%);
  cursor:pointer;
}

</style>
