<template>
  <div
    class="calc__wrapper-group-data"
    v-if="isVisibilityFromDependency && localDataForDisplay?.url?.length"
  >
    <div class="calc__image-wrapper" :class="classes">
      <div
        class="calc__image-label-wrapper"
        v-if="localDataForDisplay.label.length"
      >
        <div class="calc__image-label">{{ localDataForDisplay.label }}</div>
        <ui-prompt
          v-if="localDataForDisplay?.prompt.length"
          :prompt-text="localDataForDisplay.prompt"
        ></ui-prompt>
      </div>
      <div class="calc__image-wrapper-image" :style="'max-width:' + width">
        <img :src="localDataForDisplay.url" :alt="localDataForDisplay.label" />
      </div>
    </div>
  </div>
</template>

<script>
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import UiPrompt from "@/components/UI/UiPrompt";

export default {
  name: "UiImage",
  components: { UiPrompt },
  mixins: [MixinsForProcessingFormula],
  inject: ["globalDataForDependencies"],
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
  },
  computed: {
    imageDir() {
      return window?.imageDir ? window.imageDir : "";
    },
    width() {
      return this.maxWidth + "px";
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
          let formula = this.processingFormulaSpecialsSymbols(
            imageItem.dependencyFormulaDisplay
          );
          this.constructLocalListElementDependencyInFormula(formula);
          formula = this.processingVariablesOnFormula(formula);

          try {
            if (eval(formula)) {
              dataForOut = {
                label: imageItem.label,
                url: this.imageDir + imageItem.image.filename,
                prompt: imageItem?.prompt?.length
                  ? imageItem.prompt
                  : this.prompt,
              };
            }
          } catch (e) {
            console.log(e.message);
          }
        }
      });
      return dataForOut;
    },
  },
};
</script>

<style scoped lang="scss"></style>
