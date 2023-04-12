<template>
  <div
    class="calc__duplicator-wrapper"
    v-if="mutationsInputData?.templates.length"
  >
    <icon-element-wrapper
      :icon-settings="iconSettings"
      :alt="isExistLabel ? mutationsInputData.label : ''"
    >
      <template>
        <div class="calc__duplicator-label" v-if="isExistLabel">
          {{ mutationsInputData.label }}
        </div>
        <slot name="prompt" />
      </template>
    </icon-element-wrapper>

    <template
      v-for="(template, inx) in mutationsInputData?.templates"
      :key="index + '_' + inx"
    >
      <templates-wrapper-structural
        v-if="checkedIsStructureTemplate(template?.template)"
        :parent-is-show="parentIsShow"
        :template="template"
        :index="index + '_' + inx"
        @changedValue="changeValue"
      />
      <templates-wrapper-column
        v-if="template?.template === 'UiColumns'"
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
      v-if="!isDuplicate && showDuplicateButton"
      class="calc__duplicator-duplicate"
      @click="tryDuplicate"
    >
      {{ buttonDupleTitle }}
    </button>
    <button
      v-if="isDuplicate"
      class="calc__duplicator-delete"
      @click="deleteDuplicate"
    >
      X
    </button>
  </div>
  <dev-block
    :element-name="mutationsInputData?.elementName"
    :local-cost="localCost"
    :formula="mainFormulaResult"
    :formula-variables="compileFormulaWitchData"
    hidden-value
  />
</template>

<script>
import TemplatesWrapper from "@/components/UI/supporting/TemplatesWrapper.vue";
import TemplatesWrapperColumn from "@/components/UI/supporting/TemplatesWrapperColumn.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import TemplatesWrapperStructural from "@/components/UI/supporting/TemplatesWrapperStructural.vue";
import IconElementWrapper from "@/components/UI/supporting/icon-element-wrapper.vue";
import { MixinsUtilityServices } from "@/mixins/MixinsUtilityServices";
import { MixinLocalDependencyList } from "@/mixins/MixinLocalDependencyList";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import { processingArrayOnFormulaProcessingLogic } from "@/servises/UtilityServices";
import { processingVariablesOnFormula } from "@/servises/ProcessingFormula";

