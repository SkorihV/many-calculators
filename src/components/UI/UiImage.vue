<template>
  <div
    class="calc__wrapper-group-data"
    v-if="isVisibilityFromDependency && localDataForDisplay?.url?.length"
  >
    <div class="calc__image-wrapper" :class="classes">
      <div
        class="calc__image-label-wrapper"
        v-if="localDataForDisplay?.label?.toString()?.length"
      >
        <div class="calc__image-label">{{ localDataForDisplay.label }}</div>
        <ui-prompt
          v-if="localDataForDisplay?.prompt.length"
          :prompt-text="localDataForDisplay.prompt"
        ></ui-prompt>
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
  <div v-if="devModeData?.length" v-html="devModeData"></div>
</template>

<script>
import UiPrompt from "@/components/UI/UiPrompt";

import UseUtilityServices from "@/components/UI/UseUtilityServices";
import UseForProcessingFormula from "@/components/UI/UseForProcessingFormula";
import UseDevModeDataBlock from '@/components/UI/UseDevModeDataBlock'

import { useBaseStore } from "@/store/piniaStore";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import { computed, toRef, watch, ref } from "vue";

export default {
  name: "UiImage",
  components: { UiPrompt },
  props: {
    defaultImage: {
      type: Object,
      default: () => {},
    },
    dependencyImages: {
      type: Array,
      default: () => [],
    },
    ...UsePropsTemplates(['classes','elementName', 'maxHeight', 'maxWidth', 'prompt', 'label', 'templateName',  'formulaProcessingLogic', 'parentName', 'parentIsShow', 'dependencyFormulaDisplay'])
  },
  setup(props) {
    const store                       = useBaseStore();
    const label                       = toRef(props, 'label');
    const parentIsShow                = toRef(props, 'parentIsShow');
    const dependencyFormulaDisplay    = toRef(props, 'dependencyFormulaDisplay');
    const isVisibilityFromDependency  = ref(false);

    const { getArrayElementsFromFormula, getImageDir } = UseUtilityServices();
    const { processingVariablesOnFormula, constructLocalListElementDependencyInFormula, isVisibilityFromDependency : isVisibilityFromDependencyLocal, parsingFormulaVariables} = UseForProcessingFormula({ parentIsShow, dependencyFormulaDisplay })

    watch(
      () => isVisibilityFromDependencyLocal.value,
      () => {
        isVisibilityFromDependency.value = isVisibilityFromDependencyLocal.value
      }
    )
    const width = computed(() => {
      return "max-width:" + props.maxWidth + "px";
    })
    const height = computed(() => {
      return "max-height:" + props.maxHeight + "px";
    })

    const localDataForDisplay = computed(() => {
      let dataForOut = {
        label: label.value,
        url: getImageDir() + props.defaultImage.filename,
        prompt: props.prompt,
      }
      if (!props.dependencyImages?.length) {
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
          formula = processingVariablesOnFormula(formula);

          try {
            if (eval(formula)) {
              dataForOut = {
                label: imageItem.label?.toString().length
                  ? imageItem.label
                  : label.value,
                url: getImageDir() + imageItem.image.filename,
                prompt: imageItem?.prompt?.length
                  ? imageItem.prompt
                  : props.prompt,
              };
            }
          } catch (e) {
            if (store.devMode) {
              console.error(e.message, formula);
            }
          }
        }
      });
      return dataForOut;
    })

    const { devModeData } = UseDevModeDataBlock(
      { label: props.label,
        elementName:props.elementName,
        dependencyFormulaDisplay: props.dependencyFormulaDisplay.value,
        parsingFormulaVariables: parsingFormulaVariables.value,
        isVisibilityFromDependency: isVisibilityFromDependency.value,
        templateName: props.templateName
        }
    )

    return {
      height,
      width,
      localDataForDisplay,
      isVisibilityFromDependency,
      devModeData
    }
  },
};
</script>

<style scoped lang="scss"></style>
