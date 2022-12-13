<template>
  <div class="calc__wrapper-group-data">
    <div
      ref="parent"
      v-if="isVisibilityFromDependency"
      class="calc__select-wrapper"
      :class="[{ 'is-column': isColumn }, classes]"
    >
      <div class="calc__select-label" v-if="label">
        {{ label }}
        <div class="empty-block" v-if="notEmpty">*</div>
        <slot name="prompt"></slot>
      </div>
      <div class="calc__select-change-wrapper">
        <div
          v-if="currentOption"
          class="calc__select-change-item"
          @click="toggleOpenClose"
          :class="{ 'is-open': isOpen }"
        >
          <div
            v-if="currentOption?.image?.filename"
            class="calc__select-image-wrapper"
          >
            <img
              :alt="currentOption.selectName"
              class="calc__select-image-item"
              :src="imageDir + currentOption.image.filename"
            />
          </div>
          {{ currentOption.selectName }}
          <ui-prompt
            v-if="currentOption?.prompt?.length"
            :prompt-text="currentOption.prompt"
          ></ui-prompt>
        </div>
        <div class="calc__select-option-wrapper" v-if="isOpen">
          <div
            class="calc__select-option-item"
            @click="changeSelect(option, idx)"
            v-for="(option, idx) in selectValuesAfterProcessingDependency"
            :key="idx"
          >
            <template
              v-if="currentOption?.value !== option?.value && option.isShow"
            >
              <div
                v-if="option?.image?.filename"
                class="calc__select-image-wrapper"
              >
                <img
                  :alt="option.selectName"
                  class="calc__select-image-item"
                  :src="imageDir + option.image.filename"
                />
              </div>
              <div class="calc__select-option-item-text">
                {{ option.selectName }}
              </div>
              <ui-prompt
                v-if="option?.prompt?.length"
                :prompt-text="option.prompt"
              ></ui-prompt>
            </template>
          </div>
        </div>
      </div>
      <ui-tooltip
        :is-show="isErrorEmpty"
        :tooltip-text="textErrorNotEmpty"
        :local-can-be-shown="isVisibilityFromDependency"
      />
    </div>
    <div v-if="devModeData?.length" v-html="devModeData"></div>
  </div>
</template>

<script>
import UiTooltip from "@/components/UI/UiTooltip";
import UiPrompt from "@/components/UI/UiPrompt";

import { useBaseStore } from "@/store/piniaStore";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import UseUtilityServices from "@/components/UI/UseUtilityServices";
import UseForProcessingFormula from "@/components/UI/UseForProcessingFormula";
import UseDevModeDataBlock from "@/components/UI/UseDevModeDataBlock";
import {
  ref,
  onMounted,
  toRef,
  computed,
  watch,
  reactive,
  getCurrentInstance,
} from "vue";

