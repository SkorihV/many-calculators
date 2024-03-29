<script>
const typeElement = "UiImage";
</script>

<script setup>
import UiPrompt from "@/components/UI/other/UiPrompt.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import {
  computed,
  reactive,
  onUnmounted,
  toRef,
} from "vue";
import { useBaseStore } from "@/store/baseStore";
import { storeToRefs } from "pinia";

import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { useProcessingFormula } from "@/composables/useProcessingFormula";
import { useDisplaySpinner } from "@/composables/useDisplaySpinner";
import { getArrayElementsFromFormula } from "@/servises/UtilityServices";
import {useDisplayComponents} from "@/composables/useDisplayComponents";
import errorMessage from "@/servises/devErrorMessage";

const props = defineProps({
  defaultImage: {
    type: Object,
    default: () => {},
  },
  dependencyImages: {
    type: Array,
    default: () => [],
  },
  ...propsTemplate.getProps([
    "classes",
    "elementName",
    "maxHeight",
    "maxWidth",
    "prompt",
    "label",
    "templateName",
    "parentIsShow",
    "dependencyFormulaDisplay",
  ]),
});
const width = "max-width:" + props.maxWidth + "px";
const height = "max-height:" + props.maxHeight + "px";
const isExistDependencyImages = Boolean(props.dependencyImages?.length);

const baseStore = useBaseStore()
const { getImageDir } = storeToRefs(baseStore);

const { localDependencyList, constructLocalListElementDependencyInFormula } =
  useLocalDependencyList();
const { isVisibilityFromDependency } =
  useProcessingFormula(
    reactive({
      localDependencyList: localDependencyList,
      constructLocalListElementDependencyInFormula,
      parentIsShow: toRef(props, "parentIsShow"),
      formula: toRef(props, "dependencyFormulaDisplay"),
    })
  );
useDisplayComponents(props.elementName, isVisibilityFromDependency, typeElement)
useDisplaySpinner(props.elementName);

onUnmounted(() => {
  baseStore?.tryDeleteAllDataOnStoreForElementName(props.elementName);
});

const localLabel = computed(() => {
  return props.label
})

const url = computed(() => {
  return Boolean(props.defaultImage?.filename?.length)
    ? getImageDir.value + props.defaultImage?.filename
    : "";
});

const localDataForDisplay = computed(() => {
  let dataForOut = {
    label: localLabel.value,
    url: url.value,
    prompt: props.prompt,
  };
  if (!isExistDependencyImages) {
    return dataForOut;
  }
  props.dependencyImages.forEach((imageItem) => {
    if (
      imageItem.dependencyFormulaDisplay?.length &&
      imageItem?.image?.filename.length
    ) {
      let formula = getArrayElementsFromFormula(
        imageItem.dependencyFormulaDisplay
      );
      constructLocalListElementDependencyInFormula(formula);
      formula = processingVariablesOnFormula(formula, localDependencyList);

      const currentUrlIsExist = Boolean(imageItem?.image?.filename.length);
      try {
        if (eval(formula) && currentUrlIsExist) {
          const label = imageItem.label?.toString().length
            ? imageItem.label
            : localLabel.value;
          const url = getImageDir.value + imageItem.image.filename;
          const prompt = imageItem?.prompt?.length
            ? imageItem.prompt
            : props.prompt;
          dataForOut = { label, url, prompt };
        }
      } catch (e) {
        errorMessage([e.message, formula], 'error')
      }
    }
  });
  return dataForOut;
});

const urlIsExist = computed(() => {
  return Boolean(localDataForDisplay.value?.url?.length);
});
</script>

<template>
  <div
    class="calc__wrapper-group-data"
    v-if="isVisibilityFromDependency && urlIsExist"
  >
    <div class="calc__image-wrapper" :class="classes">
      <div
        class="calc__image-label-wrapper"
        v-if="localDataForDisplay?.label?.toString()?.length"
      >
        <div class="calc__image-label">{{ localDataForDisplay?.label }}</div>
        <ui-prompt
          v-if="localDataForDisplay?.prompt?.length"
          :prompt-text="localDataForDisplay.prompt"
        />
      </div>
      <div class="calc__image-wrapper-image" :style="[width, height]">
        <img
          :src="localDataForDisplay.url"
          :style="[width, height]"
          :alt="localDataForDisplay.label"
        />
      </div>
    </div>
  </div>
  <dev-block
    hidden-value
    hidden-cost
    :label="localDataForDisplay?.label || elementName"
    :type-element="typeElement"
    :element-name="elementName"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
  />
</template>
