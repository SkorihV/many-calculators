<template>
  <div
    class="calc__bisection-wrapper"
    :class="[classes]"
    v-show="
      (templateData?.rightSide.length || templateData?.leftSide.length) &&
      isVisibilityFromDependency
    "
  >
    <div class="calc__bisection-label" v-if="templateData?.label?.length">
      {{ templateData?.label }}
    </div>
    <div class="calc__bisection-content-wrapper">
      <div
        v-show="isShowLeftSide"
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
          :parent-is-show="isVisibilityFromDependency && isShowLeftSide"
          :key="inx"
          :template="template"
          :index="elementName + '_' + 'left' + '_' + inx"
          @changedValue="changeValue"
        />
      </div>
      <div
        v-show="isShowRightSide"
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
          :parent-is-show="isVisibilityFromDependency && isShowRightSide"
          :key="inx"
          :template="template"
          :index="elementName + '_' + 'right' + '_' + inx"
          @changedValue="changeValue"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";

import { useBaseStore } from "@/store/piniaStore";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import { computed, onMounted, ref, toRef, watch } from "vue";
import UseUtilityServices from "@/components/UI/UseUtilityServices";
import UseForProcessingFormula from "@/components/UI/UseForProcessingFormula";

export default {
  name: "UiBisection",
  components: { TemplatesWrapper },
  emits: ["changedValue"],
  props: {
    templateData: {
      type: Object,
      default: () => {},
    },
    widthLeftSide: {
      type: [Number, String],
      default: 50,
    },
    dependencyFormulaDisplayLeftSide: {
      type: String,
      default: null,
    },
    dependencyFormulaDisplayRightSide: {
      type: String,
      default: null,
    },
    ...UsePropsTemplates([
      "label",
      "elementName",
      "classes",
      "parentIsShow",
      "dependencyFormulaDisplay",
    ]),
  },
  setup(props, { emit }) {
    const store = useBaseStore();
    const inMobile = ref(false);
    const parentIsShow = toRef(props, "parentIsShow");
    const dependencyFormulaDisplay = toRef(props, "dependencyFormulaDisplay");
    const classes = props.classes;
    const elementName = props.elementName;


    /**
     *
     * @type {Ref<UnwrapRef<number>>}
     */
    const absoluteMaxWidth = ref(70);
    /**
     *
     * @type {Ref<UnwrapRef<number>>}
     */
    const absoluteMinWidth = ref(30);
    const { getArrayElementsFromFormula } = UseUtilityServices();

    const {
      constructLocalListElementDependencyInFormula,
      processingVariablesOnFormula,
      isVisibilityFromDependency: isVisibilityFromDependencyLocal,
    } = UseForProcessingFormula({
      parentIsShow,
      dependencyFormulaDisplay,
      changeValue,

    });

    const isVisibilityFromDependency = ref(
      isVisibilityFromDependencyLocal.value
    );
    watch(
      () => isVisibilityFromDependencyLocal.value,
      () => {
        isVisibilityFromDependency.value =
          isVisibilityFromDependencyLocal.value;
      }
    );

    function changeValue(data){
      emit("changedValue", data);
    }

    function processingFormula(formula){
      let result = getArrayElementsFromFormula(formula);
      constructLocalListElementDependencyInFormula(result);
      result = processingVariablesOnFormula(result);
      try {
        return eval(result);
      } catch (e) {
        if (store.devMode) {
          console.error(e.message, result);
        }
        return false;
      }
    }

    const isShowLeftSide = computed(() => {
      if (!props.dependencyFormulaDisplayLeftSide?.length) {
        return true;
      }
      return processingFormula(props.dependencyFormulaDisplayLeftSide);
    });

    const isShowRightSide = computed(() => {
      if (!props.dependencyFormulaDisplayRightSide?.length) {
        return true;
      }
      return processingFormula(props.dependencyFormulaDisplayRightSide);
    });

    const styleWidthLeftSide = computed(() => {
      if (props.widthLeftSide > absoluteMaxWidth.value) {
        props.widthLeftSide = absoluteMaxWidth.value;
      }
      if (props.widthLeftSide < absoluteMinWidth.value) {
        props.widthLeftSide = absoluteMinWidth.value;
      }
      if (inMobile) {
        return "max-width:" + 100 + "%";
      }
      return "max-width:" + props.widthLeftSide + "%";
    });
    const styleWidthRightSide = computed(() => {
      if (props.widthLeftSide > absoluteMaxWidth.value) {
        props.widthLeftSide = absoluteMaxWidth.value;
      }
      if (props.widthLeftSide < absoluteMinWidth.value) {
        props.widthLeftSide = absoluteMinWidth.value;
      }
      if (inMobile) {
        return "max-width:" + 100 + "%";
      }
      return "max-width:" + (100 - props.widthLeftSide) + "%";
    });

    onMounted(() => {
      window.addEventListener("resize", () => {
        inMobile.value = window.innerWidth <= 768;
      });
    });

    return {
      changeValue,
      styleWidthRightSide,
      styleWidthLeftSide,
      isShowRightSide,
      isShowLeftSide,
      isVisibilityFromDependency,
      classes,
      elementName,
    };
  },
};
</script>

<style scoped lang="scss"></style>
