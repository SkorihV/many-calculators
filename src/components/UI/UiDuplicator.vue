<template>
  <pre>
  {{index}}

  </pre>
  <div class="calc__duplicator" v-if="isVisibilityFromDependency">
    <template v-for="(template, inx) in mutationTemplatesAfterDuplicatopr" :key="inx">
      <templates-wrapper
        :parent-is-show="isVisibilityFromDependency"
        :template="template"
        :index="inx"
        @changedValue="changeValue"
      />
    </template>
    <button class="calc__duplicator-duplicate" @click="tryDuplicate">Дублировать</button>
    <button class="calc__duplicator-delete">Удалить</button>
  </div>
</template>

<script>
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";
import { MixinsGeneralItemData } from "@/components/UI/MixinsGeneralItemData";
import { MixinsForProcessingFormula } from "@/components/UI/MixinsForProcessingFormula";

export default {
  name: "UiDuplicator",
  components: { TemplatesWrapper },
  emits: ["changedValue", "duplicate", "deleteDuplicate"],
  mixins: [MixinsForProcessingFormula, MixinsGeneralItemData],
  props: {
    calculatorTemplates: {
      type: Object,
      default: null,
    },
    index: {
      type: [Number, String],
      default: null,
    },
    formula: {
      type: String,
      default: null,
    },
    isDuplicate: {
      type: Boolean,
      default: null,
    },
    /**
     * метод вывода данных в результирующую форму
     */
    formOutputMethod: {
      type: String,
      default: "no",
    },
    localTemplate: {
      type: Object,
      default: () => {},
    }
  },
  data() {
    return {
      errorsElements: new Set(), // список элементов с ошибками валидации
      localResultsElements: {},
      reserveVariableForOther: "_otherSumma_", // зарезервированная переменная в которую попадают сумма всех полей не учавствующих в формуле
    };
  },
  methods: {
    changeValid() {
      return null;
    },
    // changeValue(data) {
    //   this.$emit("changedValue", data);
    // },
    // changeValid(data) {
    //
    //   if (data.error && data.eventType !== "mounted" && data.isShow) {
    //     this.errorsElements.add(data.name);
    //   }
    //
    //   if (!data.isShow || !data.error) {
    //     this.deleteElementOnErrors(data.name);
    //   }
    //
    //
    //   this.$emit("changeValid", data);
    // },
    duplicate() {
      this.$emit("duplicate", "duplicate");
    },
    deleteDuplicate() {
      this.$emit("deleteDuplicate", "deleteDuplicate");
    },
    changeValue(data) {
      if (typeof data !== "object") {
        return null;
      }
      let {
        name,
        type,
        label,
        cost,
        value,
        displayValue,
        formOutputMethod,
        eventType,
        unit,
        isShow,
        excludeFromCalculations,
      } = data;
      // || !isShow
      if (eventType === "delete") {
        this.hiddenElementOnResults(name);
        return false;
      }


      this.localResultsElements[name] = {
        name,
        type,
        label,
        formOutputMethod,
        summ: cost,
        value,
        displayValue,
        unit: unit ? unit : null,
        isShow,
        excludeFromCalculations,
      };
    },
    calculateResult() {
      this.shownAllTooltips = true;
      this.initEnabledSendForm = true;
    },
    hiddenElementOnResults(name) {
      if (name in this.localResultsElements) {
        this.localResultsElements[name].isShow = false;
      }
    },

    tryDuplicate() {
      const returnData = this.localTemplate;


    }
  },
  computed: {

    mutationTemplatesAfterDuplicatopr() {
      return this.calculatorTemplates.map(item => {
        const newName = this.elementName + "_" + item.elementName;
        item.elementName = newName;
        return item;
      });
    },

    /**
     * Данные которые подходят для вывода или расчета
     * @returns {{length}|unknown[]|*[]}
     */
    baseDataForCalculate() {
      const dataList = Object.values(this.localResultsElements);
      return dataList?.length ? dataList : [];
    },

    /**
     * Разбиваем полученную формулу на массив с переменными и знаками.
     * Избавляемся от пустых элементов.
     * @returns {*[]|*}
     */
    variablesInFormula() {
      if (this.formula !== null && this.formula?.length) {
        return this.formula?.split(" ").filter((item) => item.length);
      }
      return [];
    },
    /**
     * Список переменных не используемых в формуле
     * @returns {[]}
     */
    freeVariablesOutsideFormula() {
      return this.baseDataForCalculate
        ?.filter((dataOnCalcComponent) => {
          const isFormula = this.variablesInFormula.some(
            (varOnFormula) => varOnFormula === dataOnCalcComponent.name
          );
          return !isFormula;
        })
        .filter((item) => {
          return item;
        });
    },

    /**
     * сумма всех не используемых в формуле переменных
     * @returns {*}
     */
    summaFreeVariables() {
      return this.freeVariablesOutsideFormula.reduce((sum, item) => {
        if (
          item?.summ !== null &&
          !item.excludeFromCalculations &&
          item.isShow
        ) {
          return sum + parseFloat(item.summ);
        }
        return sum + 0;
      }, 0);
    },

    /**
     * Системная переменная объединяющая в себе сумму всех не используемых в формуле переменных
     * @returns {{summ: *, name: string}}
     */
    proxyDataIncludingFreeVariables() {
      return new Proxy(
        {
          name: this.reserveVariableForOther,
          summ: this.summaFreeVariables,
          isShow: Boolean(this.summaFreeVariables),
        },
        {
          get: (target, name) => {
            return name in target ? target[name] : null;
          },
        }
      );
    },

    /**
     * Список переменных из формулы вместе с данными
     * @returns {*}
     */
    dataListVariablesOnFormula() {
      return this.variablesInFormula?.map((item) => {
        if (item === this.reserveVariableForOther) {
          return this.proxyDataIncludingFreeVariables;
        } else {
          const data = this.baseDataForCalculate.filter(
            (itemInner) => itemInner.name === item
          );
          return data.length ? data[0] : item;
        }
      });
    },

    /**
     * Собираем всю формулу целиком и рассчитываем через eval
     * @returns {boolean|any}
     */
    combinedFormulaDataTogether() {
      const resultTextForComputed = this.dataListVariablesOnFormula?.reduce(
        (resultText, item) => {
          if (typeof item?.summ === "number" && item?.isShow) {
            return (resultText += item.summ);
          }
          if (typeof item?.summ === "number" && !item?.isShow) {
            return (resultText += "0");
          }
          return (resultText += item);
        },
        ""
      );
      try {
        return eval(resultTextForComputed);
      } catch (e) {
        return false;
      }
    },

    /**
     * Данные нужные только для вывода в форму
     * @returns {*[]}
     */
    dataForOutputText() {
      return this.baseDataForCalculate.filter(
        (item) => item.formOutputMethod !== "no"
      );
    },
    /**
     * Текст со всеми полями которые должны отображаться в форме
     * @returns {string}
     */
    resultTextDataForForm() {
      let result = "";
      this.dataForOutputText.forEach((item) => {
        if (item.formOutputMethod && item.displayValue && item.isShow) {
          result += "\n" + item.label;

          if (
            item.formOutputMethod === "value" ||
            item.formOutputMethod === "valueSumm"
          ) {
            const unit = item.unit ? item.unit : "";
            result += " - " + item.displayValue + " " + unit;
          }
          if (
            item.summ !== null &&
            (item.formOutputMethod === "summ" ||
              item.formOutputMethod === "valueSumm")
          ) {
            let sum = item.summ.toString();
            result += " - " + sum + " " + this.currency;
          }
          result += "\n";
        }
      });
      return result;
    },
    /**
     * Общая сумма расчета
     * @returns {*|boolean}
     */
    finalSummaForOutput() {
      if (!this.displayResultData) {
        return null;
      }

      if (this.isUseFormula && this.formula?.length) {
        return this.combinedFormulaDataTogether;
      } else {
        return this.baseDataForCalculate.reduce((sum, item) => {
          if (item.summ !== null && !item.excludeFromCalculations) {
            return sum + parseFloat(item.summ);
          }
          return sum + 0;
        }, 0);
      }
    },
  },
};
</script>

<style scoped></style>
