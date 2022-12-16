<template>
  <div
    class="calc__duplicator-wrapper"
    v-if="mutationsInputData?.templates?.length"
  >
    <div class="calc__duplicator-label">{{ mutationsInputData?.label }}</div>
    <template
      v-for="(template, inx) in mutationsInputData?.templates"
      :key="index + '_' + inx"
    >
      <templates-wrapper-for-duplicator
        v-if="
          ['UiAccordion', 'UiTab', 'UiBisection'].includes(template?.template)
        "
        :parent-is-show="parentIsShow"
        :template="template"
        :index="index + '_' + inx"
        :parent-name="mutationsInputData.elementName"
        @changedValue="changeValue"
      />
      <templates-wrapper
        v-else
        :parent-is-show="parentIsShow"
        :template="template"
        :index="index + '_' + inx"
        :parent-name="mutationsInputData.elementName"
        @changedValue="changeValue"
      />
    </template>
    <button
      v-if="!isDuplicate"
      class="calc__duplicator-duplicate"
      @click="tryDuplicate"
    >
      {{
        duplicatorData?.buttonName?.length
          ? duplicatorData?.buttonName
          : "Дублировать"
      }}
    </button>
    <button
      v-if="isDuplicate"
      class="calc__duplicator-delete"
      @click="deleteDuplicate"
    >
      X
    </button>
  </div>
  <div class="dev-block" v-if="devModeData.length" v-html="devModeData"></div>
</template>

<script>
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";
import TemplatesWrapperForDuplicator from "@/components/UI/TemplatesWrapperForDuplicator";

import { useBaseStore } from "@/store/piniaStore";
import UsePropsTemplates from "@/components/UI/UsePropsTemplates";
import { computed, onMounted, reactive, ref, toRef } from "vue";

import UseUtilityServices from "@/components/UI/UseUtilityServices";
import UseForProcessingFormula from "@/components/UI/UseForProcessingFormula";

