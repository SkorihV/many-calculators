<template>
  <div
    class="calc__wrapper-group-data"
    v-if="isVisibilityFromDependency && localDataForDisplay?.url?.length"
  >
    <div class="calc__image-wrapper" :class="classes">
      <div
        class="calc__image-label-wrapper"
        v-if="localDataForDisplay?.label?.length"
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
  <div v-if="devModeData" v-html="devModeData"></div>
</template>

<script>
import UiPrompt from "@/components/UI/UiPrompt";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";

import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

export default {
  name: "UiImage",
  components: { UiPrompt },
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  created() {
    this.tryToggleElementIsMounted(this.elementName, false);
  },
  mounted() {
    setTimeout(() => {
      this.tryToggleElementIsMounted(this.elementName, true);
    }, 200)
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
    ...UsePropsTemplates([
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
    ...mapState(useBaseStore, ["devMode", "getImageDir", "tryToggleElementIsMounted"]),
    width() {
      return "max-width:" + this.maxWidth + "px";
    },
    height() {
      return "max-height:" + this.maxHeight + "px";
    },
    localDataForDisplay() {
      let dataForOut = {
        label: this.label,
        url: this.getImageDir + this.defaultImage.filename,
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
          formula = this.processingVariablesOnFormula(formula);

          try {
            if (eval(formula)) {
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
