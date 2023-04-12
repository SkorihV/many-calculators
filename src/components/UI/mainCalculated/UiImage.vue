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
    :label="label"
    :element-name="elementName"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
    :parsing-formula-variables="formulaAfterProcessingVariables"
  />
</template>

<script>
import UiPrompt from "@/components/UI/other/UiPrompt.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/mixins/MixinsGeneralItemData";
import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";

import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

export default {
  name: "UiImage",
  components: { UiPrompt, devBlock },
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  created() {
    this.tryToggleElementIsMounted(this.elementName, false);
  },
  mounted() {
    setTimeout(() => {
      this.tryToggleElementIsMounted(this.elementName, true);
    }, 200);
  },
  props: {
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
  },
  methods: {
    changeValue() {
      return null;
    },
    changeValid() {
      return null;
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "devMode",
      "getImageDir",
      "tryToggleElementIsMounted",
    ]),
    urlIsExist() {
      return Boolean(this.localDataForDisplay?.url?.length);
    },
    width() {
      return "max-width:" + this.maxWidth + "px";
    },
    height() {
      return "max-height:" + this.maxHeight + "px";
    },
    localDataForDisplay() {
      let url = Boolean(this.defaultImage?.filename?.length)
        ? this.getImageDir + this.defaultImage?.filename
        : "";
      let dataForOut = {
        label: this.label,
        url: url,
        prompt: this.prompt,
      };
      if (!this.dependencyImages?.length) {
        return dataForOut;
      }
      this.dependencyImages.forEach((imageItem) => {
        if (
          imageItem.dependencyFormulaDisplay?.length &&
          imageItem?.image?.filename.length
        ) {
          let formula = this.getArrayElementsFromFormula(
            imageItem.dependencyFormulaDisplay
          );
          this.constructLocalListElementDependencyInFormula(formula);
          formula = processingVariablesOnFormula(
            formula,
            this.localDependencyList
          );

          const currentUrlIsExist = Boolean(imageItem?.image?.filename.length);
          try {
            if (eval(formula) && currentUrlIsExist) {
              dataForOut = {
                label: imageItem.label?.toString().length
                  ? imageItem.label
                  : this.label,
                url: this.getImageDir + imageItem.image.filename,
                prompt: imageItem?.prompt?.length
                  ? imageItem.prompt
                  : this.prompt,
              };
            }
          } catch (e) {
            if (this.devMode) {
              console.error(e.message, formula);
            }
          }
        }
      });
      return dataForOut;
    },
  },
};
</script>
