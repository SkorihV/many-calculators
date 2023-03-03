<template>
  <div
    class="calc__result-block-wrapper"
    :class="{
          isVisualSeparate: options.resultOptions?.visuallySeparateElement,
        }"
    v-if="showResultDataForBlock && initTeleportIsReady"
  >
    <background-image-element
      class="result"
      v-if="options.resultOptions?.backgroundImageSettings"
      :image-settings-data="
            options.resultOptions?.backgroundImageSettings
          "
    />
    <div
      class="calc__result-block-title-wrapper"
      v-if="isShowResultBlockTitle || isShowResultBlockSubtitle"
    >
      <div
        class="calc__result-block-title-main"
        v-if="isShowResultBlockTitle"
      >
        {{ options.resultOptions.title }}
      </div>
      <div
        class="calc__result-block-title-sub"
        v-if="isShowResultBlockSubtitle"
        v-html="options.resultOptions.subtitle"
      />
    </div>
    <div class="calc__result-block-data" v-html="outputHtmlText"></div>
  </div>
</template>

<script>
import backgroundImageElement from "@/components/UI/supporting/background-image-element.vue";
export default {
  name: "ResultBlockForOutput",
  components: {backgroundImageElement},
  props: {
    options: {
      type: Object,
      require: true
    },
    initTeleportIsReady: {
      type: Boolean,
      default: false
    },
    outputHtmlText: {
      type: String,
      default: ""
    }
  },
  mounted() {
    this.showResultDataForBlock = this.options?.resultOptions
      ? this.options?.resultOptions.showResultDataForBlock
      : false;
  },
  data() {
    return {
      showResultDataForBlock: false, // выводить результаты выбора и расчета вне формы
    }
  },
  computed: {
    isShowResultBlockTitle() {
      return Boolean(this.options?.resultOptions?.title?.length);
    },
    isShowResultBlockSubtitle() {
      return Boolean(this.options?.resultOptions?.subtitle?.length);
    },
  }
};
</script>

<style scoped>

</style>
