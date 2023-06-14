<script>
const typeElement = "UiImage";
</script>

<script setup>
import UiPrompt from "@/components/UI/other/UiPrompt.vue";
import devBlock from "@/components/UI/devMode/devBlock/devBlock.vue";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import {computed, reactive, onBeforeMount, onMounted, onUnmounted, toRef} from "vue";
import {getBaseStoreAction, getBaseStoreGetters} from "@/composables/useBaseStore";
import {processingVariablesOnFormula} from "@/servises/ProcessingFormula";
import {useLocalDependencyList} from "@/composables/useLocalDependencyList";
import {useProcessingFormula} from "@/composables/useProcessingFormula";
import {useDisplaySpinner} from "@/composables/useDisplaySpinner";

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
    "formulaProcessingLogic",
    "parentName",
    "parentIsShow",
    "dependencyFormulaDisplay",
  ]),
})
const width = "max-width:" + props.maxWidth + "px";
const height = "max-height:" + props.maxHeight + "px";

const {devMode, getImageDir} = getBaseStoreGetters();
const {tryDeleteAllDataOnStoreForElementName, tryToggleElementIsMounted} = getBaseStoreAction(["tryDeleteAllDataOnStoreForElementName", "tryToggleElementIsMounted"])
import {getArrayElementsFromFormula} from "@/servises/UtilityServices"
useDisplaySpinner(props.elementName)
const {localDependencyList, constructLocalListElementDependencyInFormula} = useLocalDependencyList();
const {isVisibilityFromDependency, formulaAfterProcessingVariables} = useProcessingFormula(
    reactive({
      localDependencyList: localDependencyList,
      constructLocalListElementDependencyInFormula,
      parentIsShow: toRef(props, 'parentIsShow'),
      formula: toRef(props, 'dependencyFormulaDisplay')
    })
)

onBeforeMount(() => {
  tryToggleElementIsMounted(props.elementName, false);
})

onMounted(() => {
  setTimeout(() => {
    tryToggleElementIsMounted(props.elementName, true);
  }, 200);
})

onUnmounted(() => {
  tryDeleteAllDataOnStoreForElementName(props.elementName);
})


const url = computed(() => {
  return Boolean(props.defaultImage?.filename?.length)
    ? getImageDir.value + props.defaultImage?.filename
    : "";
})

const isExistDependencyImages = Boolean(props.dependencyImages?.length)
const localDataForDisplay = computed(() => {
  let dataForOut = {
    label: props.label,
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
      formula = processingVariablesOnFormula(
          formula,
          localDependencyList
      );

      const currentUrlIsExist = Boolean(imageItem?.image?.filename.length);
      try {
        if (eval(formula) && currentUrlIsExist) {
          const label = imageItem.label?.toString().length ? imageItem.label : props.label;
          const url = getImageDir.value + imageItem.image.filename;
          const prompt = imageItem?.prompt?.length ? imageItem.prompt : props.prompt;
          dataForOut = {label, url, prompt, };
        }
      } catch (e) {
        if (devMode.value) {
          console.error(e.message, formula);
        }
      }
    }
  });
  return dataForOut;
})

const urlIsExist = computed(() => {
    return Boolean(localDataForDisplay.value?.url?.length);
  })

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
    :label="label || elementName"
    :type-element="typeElement"
    :element-name="elementName"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
  />
</template>
