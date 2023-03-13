<template>
  <div
    class="calc__duplicator-wrapper"
    v-if="mutationsInputData?.templates.length"
  >
    <div
      class="calc__duplicator-label"
      v-if="mutationsInputData?.label?.length"
    >
      {{ mutationsInputData?.label }}
    </div>
    <template
      v-for="(template, inx) in mutationsInputData?.templates"
      :key="index + '_' + inx"
    >
      <templates-wrapper-for-duplicator
        v-if="isStructureTemplate(template?.template)"
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
  <dev-block
    :element-name="mutationsInputData?.elementName"
    :local-cost="localCost"
    :formula="formula"
    :formula-variables="compileFormulaWitchData"
    hidden-value
  />
</template>

<script>
import TemplatesWrapper from "@/components/UI/supporting/TemplatesWrapper.vue";
import devBlock from "@/components/UI/devMode/devBlock.vue";
import TemplatesWrapperForDuplicator from "@/components/UI/supporting/TemplatesWrapperForDuplicator.vue";
import { MixinsForProcessingFormula } from "@/mixins/MixinsForProcessingFormula";
import { MixinsUtilityServices } from "@/mixins/MixinsUtilityServices";

import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import UsePropsTemplates from "@/servises/UsePropsTemplates";
import { processingArrayOnFormulaProcessingLogic } from "@/servises/UtilityServices";

export default {
  name: "UiDuplicatorWrapper",
  emits: ["changedValue", "duplicate", "deleteDuplicator"],
  components: { devBlock, TemplatesWrapper, TemplatesWrapperForDuplicator },
  mixins: [MixinsForProcessingFormula, MixinsUtilityServices],
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
      "elementName",
      "positionElement",
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
      nameTemplatesForStructure: ["UiAccordion", "UiTab", "UiBisection"],
    };
  },
  methods: {
    changeValue(data) {
      if (!data?.name) {
        return null;
      }
      this.localResultData[data.name] = data;
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
    updateInputData(data, index) {
      let mutationsData = JSON.parse(JSON.stringify(data));

      mutationsData.parentDuplicator = this.parentName;
      mutationsData.isDuplicate = true;
      mutationsData.formula = this.mutationFormulaResult;
      mutationsData.index = this.index + index;
      mutationsData = this.updateIndexElementsInDuple(mutationsData, index);

      return mutationsData;
    },
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
        const propIsObject = typeof object[prop] === "object";

        if (propIsObject) {
          object[prop] = this.updateIndexElementsInDuple(object[prop], index);
        } else if (propIsElementNameField) {
          object[prop] = this.updateNameItem(object, index);
        } else if (propIsLabelField) {
          object[prop] =
            object[prop]?.length && index > 0
              ? object[prop] + " ( " + index + " )"
              : object[prop];
        } else if (propIsSecondField) {
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

    updateNameItem(item, index) {
      item.elementName = item?.elementName?.length
        ? item?.elementName + "_" + index
        : item?.json_id + "_" + index;
      return item.elementName;
    },

    /**
     * в формулу добавляем префиксы для переменных дупликатора
     * @param formulaString
     * @param index
     * @returns {*}
     */
    addIndexIndexInFormulaElements(formulaString, index) {
      return this.getArrayElementsFromFormula(formulaString).map((item) => {
        if (this.isAllowedAddIndex(item)) {
          item = item + "_" + index;
        }
        return item;
      });
    },
    isAllowedAddIndex(item) {
      const isFound = !Boolean(item.match(this.regExpStringSplitFormula));
      const isFoundVariableInOriginVariables =
        this.originVariables.includes(item);
      return isFound && isFoundVariableInOriginVariables;
    },
    isStructureTemplate(templateName) {
      return this.nameTemplatesForStructure.includes(templateName);
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "tryDeleteDependencyElementOnName",
      "getAllResultsElements",
      "getNameReserveVariable",
      "getResultElementOnName",
      "devMode",
      "showInsideElementStatus",
    ]),
    /**
     * Разбиваем полученную формулу на массив с переменными и знаками.
     * Избавляемся от пустых элементов.
     * @returns {*}
     */
    variablesInFormula() {
      return this.getArrayElementsFromFormula(this.formula);
    },

    /**
     * Список переменных в формуле из глобального окружения
     * @returns {*}
     */
    listGlobalsVariables() {
      return this.variablesInFormula.filter(
        (item) =>
          !this.originVariables.includes(item) &&
          !Boolean(item.match(this.regExpStringSplitFormula)) &&
          item !== this.getNameReserveVariable
      );
    },
    /**
     * Список локальных переменных используемых в формуле
     * @returns {*}
     */
    listLocalVariablesUsedInFormula() {
      return this.variablesInFormula.filter(
        (item) =>
          !Boolean(item.match(this.regExpStringSplitFormula)) &&
          item !== this.getNameReserveVariable &&
          !this.listGlobalsVariables.includes(item)
      );
    },
    /**
     * Список локальных переменных используемых в формуле c префиксом
     * @returns {*}
     */
    listLocalVariablesUsedInFormulaForPrefix() {
      return this.listLocalVariablesUsedInFormula.map(
        (item) => item + "_" + this.index
      );
    },
    /**
     * Список локальных переменных не используемых в формуле
     * @returns {*[]}
     */
    arrayFreeVariablesOutsideFormula() {
      return this.originVariables
        .filter((item) => !this.listLocalVariablesUsedInFormula.includes(item))
        .map((item) => item + "_" + this.index);
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
        if (this.isAllowedAddIndex(item)) {
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

    localCost() {
      const localCostIsNull =
        typeof this.compileFormulaWitchData === "string" &&
        this.compileFormulaWitchData?.includes("null");

      if (localCostIsNull) {
        return null;
      }

      try {
        return eval(this.compileFormulaWitchData);
      } catch (e) {
        if (this.devMode) {
          console.error(
            "Ошибка в расчете формулы: ",
            this.compileFormulaWitchData
          );
        }
        return null;
      }
    },
    returnsLocalResultData() {
      return Object.values(this.localResultData).sort(
        (itemA, itemB) => itemA.position - itemB.position
      );
    },
    showDevBlock() {
      return this.devMode && this.showInsideElementStatus;
    },
  },
};
</script>

<style scoped></style>
