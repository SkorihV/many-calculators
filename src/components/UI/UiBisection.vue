<template>
  <div
    class="calc__bisection-wrapper"
    :class="[classes]"
    v-show="(templateData?.rightSide.length || templateData?.leftSide.length) && isVisibilityFromDependency"
  >
    <div class="calc__bisection-label" v-if="templateData?.label?.length">
      {{ templateData?.label }}
    </div>
    <div class="calc__bisection-content-wrapper">
      <div
        class="calc__bisection-left-side-wrapper"
        :style="styleWidthLeftSide"
      >
        <div
          class="calc__bisection-left-label"
          v-if="templateData?.labelLeft.length"
        >
          {{ templateData?.labelLeft }}
        </div>
        <templates-wrapper
          v-for="(template, inx) in templateData?.leftSide"
          :parent-is-show="isVisibilityFromDependency"
          :key="inx"
          :template="template"
          :index="elementName + '_' + 'left' + '_' + inx"
          @changedValue="changeValue"
          @changeValid="changeValid"
        />
      </div>
      <div
        class="calc__bisection-right-side-wrapper"
        :style="styleWidthRightSide"
      >
        <div
          class="calc__bisection-right-label"
          v-if="templateData?.labelRight.length"
        >
          {{ templateData?.labelRight }}
        </div>
        <templates-wrapper
          v-for="(template, inx) in templateData?.rightSide"
          :parent-is-show="isVisibilityFromDependency"
          :key="inx"
          :template="template"
          :index="elementName + '_' + 'right' + '_' + inx"
          @changedValue="changeValue"
          @changeValid="changeValid"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";

export default {
  name: "UiBisection",
  components: { TemplatesWrapper },
  emits: ["changedValue", "changeValid"],
  inject: ["globalDataForDependencies"],
  mixins: [MixinsForProcessingFormula],
  props: {
    templateData: {
      type: Object,
      default: () => {},
    },
    /**
     * заголовок
     */
    label: {
      type: String,
      default: "",
    },
    widthLeftSide: {
      type: [Number, String],
      default: 50,
    },
    elementName: {
      type: String,
      default: Math.random().toString(),
    },
    classes: {
      type: String,
      default: null,
    },
  },
  mounted() {
    window.addEventListener("resize", () => {
      this.inMobile = window.innerWidth <= 768;
    });
  },
  data() {
    return {
      inMobile: false,
    };
  },
  methods: {
    changeValue(data) {
      this.$emit("changedValue", data);
    },
    changeValid(data) {
      this.$emit("changeValid", data);
    },
  },
  computed: {
    styleWidthLeftSide() {
      if (this.widthLeftSide > 80) {
        this.widthLeftSide = 70;
      }
      if (this.widthLeftSide < 30) {
        this.widthLeftSide = 30;
      }
      if (this.inMobile) {
        return "max-width:" + 100 + "%";
      }
      return "max-width:" + this.widthLeftSide + "%";
    },
    styleWidthRightSide() {
      if (this.widthLeftSide > 80) {
        this.widthLeftSide = 70;
      }
      if (this.widthLeftSide < 30) {
        this.widthLeftSide = 30;
      }
      if (this.inMobile) {
        return "max-width:" + 100 + "%";
      }
      return "max-width:" + (100 - this.widthLeftSide) + "%";
    },
  },
};
</script>

<style scoped lang="scss"></style>
