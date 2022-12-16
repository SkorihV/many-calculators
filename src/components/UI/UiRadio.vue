<template>
  <div
    class="calc__wrapper-group-data"
    v-if="isVisibilityFromDependency"
    ref="parent"
  >
    <div
      class="calc__radio-wrapper"
      :class="[radioType, { column: isColumn, onlyImage: onlyImage }, classes]"
    >
      <div class="calc__radio-title" v-if="label">
        {{ label }}
        <div class="empty-block" v-if="notEmpty">*</div>
        <slot name="prompt" />
      </div>
      <div class="calc__radio-wrapper-buttons">
        <template v-for="(radio, idx) in localRadioListInOut" :key="idx">
          <div
            class="calc__radio-label"
            :id="localElementName + '_' + idx"
            :class="{ checked: idx === currentIndexRadioButton }"
            v-if="radio.isShow"
            @click="selectedCurrentRadio(idx)"
          >
            <div class="calc__radio-text" v-if="!onlyImage">
              <span
                class="calc__radio-indicator"
                v-if="radioType === 'base'"
              ></span
              >{{ radio.radioName }}
            </div>
            <div
              class="calc__radio-wrapper-image"
              v-if="radio?.image?.filename"
              :style="[width, height]"
            >
              <img
                :src="radio?.image?.filename"
                :style="[width, height]"
                :alt="radio.radioName"
              />
            </div>
            <ui-prompt :prompt-text="radio.prompt" />
          </div>
        </template>
      </div>
      <ui-tooltip
        :is-show="isErrorEmpty"
        :tooltip-text="textErrorNotEmpty"
        :local-can-be-shown="isVisibilityFromDependency"
      />
    </div>
  </div>
  <div v-if="devModeData.length" v-html="devModeData"></div>
</template>

<script>
import UiPrompt from "@/components/UI/UiPrompt";
import UiTooltip from "@/components/UI/UiTooltip";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import { ref, toRef, onMounted, watch, computed } from "vue";
import UseForProcessingFormula from "@/components/UI/UseForProcessingFormula";
import UseUtilityServices from "@/components/UI/UseUtilityServices";
import UseDevModeDataBlock from "@/components/UI/UseDevModeDataBlock";

