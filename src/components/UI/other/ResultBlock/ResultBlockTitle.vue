<script setup>
import { useIsChecks } from "@/components/UI/other/ResultBlock/useIsChecks";
import { computed } from "vue";
import { updateTextOnVariables } from "@/servises/UpdateTextOnVariables";

const props = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const { isShowResultBlockSubtitle, isShowResultBlockTitle } = useIsChecks(
  props.data
);
const localSubtitle = computed(() => {
  return updateTextOnVariables(props.data?.subtitle)
})

</script>

<template>
  <div
    class="calc__result-block-title-wrapper"
    v-if="isShowResultBlockTitle || isShowResultBlockSubtitle"
  >
    <div class="calc__result-block-title-main" v-if="isShowResultBlockTitle">
      {{ data.title }}
    </div>
    <div
      class="calc__result-block-title-sub"
      v-if="isShowResultBlockSubtitle"
      v-html="localSubtitle"
    />
  </div>
</template>
