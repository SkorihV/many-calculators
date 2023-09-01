<script setup>

import { computed, reactive, ref, toRef } from "vue";
import { updateTextOnVariables } from "@/servises/UpdateTextOnVariables";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { useProcessingFormula } from "@/composables/useProcessingFormula";
import DevBlock from "@/components/UI/devMode/devBlock/devBlock.vue";

const props = defineProps({
  resultOptions: {
    type: Object,
    default: () => {}
  }
})

const localDependencyFormula = ref(props.resultOptions?.formulaDependencyTextAfterSumma)

const {localDependencyList, constructLocalListElementDependencyInFormula} = useLocalDependencyList()
const {isVisibilityFromDependency, costAfterProcessingDependencyPrice} = useProcessingFormula(
  reactive({
    localDependencyList,
    constructLocalListElementDependencyInFormula,
    parentIsShow: true,
    formula: props.resultOptions?.formulaDependencyTextAfterSumma,
  })
)

const isExistOptionsText = computed(() => {
  return Boolean(props.resultOptions?.dependencyTextAfterSumma?.length)
})

const localTextAfterSumma = computed(() => {
  localDependencyFormula.value = props.resultOptions?.formulaDependencyTextAfterSumma
  if (!isExistOptionsText.value) {
    return updateTextOnVariables(props.resultOptions?.textAfterSumma)
  }

  let { item } = costAfterProcessingDependencyPrice(
    reactive({
      dependencyArrayItems: toRef(props.resultOptions, "dependencyTextAfterSumma"),
      formulaFieldName: "dependencyFormulaTextAfterSumma",
    })
  );
  const textIsExist = Boolean(item?.textAfterSumma?.length)
  if (textIsExist) {
    localDependencyFormula.value = item?.dependencyFormulaTextAfterSumma
    return updateTextOnVariables(item?.textAfterSumma)
  }
  return updateTextOnVariables(props.resultOptions?.textAfterSumma)
})


const isExistLocalText = computed(() => {
  return Boolean(localTextAfterSumma.value?.length)
})

</script>

<template>
  <div class="calc__result-block-data-text" v-if="isVisibilityFromDependency && isExistLocalText" v-html="localTextAfterSumma"></div>
  <dev-block
    label="Текст под результирующей ценой"
    :is-visibility-from-dependency="isVisibilityFromDependency && isExistLocalText"
    :dependency-formula-display="localDependencyFormula"
    hidden-cost
    hidden-value
  />
</template>