export default {
  name: "UiRadio",
  emits: ["changedValue"],
  // mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  components: { UiPrompt, UiTooltip },
  // mounted() {
  //   this.localElementName = this.checkedValueOnVoid(this.elementName)
  //     ? this.elementName
  //     : Math.random().toString();
  //   this.updateRadioListInOut();
  //   if (!this.isErrorEmpty && !this.isNeedChoice) {
  //     let timer = setInterval(() => {
  //       if (this.radioValues.length) {
  //         this.currentIndexRadioButton =
  //           this.checkedValueOnVoid(this.selectedItem) &&
  //           parseInt(this.selectedItem) < this.radioValues.length
  //             ? parseInt(this.selectedItem)
  //             : this.radioValues.length - 1;
  //         this.changeValue("mounted");
  //         clearInterval(timer);
  //       }
  //     }, 100);
  //     setTimeout(() => {
  //       clearInterval(timer);
  //     }, 10000);
  //   } else {
  //     this.changeValid("mounted");
  //   }
  // },
  // data() {
  //   return {
  //     currentIndexRadioButton: null,
  //     textErrorNotEmpty: "Обязательное поле.",
  //     localElementName: null,
  //     timerName: null,
  //     localRadioListInOut: [],
  //   };
  // },
  props: {
    radioValues: {
      type: Array,
      default: () => [],
    },
    /**
     * номер предвыборной кнопки
     */
    selectedItem: {
      type: [Number, String],
      default: 0,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    /**
     *  способ отображения - указать текстом
     *  default - base
     *  1) buttons
     *  2) onlyImage
     */
    typeDisplayClass: {
      type: String,
      default: "base",
    },
    ...UsePropsTemplates([
      "isColumn",
      "isNeedChoice",
      "formOutputMethod",
      "maxWidth",
      "maxHeight",
      "dependencyFormulaDisplay",
      "parentIsShow",
      "label",
      "notEmpty",
      "excludeFromCalculations",
      "elementName",
      "parentName",
      "formulaProcessingLogic",
      "classes",
      "templateName",
    ]),
  },
  setup(props, { emit }) {
    const label = props.label;
    const templateName = props.templateName;
    const store = useBaseStore();
    const currentIndexRadioButton = ref(null);
    const textErrorNotEmpty = "Обязательное поле.";
    const localElementName = ref(null);
    const timerName = ref(null);
    const localRadioListInOut = ref([]);

    const dependencyFormulaDisplay = toRef(props, "dependencyFormulaDisplay");
    const parentIsShow = toRef(props, "parentIsShow");

    const {
      isVisibilityFromDependency: isVisibilityFromDependencyLocal,
      constructLocalListElementDependencyInFormula,
      processingVariablesOnFormula,
      parsingFormulaVariables,
      costAfterProcessingDependencyPrice,
    } = UseForProcessingFormula({
      parentIsShow,
      dependencyFormulaDisplay,
      changeValid,
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

    const { checkedValueOnVoid, getImageDir, getArrayElementsFromFormula } =
      UseUtilityServices();

    const changedRadio = computed(() => {
      return currentIndexRadioButton.value !== null
        ? props.radioValues[currentIndexRadioButton.value]
        : null;
    });

    function changeValue(eventType = "click") {
      const radio = changedRadio.value;
      emit("changedValue", {
        value: radio?.value ? radio?.value : null,
        displayValue: radio?.radioName ? radio?.radioName : null,
        index: currentIndexRadioButton.value,
        name: localElementName.value,
        type: "radio",
        cost: checkedValueOnVoid(localCost.value)
          ? parseFloat(localCost.value)
          : 0,
        label,
        formOutputMethod:
          props.formOutputMethod !== "no" ? props.formOutputMethod : null,
        excludeFromCalculations: props.excludeFromCalculations,
        isShow: isVisibilityFromDependency.value,
        eventType,
        formulaProcessingLogic: props.formulaProcessingLogic,
        error: isErrorEmpty.value,
        parentName: props.parentName,
      });

      tryPassDependency();
      changeValid(eventType);
    }

    function changeValid(eventType) {
      store.checkValidationDataAndToggle({
        error: isErrorEmpty.value,
        name: localElementName.value,
        type: "radio",
        label,
        eventType,
        isShow: isVisibilityFromDependency.value,
        parentName: props.parentName,
      });
    }
    function tryPassDependency() {
      store.tryAddDependencyElement({
        name: localElementName.value,
        value: changedRadio.value?.value ? changedRadio.value?.value : null,
        isShow: isVisibilityFromDependency.value,
        displayValue: changedRadio.value?.radioName,
        type: "radio",
      });
    }

    function selectedCurrentRadio(index) {
      currentIndexRadioButton.value = parseInt(index);
      changeValue();
    }

    const imageDir = computed(() => {
      return getImageDir();
    });

    const mutationRadioValue = computed(() => {
      return props.radioValues.map((radioItem, index) => {
        if (radioItem?.image?.filename) {
          radioItem.image.filename = imageDir.value + radioItem.image.filename;
        }
        radioItem.value = radioItem.value?.toString()?.length
          ? radioItem.value
          : index + 1;
        return radioItem;
      });
    });
    function getNewListValuesBeforeCheckedDependency() {
      return mutationRadioValue.value.map((radio) => {
        if (radio?.dependencyFormulaItem?.length) {
          let formula = getArrayElementsFromFormula(
            radio.dependencyFormulaItem
          );
          constructLocalListElementDependencyInFormula(formula);
          setTimeout(() => {
            formula = processingVariablesOnFormula(formula);

            try {
              radio.isShow = eval(formula);
            } catch (e) {
              if (store.devMode) {
                console.error(e.message, formula);
              }
              radio.isShow = false;
            }
          }, 10);
        }
        radio.isShow = true;
        return radio;
      });
    }

    const radioValuesAfterProcessingDependency = computed(() => {
      return getNewListValuesBeforeCheckedDependency();
    });
    function updateRadioListInOut() {
      localRadioListInOut.value = [];
      if (timerName.value) {
        clearTimeout(timerName.value);
      }
      timerName.value = setTimeout(() => {
        localRadioListInOut.value = radioValuesAfterProcessingDependency.value;
      }, 100);
    }

    watch(
      () => props.selectedItem,
      (newValue) => {
        currentIndexRadioButton.value =
          checkedValueOnVoid(newValue) &&
          parseInt(newValue) < props.radioValues.length
            ? parseInt(props.selectedItem)
            : props.radioValues.length - 1;
        changeValue("selected");
      }
    );

    watch(
      () => radioValuesAfterProcessingDependency.value,
      (newValue, oldValue) => {
        if (newValue?.length !== oldValue?.length) {
          currentIndexRadioButton.value = null;
          changeValue("selected");
        }
        updateRadioListInOut();
      },
      { deep: true }
    );

    const radioType = computed(() => {
      return props.typeDisplayClass?.length ? props.typeDisplayClass : "base";
    });
    const onlyImage = computed(() => {
      return props.typeDisplayClass === "onlyImage";
    });
    const isErrorEmpty = computed(() => {
      return props.notEmpty && currentIndexRadioButton.value === null;
    });

    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
    const localCost = computed(() => {
      if (!changedRadio.value?.dependencyPrices?.length) {
        return changedRadio.value?.cost ? changedRadio.value?.cost : null;
      }

      let newCost = costAfterProcessingDependencyPrice(
        changedRadio.value?.dependencyPrices
      );
      if (newCost !== null) {
        return newCost;
      }
      return changedRadio.value?.cost ? changedRadio.value?.cost : null;
    });

    const width = computed(() => {
      return "max-width:" + props.maxWidth + "px";
    });
    const height = computed(() => {
      return "max-height:" + props.maxHeight + "px";
    });

    onMounted(() => {
      localElementName.value = checkedValueOnVoid(props.elementName)
        ? props.elementName
        : Math.random().toString();
      updateRadioListInOut();
      if (!isErrorEmpty.value && !props.isNeedChoice) {
        let timer = setInterval(() => {
          if (props.radioValues.length) {
            currentIndexRadioButton.value =
              checkedValueOnVoid(props.selectedItem) &&
              parseInt(props.selectedItem) < props.radioValues.length
                ? parseInt(props.selectedItem)
                : props.radioValues.length - 1;
            changeValue("mounted");
            clearInterval(timer);
          }
        }, 100);
        setTimeout(() => {
          clearInterval(timer);
        }, 10000);
      } else {
        changeValue("mounted");
      }
    });

    const { devModeData } = UseDevModeDataBlock({
      label,
      elementName: localElementName,
      dependencyFormulaDisplay,
      parsingFormulaVariables,
      isVisibilityFromDependency,
      templateName,
      changedRadio,
      localCost,
    });

    return {
      isVisibilityFromDependency,
      imageDir,
      width,
      height,
      textErrorNotEmpty,
      isErrorEmpty,
      radioType,
      onlyImage,
      isColumn: props.isColumn,
      label,
      classes: props.classes,
      localRadioListInOut,
      localElementName,
      currentIndexRadioButton,
      selectedCurrentRadio,
      changeValue,
      notEmpty: props.notEmpty,
      devModeData,
      changedRadio,
    };
  },

  // methods: {
  //   selectedCurrentRadio(index) {
  //     this.currentIndexRadioButton = parseInt(index);
  //     this.changeValue();
  //   },
  //   changeValue(eventType = "click") {
  //     const radio = this.changedRadio;
  //     this.$emit("changedValue", {
  //       value: radio?.value ? radio?.value : null,
  //       displayValue: radio?.radioName ? radio?.radioName : null,
  //       index: this.currentIndexRadioButton,
  //       name: this.localElementName,
  //       type: "radio",
  //       cost: this.checkedValueOnVoid(this.localCost)
  //         ? parseFloat(this.localCost)
  //         : 0,
  //       label: this.label,
  //       formOutputMethod:
  //         this.formOutputMethod !== "no" ? this.formOutputMethod : null,
  //       excludeFromCalculations: this.excludeFromCalculations,
  //       isShow: this.isVisibilityFromDependency,
  //       eventType,
  //       unit: this.unit,
  //       formulaProcessingLogic: this.formulaProcessingLogic,
  //     });
  //     this.tryPassDependency();
  //     this.changeValid(eventType);
  //   },
  //   changeValid(eventType) {
  //     this.checkValidationDataAndToggle({
  //       error: this.isErrorEmpty,
  //       name: this.localElementName,
  //       type: "radio",
  //       label: this.label,
  //       eventType,
  //       isShow: this.isVisibilityFromDependency,
  //       parentName: this.parentName,
  //     });
  //   },
  //   tryPassDependency() {
  //     this.tryAddDependencyElement({
  //       name: this.localElementName,
  //       value: this.changedRadio?.value ? this.changedRadio?.value : null,
  //       isShow: this.isVisibilityFromDependency,
  //       displayValue: this.changedRadio?.radioName,
  //       type: "radio",
  //     });
  //   },
  //   getNewListValuesBeforeCheckedDependency() {
  //     return this.mutationRadioValue.map((radio) => {
  //       if (radio?.dependencyFormulaItem?.length) {
  //         let formula = this.getArrayElementsFromFormula(
  //           radio.dependencyFormulaItem
  //         );
  //         this.constructLocalListElementDependencyInFormula(formula);
  //         setTimeout(() => {
  //           formula = this.processingVariablesOnFormula(formula);
  //
  //           try {
  //             radio.isShow = eval(formula);
  //           } catch (e) {
  //             if (this.devMode) {
  //               console.error(e.message, formula);
  //             }
  //             radio.isShow = false;
  //           }
  //         }, 10);
  //       }
  //       radio.isShow = true;
  //       return radio;
  //     });
  //   },
  //   updateRadioListInOut() {
  //     this.localRadioListInOut = [];
  //     if (this.timerName) {
  //       clearTimeout(this.timerName);
  //     }
  //     this.timerName = setTimeout(() => {
  //       this.localRadioListInOut = this.radioValuesAfterProcessingDependency;
  //     }, 100);
  //   },
  // },
  // watch: {
  //   selectedItem(newValue) {
  //     this.currentIndexRadioButton =
  //       this.checkedValueOnVoid(newValue) &&
  //       parseInt(newValue) < this.radioValues.length
  //         ? parseInt(this.selectedItem)
  //         : this.radioValues.length - 1;
  //     this.changeValue("selected");
  //   },
  //   radioValuesAfterProcessingDependency: {
  //     handler(newValue, oldValue) {
  //       if (newValue?.length !== oldValue?.length) {
  //         this.currentIndexRadioButton = null;
  //         this.changeValue("selected");
  //       }
  //       this.updateRadioListInOut();
  //     },
  //     deep: true,
  //   },
  // },
  // computed: {
  //   ...mapState(useBaseStore, [
  //     "tryAddDependencyElement",
  //     "checkValidationDataAndToggle",
  //     "showInsideElementStatus",
  //     "devMode",
  //     "getImageDir",
  //   ]),
  //   changedRadio() {
  //     return this.currentIndexRadioButton !== null
  //       ? this.radioValues[this.currentIndexRadioButton]
  //       : null;
  //   },
  //   radioType() {
  //     return this.typeDisplayClass?.length ? this.typeDisplayClass : "base";
  //   },
  //   onlyImage() {
  //     return this.typeDisplayClass === "onlyImage";
  //   },
  //   isErrorEmpty() {
  //     return this.notEmpty && this.currentIndexRadioButton === null;
  //   },
  //
  //   /**
  //    * Возвращает цену подходящую условию, если моле отображается
  //    * Если не одна цена не подходит, то возвращается стандартная
  //    * @returns {Number|String|*}
  //    */
  //   localCost() {
  //     if (!this.changedRadio?.dependencyPrices?.length) {
  //       return this.changedRadio?.cost ? this.changedRadio?.cost : null;
  //     }
  //
  //     let newCost = this.costAfterProcessingDependencyPrice(
  //       this.changedRadio?.dependencyPrices
  //     );
  //     if (newCost !== null) {
  //       return newCost;
  //     }
  //     return this.changedRadio?.cost ? this.changedRadio?.cost : null;
  //   },
  //
  //   mutationRadioValue() {
  //     return this.radioValues.map((radioItem, index) => {
  //       if (radioItem?.image?.filename) {
  //         radioItem.image.filename = this.imageDir + radioItem.image.filename;
  //       }
  //       radioItem.value = radioItem.value?.toString()?.length
  //         ? radioItem.value
  //         : index + 1;
  //       return radioItem;
  //     });
  //   },
  //
  //   radioValuesAfterProcessingDependency() {
  //     return this.getNewListValuesBeforeCheckedDependency();
  //   },
  //   imageDir() {
  //     return this.getImageDir;
  //   },
  //   width() {
  //     return "max-width:" + this.maxWidth + "px";
  //   },
  //   height() {
  //     return "max-height:" + this.maxHeight + "px";
  //   },
  // },
};
</script>

<style scoped lang="scss"></style>
