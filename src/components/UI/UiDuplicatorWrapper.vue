<template>
  <div
    class="calc__duplicator-wrapper"
    v-if="mutationsInputData?.templates.length"
  >
    <div class="calc__duplicator-label">{{ mutationsInputData?.label }}</div>
    <template
      v-for="(template, inx) in mutationsInputData?.templates"
      :key="index + '_' + inx"
    >
      <templates-wrapper-for-duplicator
        v-if="['UiAccordion','UiTab','UiBisection'].includes(template?.template)"
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
      Дублировать
    </button>
    <button
      v-if="isDuplicate"
      class="calc__duplicator-delete"
      @click="deleteDuplicate"
    >
      X
    </button>
  </div>
  <div
    class="dev-block"
    v-if="devMode && showInsideElementStatus"
    v-html="devModeData"
  ></div>
</template>

<script>
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";
import TemplatesWrapperForDuplicator from "@/components/UI/TemplatesWrapperForDuplicator";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";
import { MixinsUtilityServices} from "@/components/UI/MixinsUtilityServices";
import { mapGetters, mapActions } from "vuex";


export default {
  name: "UiDuplicatorWrapper",
  emits: ["changedValue", "duplicate", "deleteDuplicator"],
  components: { TemplatesWrapper, TemplatesWrapperForDuplicator  },
  mixins: [MixinsForProcessingFormula, MixinsUtilityServices],
  props: {
    duplicatorData: {
      type: Object,
      default: null,
    },
    index: {
      type: [Number, String],
      default: 0,
    },
    parentIsShow: {
      type: Boolean,
      default: true,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    parentName: {
      type: String,
      default: "",
    },
    formula: {
      type: String,
      default: "",
    },
    originVariables: {
      type: Array,
      default: () => [],
    },
    originData: {
      type: Object,
      default: () => {},
    }
  },
  mounted() {
    if (this.isDuplicate) {
      this.mutationsInputData = this.duplicatorData
    } else {
      this.mutationsInputData = this.updateInputData(this.duplicatorData, 0);
    }
  },
  data() {
    return {
      counterDuplicate: 0,
      localResultData: {},
      mutationsInputData: null,
      regExpStringSplitFormula:  /(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)|(^[0-9]+(\.[0-9]+)?)/,
    };
  },
  methods: {
    ...mapActions(["tryDeleteDependencyElementOnName"]),
    changeValue(data) {

      this.localResultData[data.name] = data;
      this.$emit("changedValue", {
        name: this.mutationsInputData.elementName,
        type: "duplicator",
        label: this.mutationsInputData.label,
        cost: this.localCost,
        value: null,
        displayValue: this.localCost,
        formOutputMethod: this.mutationsInputData?.formOutputMethod,
        eventType: data.eventType,
        unit: "",
        isShow: this.parentIsShow,
        excludeFromCalculations:
        this.mutationsInputData.excludeFromCalculations,
        insertedTemplates: this.localResultData,
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
      mutationsData.index = this.index + index;

      mutationsData.parentDuplicator = this.parentName ;

      mutationsData.formula = this.mutationFormulaResult;
      mutationsData.isDuplicate = true;

      mutationsData = this.updateIndexElementsInDuple(mutationsData, index)

      return mutationsData;
    },
    updateIndexElementsInDuple (object, index) {
      for(let prop in object) {
        if (typeof (object[prop]) === 'object') {
          object[prop] = this.updateIndexElementsInDuple(object[prop], index);
        } else if (prop === 'elementName') {
          object[prop] = this.updateNameItem(object, index)
        } else if (prop === 'label') {
          object[prop] = object[prop]?.length && index > 0 ? object[prop] + " ( " + index + " )" : object[prop];
        }  else if (prop === 'labelSecond') {
          object[prop] = object[prop]?.length && index > 0 ? object[prop] + " ( " + index + " )" : object[prop];
        } else if ((prop === 'dependencyFormulaDisplay' || prop === "dependencyFormulaCost" || prop === "dependencyFormulaItem") && object[prop].length) {
          object[prop] = this.addIndexIndexInFormulaElements(object[prop], index).join("")
        }
      }
      return object
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
        const isFind = !Boolean(
          item.match(
            this.regExpStringSplitFormula
          )
        );
        if (isFind && this.originVariables.includes(item)) {
          item = item + "_" + index;
        }
        return item;
      });
    },
  },
  computed: {
    ...mapGetters([
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
      return this.variablesInFormula.filter((item) => {
        return (
          !this.originVariables.includes(item) &&
          !Boolean(
            item.match(
              this.regExpStringSplitFormula
            )
          ) &&
          item !== this.getNameReserveVariable
        );
      });
    },
    /**
     * Список локальных переменных используемых в формуле
     * @returns {*}
     */
    listLocalVariablesUsedInFormula() {
      return this.variablesInFormula
        .filter(
          (item) =>
            !Boolean(
              item.match(
                this.regExpStringSplitFormula
              )
            ) && item !== this.getNameReserveVariable
        )
        .filter((item) => !this.listGlobalsVariables.includes(item));
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
          if (item.cost !== null && !item.excludeFromCalculations && item.isShow) {
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
        const isFind = !Boolean(
          item.match(
            this.regExpStringSplitFormula
          )
        );
        if (isFind && this.originVariables.includes(item)) {
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
        if (item === this.getNameReserveVariable) {
          return this.getProxyFreeVariables(
            this.resultSummaDataFriVariablesOutsideFormula
          );
        } else if (this.listGlobalsVariables.includes(item)) {
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

      return this.processingArrayOnFormulaProcessingLogic(this.dataListVariablesOnFormula)
        .map((item) => {
          if (!item?.name?.length) {
            return item;
          } else if (item.name === this.getNameReserveVariable) {
            return item.cost;
          } else if (
            this.listLocalVariablesUsedInFormulaForPrefix.includes(item.name) &&
            this.localResultData[item.name]?.isShow &&
            !item.excludeFromCalculations
          ) {
            return this.localResultData[item.name].cost;
          } else if (
            this.listGlobalsVariables.includes(item.name) &&
            this.getResultElementOnName(item.name)?.isShow &&
            !item.excludeFromCalculations
          ) {
            return this.getResultElementOnName(item.name)?.cost;
          } else {
            return "null";
          }
        })
        .join(" ")?.replace(/[\+\-\*\/] *\( *\)|\( *\) *[\+\-\*\/]/g, '');
    },

    localCost() {
      if (typeof this.compileFormulaWitchData === 'string' && this.compileFormulaWitchData?.includes('null')) {
        return null;
      }

      try {
        return eval(this.compileFormulaWitchData);
      } catch (e) {
        if (this.devMode) {
          console.error(e.message, this.compileFormulaWitchData);
        }
        return null;
      }
    },
    devModeData() {
      const textLabel = `<div>Название группы элементов в дупликаторе: ${this.mutationsInputData?.label}</div>`;
      const textFormula = `<div>Базовая формула: ${
        this.formula?.length
          ? this.getArrayElementsFromFormula(this.formula).join(" ")
          : "Нет"
      }</div>`;
      let isCompiledFormula = false;
      try {
        if (this.localCost !== null) {
          isCompiledFormula = true;
        }
      } catch (e) {
        isCompiledFormula = false;
      }

      const textFormulaOnData = `<div>Формула с данными: ${
        this.compileFormulaWitchData?.length
          ? this.compileFormulaWitchData
          : "Нет"
      }</div>`;
      const resultProcessingFormula = `<div>Результат расчета: ${
        isCompiledFormula
          ? this.localCost
          : "не возможно посчитать!"
      }</div>`;

      return `
      <hr/>
      ${textLabel}
      ${textFormula}
      ${textFormulaOnData}
      ${resultProcessingFormula}
      `;
    },
  },
};
</script>

<style scoped></style>
