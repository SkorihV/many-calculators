<script setup>
import { computed, defineProps, ref, watch } from "vue";
import {useBaseStore} from "@/store/baseStore";
import {storeToRefs} from "pinia";
import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";

import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { getArrayElementsFromFormula } from "@/servises/UtilityServices";

const { getImageDir, devMode } = storeToRefs(useBaseStore());
const { constructLocalListElementDependencyInFormula, localDependencyList } =
  useLocalDependencyList();

const props = defineProps({
  imageSettingsData: {
    type: Object,
    default: () => {},
  },
});

const maxWidth = ref(props.imageSettingsData?.maxWidth || 250);
const maxHeight = ref(props.imageSettingsData?.maxHeight || 250);

const baseUrlImage = computed(() => {
  return props.imageSettingsData?.image?.filename.length
    ? props.imageSettingsData.image.filename
    : null;
});

const currentImageUrl = ref(baseUrlImage.value);

function changeValue() {
  return null;
}

function getImageAndUpdated(url) {
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
    currentImageUrl.value = img.src;
  });
  urlImage.catch((img) => {
    console.error("Картина по адресу " + img.src + " не была загружены");
  });
}

const isBackgroundImage = computed(() => {
  return Boolean(currentImageUrl.value);
});

const isSubstrate = computed(() => {
  return Boolean(props.imageSettingsData?.isSubstrate);
});

const colorSubstrate = computed(() => {
  return props?.imageSettingsData?.colorSubstrate
    ? "background-color:" + props.imageSettingsData.colorSubstrate + ";"
    : "";
});

const opacitySubstrate = computed(() => {
  return (
    "opacity:" + Number(props?.imageSettingsData?.opacitySubstrate) / 100 + ";"
  );
});

const styleBackgroundImageUrl = computed(() => {
  return 'background-image : url("' + currentImageUrl.value + '");';
});

const styleBackgroundRepeat = computed(() => {
  return "background-repeat:" + props.imageSettingsData?.backgroundRepeat + ";";
});

const styleBackgroundPosition = computed(() => {
  return (
    "background-position:" +
    props.imageSettingsData?.backgroundHorizontalPosition +
    " " +
    props.imageSettingsData?.backgroundVerticalPosition +
    ";"
  );
});

const styleLimitWrapperImagePosition = computed(() => {
  let result = "";

  if (props.imageSettingsData?.backgroundVerticalPosition === "top") {
    result += "top: 0;";
  } else if (props.imageSettingsData?.backgroundVerticalPosition === "bottom") {
    result += "bottom: 0;";
  } else if (props.imageSettingsData?.backgroundVerticalPosition === "center") {
    result += "top: 50%; transform: translateY(-50%);";
  }

  if (props.imageSettingsData?.backgroundHorizontalPosition === "left") {
    result += "left: 0;";
  } else if (
    props.imageSettingsData?.backgroundHorizontalPosition === "right"
  ) {
    result += "right: 0;";
  } else if (
    props.imageSettingsData?.backgroundHorizontalPosition === "center"
  ) {
    result += "left: 50%; transform: translateX(-50%);";
  }

  if (
    props.imageSettingsData?.backgroundHorizontalPosition === "center" &&
    props.imageSettingsData?.backgroundVerticalPosition === "center"
  ) {
    result = "left: 50%; top: 50%; transform:translate(-50%, -50%);";
  }

  return result;
});

const styleBackgroundSize = computed(() => {
  return `background-size: ${props.imageSettingsData?.behaviorImage}`;
});

const styleLimitWrapperImageSize = computed(() => {
  if (!props.imageSettingsData?.fixedSize) {
    return null;
  }
  const width = `max-width: ${maxWidth.value}${props.imageSettingsData?.unitSize}`;
  const height = `max-height: ${maxHeight.value}${props.imageSettingsData?.unitSize}`;

  return [width, height];
});

const styleBackground = computed(() => {
  if (isBackgroundImage.value) {
    return [
      styleBackgroundImageUrl.value,
      styleBackgroundRepeat.value,
      styleBackgroundPosition.value,
      styleBackgroundSize.value,
    ];
  }
  return [];
});

const urlImageAfterProcessingDependency = computed(() => {
  if (!props.imageSettingsData?.dependencyImages?.length) {
    return baseUrlImage.value;
  }
  let newCurrentUrl = null;
  props.imageSettingsData.dependencyImages.forEach((imageItem) => {
    if (
      imageItem.dependencyFormulaDisplay?.length &&
      imageItem?.image?.filename.length
    ) {
      let formula = getArrayElementsFromFormula(
        imageItem.dependencyFormulaDisplay
      );
      constructLocalListElementDependencyInFormula(formula);
      formula = processingVariablesOnFormula(formula, localDependencyList);

      try {
        if (eval(formula)) {
          newCurrentUrl = imageItem.image.filename;
        }
      } catch (e) {
        if (devMode.value) {
          console.error(e.message, formula);
        }
      }
    }
  });
  return newCurrentUrl ? newCurrentUrl : baseUrlImage.value;
});

watch(
  urlImageAfterProcessingDependency,
  (newUrl, oldUrl) => {
    if (newUrl !== oldUrl && Boolean(newUrl)) {
      getImageAndUpdated(getImageDir.value + newUrl);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div
    class="calc__background-image-wrapper"
    v-if="isBackgroundImage && styleBackgroundImageUrl"
  >
    <div
      class="calc__background-image-wrapper-limit"
      :style="[styleLimitWrapperImageSize, styleLimitWrapperImagePosition]"
    >
      <div
        class="calc__background-image-wrapper-img"
        :style="[...styleBackground]"
      ></div>
    </div>
    <div
      v-if="isSubstrate"
      :style="[colorSubstrate, opacitySubstrate]"
      class="calc__background-image-substrate"
    ></div>
  </div>
</template>

<style scoped></style>
