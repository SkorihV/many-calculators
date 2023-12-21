<script setup>
import { computed,  } from "vue"
import {useBaseStore} from "@/store/baseStore"
import { storeToRefs } from "pinia"

const {getTextErrorRequire, getTextErrorSum } = storeToRefs(useBaseStore())

const props = defineProps({
  showErrorTextBlock: {
    type: Boolean,
    default: false
  },
  showErrorSummaBlock: {
    type: Boolean,
    default: false
  }
})

const showErrorSumma = computed(() => {
  return !props.showErrorTextBlock && props.showErrorSummaBlock
})

</script>

<template>
  <div v-if="showErrorTextBlock" class="calc__error-block">
    {{ getTextErrorRequire }}
  </div>
  <div
    v-if="showErrorSumma"
    class="calc__error-block"
  >
    {{getTextErrorSum}}
  </div>
</template>

