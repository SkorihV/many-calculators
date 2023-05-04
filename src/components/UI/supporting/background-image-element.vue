<template>
  <div
    class="calc__background-image-wrapper"
    v-if="isBackgroundImage && styleBackgroundImageUrl"

  >
    <div class="calc__background-image-wrapper-limit" :style="[styleLimitWrapperImageSize, styleLimitWrapperImagePosition]">
      <div class="calc__background-image-wrapper-img" :style="[...styleBackground]"></div>
    </div>
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
import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";

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
      currentImageUrl: this.baseUrlImage,
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
    styleLimitWrapperImagePosition() {
      let result = '';

      if (this.imageSettingsData?.backgroundVerticalPosition === "top") {
        result += "top: 0;";
      } else if (this.imageSettingsData?.backgroundVerticalPosition === "bottom") {
        result +=  "bottom: 0;";
      } else if (this.imageSettingsData?.backgroundVerticalPosition === "center") {
        result +=  "top: 50%; transform: translateY(-50%);"
      }


      if (this.imageSettingsData?.backgroundHorizontalPosition === "left") {
        result +=  "left: 0;";
      } else if (this.imageSettingsData?.backgroundHorizontalPosition === "right") {
        result +=  "right: 0;";
      } else if (this.imageSettingsData?.backgroundHorizontalPosition === "center") {
        result +=  "left: 50%; transform: translateX(-50%);"
      }

      if (this.imageSettingsData?.backgroundHorizontalPosition === "center" && this.imageSettingsData?.backgroundVerticalPosition === "center") {
        result = "left: 50%; top: 50%; transform:translate(-50%, -50%);"
      }

      return result;
      },
    styleBackgroundSize() {
      return `background-size: ${this.imageSettingsData?.behaviorImage}`
    },
    styleLimitWrapperImageSize() {
      if ( !this.imageSettingsData?.fixedSize) {
        return null;
      }
      const width = `max-width: ${this.maxWidth}${this.imageSettingsData?.unitSize}`;
      const height = `max-height: ${this.maxHeight}${this.imageSettingsData?.unitSize}`;

      return [width, height]
    },
    styleBackground() {
      if (this.isBackgroundImage) {
        return [
          this.styleBackgroundImageUrl,
          this.styleBackgroundRepeat,
          this.styleBackgroundPosition,
          this.styleBackgroundSize
        ];
      }
      return [];
    },
    baseUrlImage() {
      return this.imageSettingsData?.image?.filename.length
        ? this.imageSettingsData?.image?.filename
        : null;
    },
    urlImageAfterProcessingDependency() {
      if (!this.imageSettingsData?.dependencyImages?.length) {
        return this.baseUrlImage;
      }
      let newCurrentUrl = null;
      this.imageSettingsData.dependencyImages.forEach((imageItem) => {
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

          try {
            if (eval(formula)) {
              newCurrentUrl = imageItem.image.filename;
            }
          } catch (e) {
            if (this.devMode) {
              console.error(e.message, formula);
            }
          }
        }
      });
      return newCurrentUrl ? newCurrentUrl : this.baseUrlImage;
    },
  },
};
</script>

<style scoped></style>