export default {
  name: "UiDuplicatorWrapper",
  emits: ["changedValue", "duplicate", "deleteDuplicator"],
  components: {
    devBlock,
    TemplatesWrapper,
    TemplatesWrapperColumn,
    TemplatesWrapperStructural,
    IconElementWrapper,
  },
  mixins: [MixinsUtilityServices, MixinLocalDependencyList],
  props: {
    duplicatorData: {
      type: Object,
      default: null,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    showDuplicateButton: {
      type: Boolean,
      default: true,
    },
    originVariables: {
      type: Array,
      default: () => [],
    },
    originData: {
      type: Object,
      default: () => {},
    },
    ...propsTemplate.getProps([
      "prompt",
      "formula",
      "parentName",
      "parentIsShow",
      "index",
      "dependencyFormulaDisplay",
      "elementName",
      "positionElement",
      "iconSettings",
    ]),
  },
  mounted() {
    if (this.isDuplicate) {
      this.mutationsInputData = this.duplicatorData;
    } else {
      this.mutationsInputData = this.updateInputData(this.duplicatorData, 0);
    }
  },
  data() {
    return {
      counterDuplicate: 0,
      localResultData: {},
      mutationsInputData: null,
      regExpStringSplitFormula:
        /(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)|(^[0-9]+(\.[0-9]+)?)/,
    };
  },
  methods: {
    changeValue(data) {
      if (data?.name) {
        this.localResultData[data.name] = data;
      }
      this.$emit("changedValue", {
        name: this.mutationsInputData.elementName,
        type: "duplicator",
        label: this.mutationsInputData.label,
        cost: this.localCost,
        value: null,
        displayValue: this.localCost,
        formOutputMethod: this.mutationsInputData?.formOutputMethod,
        resultOutputMethod: this.mutationsInputData?.resultOutputMethod,
        eventType: data.eventType,
        unit: "",
        isShow: this.parentIsShow,
        excludeFromCalculations:
          this.mutationsInputData.excludeFromCalculations,
        insertedTemplates: this.returnsLocalResultData,
        position: this.positionElement,
        formulaProcessingLogic: this.originData?.formulaProcessingLogic,
      });
    },
    tryDuplicate() {
      this.counterDuplicate++;
      const returnData = this.updateInputData(
        this.originData,
        this.counterDuplicate
      );
      this.$emit("duplicate", returnData);
    },
    deleteDuplicate() {
      this.mutationsInputData?.templates.map((item) => {
        this.tryDeleteDependencyElementOnName(item.elementName);
      });
      this.$emit("deleteDuplicator", this.duplicatorData.elementName);
    },
    /**
     * @param data
     * @param index
     * @returns {*}
     */
    updateInputData(data, index) {
      let mutationsData = JSON.parse(JSON.stringify(data));

      mutationsData.parentDuplicator = this.parentName;
      mutationsData.isDuplicate = true;
      mutationsData.formula = this.mutationFormulaResult;
      mutationsData.index = this.index + index;
      mutationsData = this.updateIndexElementsInDuple(mutationsData, index);

      return mutationsData;
    },
    /**
     * @param object
     * @param index
     * @returns {*}
     */
    updateIndexElementsInDuple(object, index) {
      for (let prop in object) {
        const propIsElementNameField = prop === "elementName";
        const propIsDependencyField =
          (prop === "dependencyFormulaDisplay" ||
            prop === "dependencyFormulaCost" ||
            prop === "dependencyFormulaItem") &&
          object[prop].length;
        const propIsSecondField = prop === "labelSecond";
        const propIsLabelField = prop === "label";
        const propIsButtonText = prop === "buttonText";
        const propIsButtonTextChecked = prop === "buttonTextChecked";
        const propIsObject = typeof object[prop] === "object";

        if (propIsObject) {
          object[prop] = this.updateIndexElementsInDuple(object[prop], index);
        } else if (propIsElementNameField) {
          object[prop] = this.updateNameItem(object, index);
        } else if (
          propIsLabelField ||
          propIsSecondField ||
          propIsButtonText ||
          propIsButtonTextChecked
        ) {
          object[prop] =
            object[prop]?.length && index > 0
              ? object[prop] + " ( " + index + " )"
              : object[prop];
        } else if (propIsDependencyField) {
          object[prop] = this.addIndexIndexInFormulaElements(
            object[prop],
            index
          ).join("");
        }
      }
      return object;
    },
    /**
     * @param item
     * @param index
     * @returns {string}
     */
    updateNameItem(item, index) {
      item.elementName = item?.elementName?.length
        ? item?.elementName + "_" + index
        : item?.json_id + "_" + index;
      return item.elementName;
    },
    assignThePrefixArrayItems(arr) {
      let newArr = [];
      for (let i = 0; i < arr.length; i++) {
        newArr.push(arr[i] + "_" + this.index);
      }
      return newArr;
    },
    /**
     * в формулу добавляем префиксы для переменных дупликатора
     * @param formulaString
     * @param index
     * @returns {*}
     */
    addIndexIndexInFormulaElements(formulaString, index) {
      return this.getArrayElementsFromFormula(formulaString).map((item) => {
        if (this.isLocalVariable(item)) {
          item = item + "_" + index;
        }
        return item;
      });
    },
    /**
     *
     * @param item
     * @returns {boolean}
     */
    isLocalVariable(item) {
      const isFound = !Boolean(item.match(this.regExpStringSplitFormula));
      const isFoundVariableInOriginVariables =
        this.originVariables.includes(item);
      return isFound && isFoundVariableInOriginVariables;
    },
  },
  watch: {
    localCost(newValue, oldValue) {
      if (newValue !== oldValue) {
        const data = {};
        data.eventType = "dependencyCost";
        this.changeValue(data);
      }
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "tryDeleteDependencyElementOnName",
      "getAllResultsElements",
      "getNameReserveVariable",
      "getResultElementOnName",
      "devMode",
      "checkedIsStructureTemplate",
    ]),
    /**
     *
     * @returns {boolean}
     */
    isExistDependencyMainFormula() {
      return Boolean(this.originData?.dependencyMainFormula?.length);
    },
    /**
     *
     * @returns {boolean}
     */
    mainFormulaIsExist() {
      return Boolean(this.mainFormulaResult?.length);
    },
    /**
     *
     * @returns {*|{length}|T|(function(): {default: string, type: String | StringConstructor})|string}
     */
    mainFormulaResult() {
      if (!this.isExistDependencyMainFormula) {
        return this.formula?.length ? this.formula : "";
      }
      const formulaAfterDependency =
        this.originData.dependencyMainFormula?.reduce((resultFormula, item) => {
          let dependencyFormula = this.getArrayElementsFromFormula(
            item.dependencyFormula
          );

          dependencyFormula = dependencyFormula.map((variable) => {
            if (this.isLocalVariable(variable)) {
              return variable + "_" + this.index;
            }
            return variable;
          });

          this.constructLocalListElementDependencyInFormula(dependencyFormula);
          dependencyFormula = processingVariablesOnFormula(
            dependencyFormula,
            this.localDependencyList
          );

          const formulaIsExist = Boolean(item?.formula?.length);
          try {
            if (eval(dependencyFormula) && formulaIsExist) {
              resultFormula = item.formula;
            }
          } catch (e) {
            if (this.devMode) {
              console.error(
                "Формула зависимости для смены главной формулы дупликатора: " +
                  e.message
              );
            }
          }
          return resultFormula;
        }, "");

      const isFormulaAfterDependency = Boolean(formulaAfterDependency?.length);
      if (isFormulaAfterDependency) {
        return formulaAfterDependency;
      }

      return this.formula?.length ? this.formula : "";
    },
    /**
     * Разбиваем полученную формулу на массив с переменными и знаками.
     * Избавляемся от пустых элементов.
     * @returns {*}
     */
    variablesInFormula() {
      return this.getArrayElementsFromFormula(this.mainFormulaResult);
    },
    /**
     * Список переменных в формуле из глобального окружения
     * @returns {*}
     */
    listGlobalsVariables() {
      return this.variablesInFormula.filter(
        (item) =>
          !this.originVariables.includes(item) &&
          !Boolean(item?.match(this.regExpStringSplitFormula)) &&
          item !== this.getNameReserveVariable
      );
    },
    /**
     * Список локальных переменных используемых в формуле
     * @returns {*}
     */
    listLocalVariablesUsedInFormula() {
      return this.variablesInFormula.filter((item) =>
        this.isLocalVariable(item)
      );
    },
    /**
     * Список локальных переменных используемых в формуле c префиксом
     * @returns {*}
     */
    listLocalVariablesUsedInFormulaForPrefix() {
      return this.assignThePrefixArrayItems(
        this.listLocalVariablesUsedInFormula
      );
    },
    /**
     * Список локальных переменных не используемых в формуле
     * @returns {*[]}
     */
    arrayFreeVariablesOutsideFormula() {
      let variablesListUnusedInFormula = this.originVariables.filter(
        (item) => !this.listLocalVariablesUsedInFormula.includes(item)
      );

      return this.assignThePrefixArrayItems(variablesListUnusedInFormula);
    },
    /**
     * Список переменных не используемых в формуле
     * @returns {[]}
     */
    dataFreeVariablesOutsideFormula() {
      let localData = [];
      this.arrayFreeVariablesOutsideFormula.forEach((elementName) => {
        if (this.localResultData[elementName]) {
          localData.push(this.localResultData[elementName]);
        }
      });
      return localData;
    },
    /**
     * Сумма всех элементов не вошедших в формулу
     * @returns {unknown}
     */
    resultSummaDataFriVariablesOutsideFormula() {
      return this.dataFreeVariablesOutsideFormula?.reduce(
        (reduceSumma, item) => {
          const isAllowedSummation =
            item.cost !== null && !item.excludeFromCalculations && item.isShow;

          if (isAllowedSummation) {
            return reduceSumma + parseFloat(item.cost);
          }
          return reduceSumma + 0;
        },
        0
      );
    },

    /**
     * в формулу добавляем префиксы для переменных дупликатора
     * @returns {*}
     */
    attachIndexForFormulaElements() {
      return this.variablesInFormula.map((item) => {
        if (this.isLocalVariable(item)) {
          item = item + "_" + this.index;
        }
        return item;
      });
    },

    /**
     * Список переменных из формулы вместе с данными
     * @returns {*}
     */
    dataListVariablesOnFormula() {
      return this.attachIndexForFormulaElements?.map((item) => {
        const isReserveVariable = item === this.getNameReserveVariable;
        const isGlobalVariable = this.listGlobalsVariables.includes(item);

        if (isReserveVariable) {
          return this.getProxyFreeVariables(
            this.resultSummaDataFriVariablesOutsideFormula
          );
        } else if (isGlobalVariable) {
          return this.getResultElementOnName(item);
        } else {
          const data = Object.values(this.localResultData).filter(
            (itemInner) => itemInner.name === item
          );
          return data.length ? data[0] : item;
        }
      });
    },

    /**
     * конечная формула после обработки в виде строки с переменными
     * @returns {*}
     */
    mutationFormulaResult() {
      return this.attachIndexForFormulaElements.join(" ");
    },
    /**
     * формула со всеми конечными данными и обработанными переменными
     * @returns {*}
     */
    compileFormulaWitchData() {
      if (!this.variablesInFormula.length) {
        return this.resultSummaDataFriVariablesOutsideFormula;
      }
      return processingArrayOnFormulaProcessingLogic(
        this.dataListVariablesOnFormula
      )
        .map((item) => {
          const nameIsNotExist = !item?.name?.length;
          const isReserveVariable = item?.name === this.getNameReserveVariable;
          const isAllowReturnLocalCost =
            this.listLocalVariablesUsedInFormulaForPrefix.includes(item.name) &&
            this.localResultData[item.name]?.isShow &&
            !item.excludeFromCalculations;
          const isAllowReturnGlobalCost =
            this.listGlobalsVariables.includes(item.name) &&
            this.getResultElementOnName(item.name)?.isShow &&
            !item.excludeFromCalculations;

          if (nameIsNotExist) {
            return item;
          } else if (isReserveVariable) {
            return item.cost;
          } else if (isAllowReturnLocalCost) {
            return this.localResultData[item.name].cost;
          } else if (isAllowReturnGlobalCost) {
            return this.getResultElementOnName(item.name)?.cost;
          } else {
            return "null";
          }
        })
        .join(" ")
        ?.replace(/[\+\-\*\/] *\( *\)|\( *\) *[\+\-\*\/]/g, "");
    },
    /**
     *
     * @returns {any|null}
     */
    localCost() {
      const localCostIsNull =
        typeof this.compileFormulaWitchData === "string" &&
        this.compileFormulaWitchData?.includes("null");

      if (localCostIsNull) {
        return null;
      }

      try {
        const result = eval(this.compileFormulaWitchData);
        const formulaIsComputed = typeof result === "number";
        if (formulaIsComputed) {
          return result;
        } else {
          throw new Error();
        }
      } catch (e) {
        if (this.devMode) {
          console.warn(
            "Рассчитываемая формула в дупликаторе: ",
            this.compileFormulaWitchData
          );
        }
        return null;
      }
    },
    /**
     *
     * @returns {unknown[]}
     */
    returnsLocalResultData() {
      return Object.values(this.localResultData).sort(
        (itemA, itemB) => itemA.position - itemB.position
      );
    },
    /**
     *
     * @returns {boolean}
     */
    isExistLabel() {
      return Boolean(this.mutationsInputData?.label?.toString()?.length);
    },
    buttonDupleTitle() {
      const inputTitleIsExist = Boolean(
        this.duplicatorData?.buttonName?.length
      );
      return inputTitleIsExist
        ? this.duplicatorData?.buttonName
        : "Дублировать";
    },
  },
};
</script>

<style scoped></style>