export default {
  name: "UiSelect",
  emits: ["changedValue"],
  components: { UiTooltip, UiPrompt },
  props: {
    selectValues: {
      type: Array,
      default: () => [],
    },

    /**
     * номер выбранного селекта
     */
    selectedItem: {
      type: [Number, String],
      default: 0,
      validator(value) {
        return !isNaN(Number(value));
      },
    },
    ...UsePropsTemplates([
      "isColumn",
      "isNeedChoice",
      "formOutputMethod",
      "label",
      "notEmpty",
      "excludeFromCalculations",
      "elementName",
      "parentName",
      "formulaProcessingLogic",
      "classes",
      "templateName",
      "parentIsShow",
      "dependencyFormulaDisplay",
    ]),
  },
  setup(props, { emit }) {
    const store = useBaseStore();
    const isOpen = ref(true);
    const mockOption = {
      selectName: "Не выбрано!",
      value: "null",
    };
    const currentOption = reactive(mockOption);

    const localSelectValues = ref([]);

    const currentIndexOption = ref(null);

    const textErrorNotEmpty = "Обязательное поле.";
    const parentIsShow = toRef(props, "parentIsShow");
    const dependencyFormulaDisplay = toRef(props, "dependencyFormulaDisplay");

    const instance = getCurrentInstance();

    const { checkedValueOnVoid, getArrayElementsFromFormula } =
      UseUtilityServices();
    const {
      isVisibilityFromDependency: isVisibilityFromDependencyLocal,
      parsingFormulaVariables,
      constructLocalListElementDependencyInFormula,
      isElementDependency,
      processingVariablesOnFormula,
      localDependencyList,
      costAfterProcessingDependencyPrice,
    } = UseForProcessingFormula({
      parentIsShow,
      dependencyFormulaDisplay,
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

    const { devModeData } = UseDevModeDataBlock({
      label: props.label,
      elementName: props.elementName,
      dependencyFormulaDisplay,
      parsingFormulaVariables,
      isVisibilityFromDependency,
      templateName: props.template,
    });

    const open = () => {
      if (
        selectValuesAfterProcessingDependency.value.filter(
          (option) => option.isShow
        ).length > 1
      ) {
        isOpen.value = true;
      }
    };

    const toggleOpenClose = () => {
      if (
        selectValuesAfterProcessingDependency.value.filter(
          (option) => option.isShow
        ).length > 1
      ) {
        isOpen.value = !isOpen.value;
      }
    };

    const close = () => {
      isOpen.value = false;
    };

    const changeSelect = (item, inx, eventType = "click") => {
      if (props.notEmpty && inx === 0) {
        currentIndexOption.value = null;
      } else {
        currentIndexOption.value = inx;
      }
      currentOption.selectName = item.selectName;
      currentOption.value = item.value;
      changeValue(eventType);
      close();
    };
    const changeValue = (eventType = "click") => {
      emit("changedValue", {
        value: currentOption?.value,
        displayValue: currentOption?.selectName,
        index: currentIndexOption.value,
        name: localElementName.value,
        type: "select",
        cost: checkedValueOnVoid(localCost.value)
          ? parseFloat(localCost.value)
          : 0,
        label: props.label,
        formOutputMethod:
          props.formOutputMethod !== "no" ? props.formOutputMethod : null,
        excludeFromCalculations: props.excludeFromCalculations,
        isShow: isVisibilityFromDependency.value,
        eventType,
        formulaProcessingLogic: props.formulaProcessingLogic,
      });
      tryPassDependency();
      changeValid(eventType);
    };

    const changeValid = (eventType) => {
      store.checkValidationDataAndToggle({
        error: isErrorEmpty.value,
        name: localElementName.value,
        type: "select",
        label: props.label,
        eventType,
        isShow: isVisibilityFromDependency.value,
        parentName: props.parentName,
      });
    };

    const tryPassDependency = () => {
      store.tryAddDependencyElement({
        name: localElementName.value,
        value: currentOption?.value,
        isShow: isVisibilityFromDependency.value,
        displayValue: currentOption?.selectName,
        type: "select",
      });
    };

    watch(
      () => props.selectedItem,
      (newValue) => {
        currentIndexOption.value =
          checkedValueOnVoid(newValue) &&
          parseInt(newValue) < localSelectValues.value.length
            ? parseInt(newValue)
            : localSelectValues.value.length - 1;
        console.log(534534);
        // currentOption = localSelectValues.value[currentIndexOption.value];
        changeValue();
      }
    );

    watch(
      () => isOpen.value,
      (newValue) => {
        if (newValue && !Object.keys(localDependencyList)?.length) {
          localSelectValues.value?.forEach((select) => {
            if (select?.dependencyFormulaItem?.length) {
              let formula = getArrayElementsFromFormula(
                select.dependencyFormulaItem
              );
              constructLocalListElementDependencyInFormula(formula);
            }
          });
        }
      }
    );

    const mutationSelectValue = computed(() => {
      return localSelectValues.value.map((selectItem, index) => {
        const localIndex = needMockValue ? index : index + 1;
        selectItem.value = selectItem.value?.toString()?.length
          ? selectItem.value
          : localIndex;
        return selectItem;
      });
    });
    /**
     * Получить список селектов после обработки формул на отображение самих селектов
     * @returns {*[]}
     */
    const selectValuesAfterProcessingDependency = computed(() => {
      return mutationSelectValue.value.map((selectItem) => {
        if (!selectItem?.dependencyFormulaItem?.length) {
          selectItem.isShow = true;
          return selectItem;
        }

        let formula = getArrayElementsFromFormula(
          selectItem.dependencyFormulaItem
        );

        let allDependencyShow = formula.every((item) => {
          if (isElementDependency(item)) {
            return localDependencyList[item]?.isShow;
          }
          return true;
        });

        if (!allDependencyShow) {
          selectItem.isShow = true;
          return selectItem;
        }

        formula = formula.map((item) =>
          item.toLowerCase() === "self" ? selectItem.value : item
        );
        constructLocalListElementDependencyInFormula(formula);

        formula = processingVariablesOnFormula(formula);
        try {
          selectItem.isShow = eval(formula);
          return selectItem;
        } catch (e) {
          if (store.devMode) {
            console.error(e.message, formula);
          }
          selectItem.isShow = false;
          return selectItem;
        }
      });
    });

    const amountVisibleSelects = computed(() => {
      return selectValuesAfterProcessingDependency.value.filter(
        (item) => item.isShow
      ).length;
    });
    watch(
      () => amountVisibleSelects.value,
      () => {
        let length = selectValuesAfterProcessingDependency.value.length;
        if (!currentOption) {
          return null;
        }
        for (let i = 0; i < length; i++) {
          if (
            selectValuesAfterProcessingDependency.value[i].value ===
              currentOption?.value &&
            currentOption.isShow
          ) {
            return;
          }
        }

        for (let i = 0; i < length; i++) {
          if (selectValuesAfterProcessingDependency.value[i].isShow) {
            changeSelect(
              selectValuesAfterProcessingDependency.value[i],
              i,
              "changeAmountSelectList"
            );
            return;
          }
        }
      }
    );
    const needMockValue = () =>
      computed(() => {
        return props.notEmpty || props.isNeedChoice;
      });
    const localElementName = computed(() => {
      return checkedValueOnVoid(props.elementName)
        ? props.elementName
        : Math.random().toString();
    });

    const imageDir = computed(() => {
      return store.getImageDir;
    });
    const isErrorEmpty = computed(() => {
      return props.notEmpty && currentIndexOption.value === null;
    });

    /**
     * Возвращает цену подходящую условию, если моле отображается
     * Если не одна цена не подходит, то возвращается стандартная
     * @returns {Number|String|*}
     */
    const localCost = computed(() => {
      if (!currentOption?.dependencyPrices?.length) {
        return currentOption?.cost ? currentOption?.cost : null;
      }

      let newCost = costAfterProcessingDependencyPrice(
        currentOption?.dependencyPrices
      );
      if (newCost !== null) {
        return newCost;
      }
      return currentOption?.cost ? currentOption?.cost : null;
    });

    onMounted(() => {
      localSelectValues.value = props.selectValues;
      if (needMockValue) {
        localSelectValues.value.unshift(mockOption);
      }
      if (!props.notEmpty && !props.isNeedChoice) {
        let timer = setInterval(() => {
          if (
            currentIndexOption.value === null &&
            localSelectValues.value.length
          ) {
            currentIndexOption.value =
              checkedValueOnVoid(props.selectedItem) &&
              parseInt(props.selectedItem) < localSelectValues.value.length
                ? parseInt(props.selectedItem)
                : localSelectValues.value.length - 1;

            changeSelect(
              localSelectValues.value[currentIndexOption.value],
              currentIndexOption.value,
              "mounted"
            );
            clearInterval(timer);
          }
        }, 100);
        setTimeout(() => {
          clearInterval(timer);
        }, 10000);
      } else {
        changeSelect(localSelectValues.value[0], null, "mounted");
      }
      window.addEventListener("click", (e) => {
        if (!instance.refs?.parent.contains(e.target)) {
          close();
        }
      });
    });

    return {
      imageDir,
      open,
      currentOption,
      toggleOpenClose,
      isOpen,
      changeSelect,
      isErrorEmpty,
      textErrorNotEmpty,
      selectValuesAfterProcessingDependency,
      isColumn: props.isColumn,
      devModeData,
      isVisibilityFromDependency,
      label: props.label,
      classes: props.classes,
      notEmpty: props.notEmpty,
    };
  },
};
</script>

<style scoped></style>
