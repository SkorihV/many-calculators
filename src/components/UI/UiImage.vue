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
  <div v-if="devMode && showInsideElementStatus" v-html="devModeData"></div>
</template>

<script>
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";
import UiPrompt from "@/components/UI/UiPrompt";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

export default {
  name: "UiImage",
  components: { UiPrompt },
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  props: {
    /**
     * заголовок
     */
    label: {
      type: String,
      default: "",
    },
    defaultImage: {
      type: Object,
      default: () => {},
    },
    dependencyImages: {
      type: Array,
      default: () => [],
    },
    prompt: {
      type: String,
      default: null,
    },
    maxWidth: {
      type: [Number, String],
      default: 250,
    },
    maxHeight: {
      type: [Number, String],
      default: 250,
    },
    /**
     * имя необходимое для корректной работы Label
     */
    elementName: {
      type: String,
      default: "",
    },
    /**
     * Список классов для переопределения стилей на обертке
     */
    classes: {
      type: String,
      default: null,
    },
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
    ...mapState(useBaseStore, ["devMode", "showInsideElementStatus"]),
    imageDir() {
      return window?.imageDir ? window.imageDir : "";
    },
    width() {
      return "max-width:" + this.maxWidth + "px";
    },
    height() {
      return "max-height:" + this.maxHeight + "px";
    },
    localDataForDisplay() {
      let dataForOut = {
        label: this.label,
        url: this.imageDir + this.defaultImage.filename,
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
                url: this.imageDir + imageItem.image.filename,
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

<style scoped lang="scss"></style>
