<template>
  <div
    class="calc__background-image-wrapper"
    v-if="isBackgroundImage"
    :style="[...styleBackground]"
  >
    <div
      v-if="isSubstrate"
      :style="[colorSubstrate, opacitySubstrate]"
      class="calc__background-image-substrate"
    ></div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useBaseStore } from "@/store/piniaStore";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import {processingVariablesOnFormula} from "@/servises/ProcessingFormula";

export default {
  name: "background-image-element",
  mixins: [MixinsForProcessingFormula],
  props: {
    imageSettingsData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      maxWidth: this.imageSettingsData?.maxWidth || 250,
      maxHeight: this.imageSettingsData?.maxHeight || 250,
      currentImageUrl: null,
    };
  },
  methods: {
    changeValue() {
      return null;
    },
    getImageAndUpdated(url) {
      const urlImage = new Promise(function (resolve, reject) {
        let img = new Image();
        img.onload = () => {
          resolve(img);
        };
        img.onerror = () => {
          reject(img);
        };
        img.src = url;
      });

      urlImage.then((img) => {
        this.currentImageUrl = img.src;
      });
      urlImage.catch((img) => {
        console.error("Картина по адресу " + img.src + " не была загружены");
      });
    },
  },
  watch: {
    urlImageAfterProcessingDependency: {
      handler(newUrl, oldUrl) {
        if (newUrl !== oldUrl && Boolean(newUrl)) {
          this.getImageAndUpdated(this.getImageDir + newUrl);
        }
      },
      immediate: true,
    },
  },
  computed: {
    ...mapState(useBaseStore, ["getImageDir"]),
    isBackgroundImage() {
      return Boolean(this.currentImageUrl);
    },
    isSubstrate() {
      return !!this.imageSettingsData?.isSubstrate;
    },
    colorSubstrate() {
      return this?.imageSettingsData?.colorSubstrate
        ? "background-color:" + this?.imageSettingsData?.colorSubstrate + ";"
        : "";
    },
    opacitySubstrate() {
      return (
        "opacity:" +
        Number(this?.imageSettingsData?.opacitySubstrate) / 100 +
        ";"
      );
    },
    styleBackgroundImageUrl() {
      return 'background-image : url("' + this.currentImageUrl + '");';
    },
    styleBackgroundRepeat() {
      return (
        "background-repeat:" + this.imageSettingsData?.backgroundRepeat + ";"
      );
    },
    styleBackgroundPosition() {
      return (
        "background-position:" +
        this.imageSettingsData?.backgroundHorizontalPosition +
        " " +
        this.imageSettingsData?.backgroundVerticalPosition +
        ";"
      );
    },
    styleBackgroundBehaviorImage() {
      let size = this.imageSettingsData?.fixedSize
        ? this.maxWidth +
          this.imageSettingsData?.unitSize +
          " " +
          this.maxHeight +
          this.imageSettingsData?.unitSize
        : this.imageSettingsData?.behaviorImage;

      return "background-size:" + size + ";";
    },
    styleBackground() {
      if (this.isBackgroundImage) {
        return [
          this.styleBackgroundImageUrl,
          this.styleBackgroundRepeat,
          this.styleBackgroundPosition,
          this.styleBackgroundBehaviorImage,
        ];
      }
      return [];
    },
    urlImageAfterProcessingDependency() {
      let currentUrl = this.imageSettingsData?.image?.filename.length
        ? this.imageSettingsData?.image?.filename
        : false;
      if (!this.imageSettingsData?.dependencyImages?.length) {
        return currentUrl;
      }
      this.imageSettingsData.dependencyImages.forEach((imageItem) => {
        if (
          imageItem.dependencyFormulaDisplay?.length &&
          imageItem?.image?.filename.length
        ) {
          let formula = this.getArrayElementsFromFormula(
            imageItem.dependencyFormulaDisplay
          );
          this.constructLocalListElementDependencyInFormula(formula);
          formula = processingVariablesOnFormula(formula, this.localDependencyList);

          try {
            if (eval(formula)) {
              currentUrl = imageItem.image.filename;
            }
          } catch (e) {
            if (this.devMode) {
              console.error(e.message, formula);
            }
          }
        }
      });
      return currentUrl;
    },
  },
};
</script>

<style scoped></style>
