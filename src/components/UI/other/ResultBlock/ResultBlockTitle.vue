<script setup>
import { useIsChecks } from "@/components/UI/other/ResultBlock/useIsChecks";
import { computed } from "vue";
import { updateTextOnVariables } from "@/servises/UpdateTextOnVariables";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";

const props = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const { isShowResultBlockSubtitle, isShowResultBlockTitle } = useIsChecks(
  props.data
);
const { localDependencyList, constructLocalListElementDependencyInFormula } =
  useLocalDependencyList();

const localSubtitle = computed(() => {
  return updateTextOnVariables(props.data?.subtitle)
})

const localTitle = computed(() => {
  return updateTextOnVariables(props.data?.title, {prueValue: true})
})

</script>

<template>
  <div
    class="calc__result-block-title-wrapper"
    v-if="isShowResultBlockTitle || isShowResultBlockSubtitle"
  >
    <div class="calc__result-block-title-main" v-if="isShowResultBlockTitle">
      {{ localTitle }}
    </div>
    <div
      class="calc__result-block-title-sub"
      v-if="isShowResultBlockSubtitle"
      v-html="localSubtitle"
    />
  </div>
</template>