export default {
  name: "UiDuplicatorWrapper",
  emits: ["changedValue", "duplicate", "deleteDuplicator"],
  components: { TemplatesWrapper, TemplatesWrapperForDuplicator },
  // mixins: [MixinsForProcessingFormula, MixinsUtilityServices],
  props: {
    duplicatorData: {
      type: Object,
      default: null,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    originVariables: {
      type: Array,
      default: () => [],
    },
    originData: {
      type: Object,
      default: () => {},
    },
    ...UsePropsTemplates([
      "formula",
      "parentName",
      "parentIsShow",
      "index",
      "dependencyFormulaDisplay",
    ]),
  },
  setup(props, { emit }) {
    const store = useBaseStore();

    const counterDuplicate = ref(0);
    const localResultData = reactive({});
    const mutationsInputData = ref([]);
    const regExpStringSplitFormula =
      /(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)|(^[0-9]+(\.[0-9]+)?)/;
    const parentIsShow = toRef(props, "parentIsShow");
    const dependencyFormulaDisplay = toRef(props, "dependencyFormulaDisplay");

    const {
      getArrayElementsFromFormula,
      getProxyFreeVariables,
      processingArrayOnFormulaProcessingLogic,
    } = UseUtilityServices();
    UseForProcessingFormula(
      parentIsShow,
      dependencyFormulaDisplay,
      changeValue
    );

    /**
     * формула со всеми конечными данными и обработанными переменными
     * @returns {*}
     */
    const compileFormulaWitchData = computed(() => {
      if (!variablesInFormula.value.length) {
        return resultSummaDataFriVariablesOutsideFormula.value;
      }

      return processingArrayOnFormulaProcessingLogic(
        dataListVariablesOnFormula.value
      )
        .map((item) => {
          if (!item?.name?.length) {
            return item;
          } else if (item.name === store.getNameReserveVariable) {
            return item.cost;
          } else if (
            listLocalVariablesUsedInFormulaForPrefix.value.includes(
              item.name
            ) &&
            localResultData[item.name]?.isShow &&
            !item.excludeFromCalculations
          ) {
            return localResultData[item.name].cost;
          } else if (
            listGlobalsVariables.value.includes(item.name) &&
            store.getResultElementOnName(item.name)?.isShow &&
            !item.excludeFromCalculations
          ) {
            return store.getResultElementOnName(item.name)?.cost;
          } else {
            return "null";
          }
        })
        .join(" ")
        ?.replace(/[\+\-\*\/] *\( *\)|\( *\) *[\+\-\*\/]/g, "");
    });

    const localCost = computed(() => {
      if (
        typeof compileFormulaWitchData.value === "string" &&
        compileFormulaWitchData.value?.includes("null")
      ) {
        return null;
      }

      try {
        return eval(compileFormulaWitchData.value);
      } catch (e) {
        if (store.devMode) {
          console.error(e.message, compileFormulaWitchData.value);
        }
        return null;
      }
    });

    function changeValue(data) {
      localResultData[data.name] = data;
      emit("changedValue", {
        name: mutationsInputData?.value?.elementName,
        type: "duplicator",
        label: mutationsInputData?.value?.label,
        cost: localCost.value,
        value: null,
        displayValue: localCost.value,
        formOutputMethod: mutationsInputData?.value?.formOutputMethod,
        eventType: data.eventType,
        unit: "",
        isShow: props.parentIsShow,
        excludeFromCalculations:
          mutationsInputData?.value.excludeFromCalculations,
        insertedTemplates: localResultData,
        formulaProcessingLogic: props.originData?.formulaProcessingLogic,
      });
    }

    function tryDuplicate() {
      counterDuplicate.value++;
      const returnData = updateInputData(
        props.originData,
        counterDuplicate.value
      );
      emit("duplicate", returnData);
    }

    function deleteDuplicate() {
      mutationsInputData?.templates.map((item) => {
        store.tryDeleteDependencyElementOnName(item.elementName);
      });
      emit("deleteDuplicator", props.duplicatorData.elementName);
    }

    function updateInputData(data, index) {
      let mutationsData = JSON.parse(JSON.stringify(data));
      mutationsData.index = props.index + index;

      mutationsData.parentDuplicator = props.parentName;

      mutationsData.formula = mutationFormulaResult.value;
      mutationsData.isDuplicate = true;

      mutationsData = updateIndexElementsInDuple(mutationsData, index);

      return mutationsData;
    }

    function updateIndexElementsInDuple(object, index) {
      for (let prop in object) {
        if (typeof object[prop] === "object") {
          object[prop] = updateIndexElementsInDuple(object[prop], index);
        } else if (prop === "elementName") {
          object[prop] = updateNameItem(object, index);
        } else if (prop === "label") {
          object[prop] =
            object[prop]?.length && index > 0
              ? object[prop] + " ( " + index + " )"
              : object[prop];
        } else if (prop === "labelSecond") {
          object[prop] =
            object[prop]?.length && index > 0
              ? object[prop] + " ( " + index + " )"
              : object[prop];
        } else if (
          (prop === "dependencyFormulaDisplay" ||
            prop === "dependencyFormulaCost" ||
            prop === "dependencyFormulaItem") &&
          object[prop].length
        ) {
          object[prop] = addIndexIndexInFormulaElements(
            object[prop],
            index
          ).join("");
        }
      }
      return object;
    }

    function updateNameItem(item, index) {
      item.elementName = item?.elementName?.length
        ? item?.elementName + "_" + index
        : item?.json_id + "_" + index;
      return item.elementName;
    }

    /**
     * в формулу добавляем префиксы для переменных дупликатора
     * @param formulaString
     * @param index
     * @returns {*}
     */
    function addIndexIndexInFormulaElements(formulaString, index) {
      return getArrayElementsFromFormula(formulaString).map((item) => {
        const isFind = !Boolean(item.match(regExpStringSplitFormula));
        if (isFind && props.originVariables.includes(item)) {
          item = item + "_" + index;
        }
        return item;
      });
    }

    /**
     * Разбиваем полученную формулу на массив с переменными и знаками.
     * Избавляемся от пустых элементов.
     * @returns {*}
     */
    const variablesInFormula = computed(() => {
      return getArrayElementsFromFormula(props.formula);
    });

    /**
     * Список переменных в формуле из глобального окружения
     * @returns {*}
     */
    const listGlobalsVariables = computed(() => {
      return variablesInFormula.value.filter((item) => {
        return (
          !props.originVariables.includes(item) &&
          !Boolean(item.match(regExpStringSplitFormula)) &&
          item !== store.getNameReserveVariable
        );
      });
    });
    /**
     * Список локальных переменных используемых в формуле
     * @returns {*}
     */
    const listLocalVariablesUsedInFormula = computed(() => {
      return variablesInFormula.value
        .filter(
          (item) =>
            !Boolean(item.match(regExpStringSplitFormula)) &&
            item !== store.getNameReserveVariable
        )
        .filter((item) => !listGlobalsVariables.value.includes(item));
    });

    /**
     * Список локальных переменных используемых в формуле c префиксом
     * @returns {*}
     */
    const listLocalVariablesUsedInFormulaForPrefix = computed(() => {
      return listLocalVariablesUsedInFormula.value.map(
        (item) => item + "_" + props.index
      );
    });

    /**
     * Список локальных переменных не используемых в формуле
     * @returns {*[]}
     */
    const arrayFreeVariablesOutsideFormula = computed(() => {
      return props.originVariables
        .filter((item) => !listLocalVariablesUsedInFormula.value.includes(item))
        .map((item) => item + "_" + props.index);
    });
    /**
     * Список переменных не используемых в формуле
     * @returns {[]}
     */
    const dataFreeVariablesOutsideFormula = computed(() => {
      let localData = [];
      arrayFreeVariablesOutsideFormula.value.forEach((elementName) => {
        if (localResultData[elementName]) {
          localData.push(localResultData[elementName]);
        }
      });
      return localData;
    });

    /**
     * Сумма всех элементов не вошедших в формулу
     * @returns {unknown}
     */
    const resultSummaDataFriVariablesOutsideFormula = computed(() => {
      return dataFreeVariablesOutsideFormula.value?.reduce(
        (reduceSumma, item) => {
          if (
            item.cost !== null &&
            !item.excludeFromCalculations &&
            item.isShow
          ) {
            return reduceSumma + parseFloat(item.cost);
          }
          return reduceSumma + 0;
        },
        0
      );
    });

    /**
     * в формулу добавляем префиксы для переменных дупликатора
     * @returns {*}
     */
    const attachIndexForFormulaElements = computed(() => {
      return variablesInFormula.value.map((item) => {
        const isFind = !Boolean(item.match(regExpStringSplitFormula));
        if (isFind && props.originVariables.includes(item)) {
          item = item + "_" + props.index;
        }
        return item;
      });
    });

    /**
     * Список переменных из формулы вместе с данными
     * @returns {*}
     */
    const dataListVariablesOnFormula = computed(() => {
      return attachIndexForFormulaElements.value?.map((item) => {
        if (item === store.getNameReserveVariable) {
          return getProxyFreeVariables(
            resultSummaDataFriVariablesOutsideFormula.value
          );
        } else if (listGlobalsVariables.value.includes(item)) {
          return store.getResultElementOnName(item);
        } else {
          const data = Object.values(localResultData).filter(
            (itemInner) => itemInner.name === item
          );
          return data.length ? data[0] : item;
        }
      });
    });

    /**
     * конечная формула после обработки в виде строки с переменными
     * @returns {*}
     */
    const mutationFormulaResult = computed(() => {
      return attachIndexForFormulaElements.value.join(" ");
    });

    const devModeData = computed(() => {
      if (!store.devMode || !store.showInsideElementStatus) {
        return "";
      }
      const textLabel = `<div>Название группы элементов в дупликаторе: ${mutationsInputData.value?.label}</div>`;
      const textFormula = `<div>Базовая формула: ${
        props.formula?.length
          ? getArrayElementsFromFormula(props.formula).join(" ")
          : "Нет"
      }</div>`;
      let isCompiledFormula = false;
      try {
        if (localCost.value !== null) {
          isCompiledFormula = true;
        }
      } catch (e) {
        isCompiledFormula = false;
      }

      const textFormulaOnData = `<div>Формула с данными: ${
        compileFormulaWitchData.value?.length
          ? compileFormulaWitchData.value
          : "Нет"
      }</div>`;
      const resultProcessingFormula = `<div>Результат расчета: ${
        isCompiledFormula ? localCost.value : "не возможно посчитать!"
      }</div>`;

      return `
      <hr/>
      ${textLabel}
      ${textFormula}
      ${textFormulaOnData}
      ${resultProcessingFormula}
      `;
    });

    onMounted(() => {
      if (props.isDuplicate) {
        mutationsInputData.value = props.duplicatorData;
      } else {
        mutationsInputData.value = updateInputData(props.duplicatorData, 0);
      }
    });

    return {
      mutationsInputData,
      index: props.index,
      changeValue,
      tryDuplicate,
      deleteDuplicate,
      parentIsShow,
      devModeData,
    };
  },
  // mounted() {
  //   if (this.isDuplicate) {
  //     this.mutationsInputData = this.duplicatorData;
  //   } else {
  //     this.mutationsInputData = this.updateInputData(this.duplicatorData, 0);
  //   }
  // },
  // data() {
  //   return {
  //     counterDuplicate: 0,
  //     localResultData: {},
  //     mutationsInputData: null,
  //     regExpStringSplitFormula:
  //       /(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)|(^[0-9]+(\.[0-9]+)?)/,
  //   };
  // },
  methods: {
    // changeValue(data) {
    //   this.localResultData[data.name] = data;
    //   this.$emit("changedValue", {
    //     name: this.mutationsInputData.elementName,
    //     type: "duplicator",
    //     label: this.mutationsInputData.label,
    //     cost: this.localCost,
    //     value: null,
    //     displayValue: this.localCost,
    //     formOutputMethod: this.mutationsInputData?.formOutputMethod,
    //     eventType: data.eventType,
    //     unit: "",
    //     isShow: this.parentIsShow,
    //     excludeFromCalculations:
    //       this.mutationsInputData.excludeFromCalculations,
    //     insertedTemplates: this.localResultData,
    //     formulaProcessingLogic: this.originData?.formulaProcessingLogic,
    //   });
    // },
    // tryDuplicate() {
    //   this.counterDuplicate++;
    //   const returnData = this.updateInputData(
    //     this.originData,
    //     this.counterDuplicate
    //   );
    //   this.$emit("duplicate", returnData);
    // },
    // deleteDuplicate() {
    //   this.mutationsInputData?.templates.map((item) => {
    //     this.tryDeleteDependencyElementOnName(item.elementName);
    //   });
    //   this.$emit("deleteDuplicator", this.duplicatorData.elementName);
    // },
    // updateInputData(data, index) {
    //   let mutationsData = JSON.parse(JSON.stringify(data));
    //   mutationsData.index = this.index + index;
    //
    //   mutationsData.parentDuplicator = this.parentName;
    //
    //   mutationsData.formula = this.mutationFormulaResult;
    //   mutationsData.isDuplicate = true;
    //
    //   mutationsData = this.updateIndexElementsInDuple(mutationsData, index);
    //
    //   return mutationsData;
    // },
    // updateIndexElementsInDuple(object, index) {
    //   for (let prop in object) {
    //     if (typeof object[prop] === "object") {
    //       object[prop] = this.updateIndexElementsInDuple(object[prop], index);
    //     } else if (prop === "elementName") {
    //       object[prop] = this.updateNameItem(object, index);
    //     } else if (prop === "label") {
    //       object[prop] =
    //         object[prop]?.length && index > 0
    //           ? object[prop] + " ( " + index + " )"
    //           : object[prop];
    //     } else if (prop === "labelSecond") {
    //       object[prop] =
    //         object[prop]?.length && index > 0
    //           ? object[prop] + " ( " + index + " )"
    //           : object[prop];
    //     } else if (
    //       (prop === "dependencyFormulaDisplay" ||
    //         prop === "dependencyFormulaCost" ||
    //         prop === "dependencyFormulaItem") &&
    //       object[prop].length
    //     ) {
    //       object[prop] = this.addIndexIndexInFormulaElements(
    //         object[prop],
    //         index
    //       ).join("");
    //     }
    //   }
    //   return object;
    // },
    // updateNameItem(item, index) {
    //   item.elementName = item?.elementName?.length
    //     ? item?.elementName + "_" + index
    //     : item?.json_id + "_" + index;
    //   return item.elementName;
    // },
    //
    // /**
    //  * в формулу добавляем префиксы для переменных дупликатора
    //  * @param formulaString
    //  * @param index
    //  * @returns {*}
    //  */
    // addIndexIndexInFormulaElements(formulaString, index) {
    //   return this.getArrayElementsFromFormula(formulaString).map((item) => {
    //     const isFind = !Boolean(item.match(this.regExpStringSplitFormula));
    //     if (isFind && this.originVariables.includes(item)) {
    //       item = item + "_" + index;
    //     }
    //     return item;
    //   });
    // },
  },
  computed: {
    // ...mapState(useBaseStore, [
    //   "tryDeleteDependencyElementOnName",
    //   "getAllResultsElements",
    //   "getNameReserveVariable",
    //   "getResultElementOnName",
    //   "devMode",
    //   "showInsideElementStatus",
    // ]),
    // /**
    //  * Разбиваем полученную формулу на массив с переменными и знаками.
    //  * Избавляемся от пустых элементов.
    //  * @returns {*}
    //  */
    // variablesInFormula() {
    //   return this.getArrayElementsFromFormula(this.formula);
    // },
    //
    // /**
    //  * Список переменных в формуле из глобального окружения
    //  * @returns {*}
    //  */
    // listGlobalsVariables() {
    //   return this.variablesInFormula.filter((item) => {
    //     return (
    //       !this.originVariables.includes(item) &&
    //       !Boolean(item.match(this.regExpStringSplitFormula)) &&
    //       item !== this.getNameReserveVariable
    //     );
    //   });
    // },
    // /**
    //  * Список локальных переменных используемых в формуле
    //  * @returns {*}
    //  */
    // listLocalVariablesUsedInFormula() {
    //   return this.variablesInFormula
    //     .filter(
    //       (item) =>
    //         !Boolean(item.match(this.regExpStringSplitFormula)) &&
    //         item !== this.getNameReserveVariable
    //     )
    //     .filter((item) => !this.listGlobalsVariables.includes(item));
    // },
    // /**
    //  * Список локальных переменных используемых в формуле c префиксом
    //  * @returns {*}
    //  */
    // listLocalVariablesUsedInFormulaForPrefix() {
    //   return this.listLocalVariablesUsedInFormula.map(
    //     (item) => item + "_" + this.index
    //   );
    // },
    // /**
    //  * Список локальных переменных не используемых в формуле
    //  * @returns {*[]}
    //  */
    // arrayFreeVariablesOutsideFormula() {
    //   return this.originVariables
    //     .filter((item) => !this.listLocalVariablesUsedInFormula.includes(item))
    //     .map((item) => item + "_" + this.index);
    // },
    // /**
    //  * Список переменных не используемых в формуле
    //  * @returns {[]}
    //  */
    // dataFreeVariablesOutsideFormula() {
    //   let localData = [];
    //   this.arrayFreeVariablesOutsideFormula.forEach((elementName) => {
    //     if (this.localResultData[elementName]) {
    //       localData.push(this.localResultData[elementName]);
    //     }
    //   });
    //   return localData;
    // },
    // /**
    //  * Сумма всех элементов не вошедших в формулу
    //  * @returns {unknown}
    //  */
    // resultSummaDataFriVariablesOutsideFormula() {
    //   return this.dataFreeVariablesOutsideFormula?.reduce(
    //     (reduceSumma, item) => {
    //       if (
    //         item.cost !== null &&
    //         !item.excludeFromCalculations &&
    //         item.isShow
    //       ) {
    //         return reduceSumma + parseFloat(item.cost);
    //       }
    //       return reduceSumma + 0;
    //     },
    //     0
    //   );
    // },
    // /**
    //  * в формулу добавляем префиксы для переменных дупликатора
    //  * @returns {*}
    //  */
    // attachIndexForFormulaElements() {
    //   return this.variablesInFormula.map((item) => {
    //     const isFind = !Boolean(item.match(this.regExpStringSplitFormula));
    //     if (isFind && this.originVariables.includes(item)) {
    //       item = item + "_" + this.index;
    //     }
    //     return item;
    //   });
    // },
    //
    // /**
    //  * Список переменных из формулы вместе с данными
    //  * @returns {*}
    //  */
    // dataListVariablesOnFormula() {
    //   return this.attachIndexForFormulaElements?.map((item) => {
    //     if (item === this.getNameReserveVariable) {
    //       return this.getProxyFreeVariables(
    //         this.resultSummaDataFriVariablesOutsideFormula
    //       );
    //     } else if (this.listGlobalsVariables.includes(item)) {
    //       return this.getResultElementOnName(item);
    //     } else {
    //       const data = Object.values(this.localResultData).filter(
    //         (itemInner) => itemInner.name === item
    //       );
    //       return data.length ? data[0] : item;
    //     }
    //   });
    // },
    // /**
    //  * конечная формула после обработки в виде строки с переменными
    //  * @returns {*}
    //  */
    // mutationFormulaResult() {
    //   return this.attachIndexForFormulaElements.join(" ");
    // },
    // /**
    //  * формула со всеми конечными данными и обработанными переменными
    //  * @returns {*}
    //  */
    // compileFormulaWitchData() {
    //   if (!this.variablesInFormula.length) {
    //     return this.resultSummaDataFriVariablesOutsideFormula;
    //   }
    //
    //   return this.processingArrayOnFormulaProcessingLogic(
    //     this.dataListVariablesOnFormula
    //   )
    //     .map((item) => {
    //       if (!item?.name?.length) {
    //         return item;
    //       } else if (item.name === this.getNameReserveVariable) {
    //         return item.cost;
    //       } else if (
    //         this.listLocalVariablesUsedInFormulaForPrefix.includes(item.name) &&
    //         this.localResultData[item.name]?.isShow &&
    //         !item.excludeFromCalculations
    //       ) {
    //         return this.localResultData[item.name].cost;
    //       } else if (
    //         this.listGlobalsVariables.includes(item.name) &&
    //         this.getResultElementOnName(item.name)?.isShow &&
    //         !item.excludeFromCalculations
    //       ) {
    //         return this.getResultElementOnName(item.name)?.cost;
    //       } else {
    //         return "null";
    //       }
    //     })
    //     .join(" ")
    //     ?.replace(/[\+\-\*\/] *\( *\)|\( *\) *[\+\-\*\/]/g, "");
    // },
    // localCost() {
    //   if (
    //     typeof this.compileFormulaWitchData === "string" &&
    //     this.compileFormulaWitchData?.includes("null")
    //   ) {
    //     return null;
    //   }
    //
    //   try {
    //     return eval(this.compileFormulaWitchData);
    //   } catch (e) {
    //     if (this.devMode) {
    //       console.error(e.message, this.compileFormulaWitchData);
    //     }
    //     return null;
    //   }
    // },
    // devModeData() {
    //   const textLabel = `<div>Название группы элементов в дупликаторе: ${this.mutationsInputData?.label}</div>`;
    //   const textFormula = `<div>Базовая формула: ${
    //     this.formula?.length
    //       ? this.getArrayElementsFromFormula(this.formula).join(" ")
    //       : "Нет"
    //   }</div>`;
    //   let isCompiledFormula = false;
    //   try {
    //     if (this.localCost !== null) {
    //       isCompiledFormula = true;
    //     }
    //   } catch (e) {
    //     isCompiledFormula = false;
    //   }
    //
    //   const textFormulaOnData = `<div>Формула с данными: ${
    //     this.compileFormulaWitchData?.length
    //       ? this.compileFormulaWitchData
    //       : "Нет"
    //   }</div>`;
    //   const resultProcessingFormula = `<div>Результат расчета: ${
    //     isCompiledFormula ? this.localCost : "не возможно посчитать!"
    //   }</div>`;
    //
    //   return `
    //   <hr/>
    //   ${textLabel}
    //   ${textFormula}
    //   ${textFormulaOnData}
    //   ${resultProcessingFormula}
    //   `;
    // },
  },
};
</script>

<style scoped></style>
