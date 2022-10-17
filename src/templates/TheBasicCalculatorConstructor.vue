<template>
  <div id="app-base-constructor-calculator">
    <div class="calc calc__wrapper" id="custom-stile">
      <template v-for="(template, inx) in calculatorTemplates" :key="inx">
        <ui-accordion
          v-if="template.template === 'UiAccordion'"
          :accordion-data="template"
          :classes="template?.classes"
          :element-name=" template?.json_id || 'UiAccordion' + inx"
          @changedValue="changeValue"
          @changeValid="changeValid"
        />
        <ui-tab
          v-if="template.template === 'UiTab'"
          :tab-data="template"
          :classes="template?.classes"
          :element-name="template?.json_id || 'UiTab' + inx"
          @changedValue="changeValue"
          @changeValid="changeValid"
        />
        <ui-bisection
          v-if="template.template === 'UiBisection'"
          :template-data="template"
          :width-left-side="template?.widthLeftSide"
          :classes="template?.classes"
          :element-name="template?.json_id || 'UiBisection' + inx"
          @changedValue="changeValue"
          @changeValid="changeValid"
        />
        <templates-wrapper
          v-else
          :template="template"
          :index="inx"
          @changedValue="changeValue"
          @changeValid="changeValid"
        />
      </template>
      <div v-if="showErrorTextBlock" class="calc__error-block">
        Возможно, некоторые поля не заполнены или заполнены не корректно!
      </div>
      <div
        class="calc__show-result-btn"
        @click="calculateResult"
        v-if="mistake === 'useButton'"
      >
        Рассчитать
      </div>
    </div>
    <error-unique-names-templates :templates="calculatorTemplates"/>
    <teleport v-if="initTeleport && !isErrorCalc" to="#teleport-element">
      {{ resultTextForForm }}
    </teleport>
  </div>
  <pre>{{this.resultDataFilter}}</pre>
</template>

<script>
import { computed } from "vue";
import UiAccordion from "@/components/UI/UiAccordion";
import UiTab from "@/components/UI/UiTab";
import TemplatesWrapper from "@/components/UI/TemplatesWrapper";
import UiBisection from "@/components/UI/UiBisection";
import ErrorUniqueNamesTemplates from "@/components/UI/ErrorUniqueNamesTemplates";

export default {
  name: "TheBasicCalculatorConstructor",
  components: { TemplatesWrapper, UiAccordion, UiTab, UiBisection, ErrorUniqueNamesTemplates },
  async mounted() {
    const isGlobal = window.location.hostname !== "localhost";
    const localPath = "http://localhost:3000/test-dependency";
    if (!isGlobal) {
      await fetch(localPath)
        .then((response) => response.json())
        .then((data) => {
          this.outData = data;
        });
      await fetch("http://localhost:3000/calculator-options")
        .then((response) => response.json())
        .then((data) => {
          this.outOptions = data;
        });
    } else {
      this.outData.calculatorTemplates = JSON.parse(
        JSON.stringify(window?.calculatorTemplates)
      );
      this.outOptions = JSON.parse(JSON.stringify(window?.calculatorOptions));
    }
    this.calculatorTemplates = this.outData?.calculatorTemplates
      ? this.outData?.calculatorTemplates
      : [];
    this.formula = this.outOptions?.formula?.length
      ? this.outOptions?.formula
      : null;
    this.isUseFormula = this.outOptions?.useFormula
      ? this.outOptions?.useFormula
      : false;
    this.mistake = this.outOptions?.methodProcessingMistakes
      ? this.outOptions?.methodProcessingMistakes
      : "useButton";
    this.currency =
      this?.outOptions !== null ? this?.outOptions?.currency : "руб";
    this.initEnabledSendForm =
      this?.outOptions?.methodProcessingMistakes === "useAutomatic";
    delete window?.calculatorTemplates;
    delete window?.calculatorOptions;
  },
  provide() {
    return {
      globalCanBeShownTooltip: computed(() => this.shownAllTooltips),
      globalDataForDependencies: computed(() => this.dataForDependencies),
    };
  },
  data() {
    return {
      outData: {}, // внешние данные с шаблонами элементов калькулятора
      outOptions: {}, // внешние данные с общими настройками калькулятора
      calculatorTemplates: [], // список шаблонов элементов
      resultsElements: {}, // список элементов которые будут участвовать в расчетах результата
      errorsElements: new Set(), // список элементов с ошибками валидации
      formula: null, // формула для кастомного расчета
      isUseFormula: false, // использовать формулу
      shownAllTooltips: false, // глобальная переменная дающая разрешение показывать ошибки валидации для всех шаблонов
      reserveVariableForOther: "_otherSumm_", // зарезервированная переменная в которую попадают сумма всех полей не учавствующих в формуле
      mistake: "useButton",
      currency: "руб",
      submitResult: null,
      initEnabledSendForm: false,
      dataForDependencies: {}, // набор данных для зависимостей полей.
    };
  },
  methods: {
    changeValue({
      name,
      type,
      label,
      cost,
      value,
      formOutputMethod,
      eventType,
      unit,
    }) {
      // console.log("Данные по событию -  ", data);
      if (eventType === "delete") {
        this.deleteElementOnResults(name);
        this.deleteElementOnErrors(name);
        this.deleteElementOnDependencies(name);
        this.checkEnabledResultButton();
        return false;
      }

      this.dataForDependencies[name] = {
        name,
        value: null,
      };
      this.resultsElements[name] = {
        name,
        type,
        label,
        formOutputMethod,
        summ: cost,
        value: null,
        unit: unit ? unit : null,
      };

      if (type === "radio") {
        this.dataForDependencies[name].value = value?.radioName;
        this.resultsElements[name].value = value?.radioName;
      } else if (type === "select") {
        this.dataForDependencies[name].value = value?.selectName;
        this.resultsElements[name].value = value?.selectName;
      } else if (type === "checkbox") {
        this.dataForDependencies[name].value = value;
        this.resultsElements[name].value = value ? "Да" : "Нет";
      } else {
        this.dataForDependencies[name].value = value;
        this.resultsElements[name].value = value;
      }
      this.checkEnabledResultButton();
    },
    changeValid(data) {
      if (
        data.error &&
        data.eventType !== "mounted" &&
        data.eventType !== "delete"
      ) {
        this.errorsElements.add(data.name);
      } else {
        this.deleteElementOnErrors(data.name);
      }
      this.tryChangeShownAllTooltips(data.eventType);
    },
    calculateResult() {
      this.shownAllTooltips = true;
      this.initEnabledSendForm = true;
      this.checkEnabledResultButton();
    },
    /**
     * Разрешаем отправку формы
     */
    checkEnabledResultButton() {
      if (!this.submitResult) {
        this.submitResult = document.querySelector("#send-result");
      }
      if (this.initEnabledSendForm && this.resultTextForForm?.length) {
        this.submitResult.disabled = false;
      } else {
        this.submitResult.disabled = true;
      }
    },
    deleteElementOnResults(name) {
      if (name in this.resultsElements) {
        delete this.resultsElements[name];
      }
    },
    deleteElementOnErrors(name) {
      if (this.errorsElements.has(name)) {
        this.errorsElements.delete(name);
      }
    },
    deleteElementOnDependencies(name) {
      if (name in this.dataForDependencies) {
        delete this.dataForDependencies[name];
      }
    },
    tryChangeShownAllTooltips(eventType) {
      if (
        this.mistake === "useAutomatic" &&
        eventType !== "mounted" &&
        eventType !== "delete" &&
        this.shownAllTooltips === false
      ) {
        this.shownAllTooltips = true;
      }
    },
  },
  watch: {
    initEnabledForm() {
      this.checkEnabledResultButton();
    },
    isErrorCalc() {
      this.checkEnabledResultButton();
    },
  },
  computed: {
    /**
     * Данные которые подходят для вывода или расчета
     * @returns {unknown[]}
     */
    resultDataFilter() {
      return Object.values(this.resultsElements).filter(
        (item) =>
          item.formOutputMethod !== null ||
          item.summ !== null ||
          (item.type === "checkbox" && !item.value)
      );
    },

    /**
     * Разбиваем полученную формулу на массив с переменными и знаками. Избавляемся от пустых элементов.
     * @returns {*}
     */
    listVariablesOnFormula() {
      if (this.formula?.length) {
        return this.formula?.split(" ").filter((item) => item.length);
      }
      return [];
    },
    /**
     * Массив переменных не используемых в формуле
     * @returns {*}
     */
    otherVariables() {
      return this.resultDataFilter
        ?.map((dataOnCalcComponent) => {
          const isFormula = this.listVariablesOnFormula.filter(
            (varOnFormula) => varOnFormula === dataOnCalcComponent.name
          );
          return Boolean(isFormula.length) ? false : dataOnCalcComponent;
        })
        .filter((item) => item);
    },

    /**
     * сумма всех не используемых в формуле переменных
     * @returns {*}
     */
    otherResultSumm() {
      return this.otherVariables.reduce((sum, item) => {
        if (item?.summ !== null) {
          return sum + item.summ;
        }
        return sum + 0;
      }, 0);
    },
    /**
     * Список переменных из формулы вместе с данными
     * @returns {*}
     */
    dataListVariablesOnFormula() {
      return this.listVariablesOnFormula?.map((item) => {
        if (item === this.reserveVariableForOther) {
          return new Proxy(
            {
              name: this.reserveVariableForOther,
              summ: this.otherResultSumm,
            },
            {
              get: (target, name) => {
                return name in target ? target[name] : null;
              },
            }
          );
        } else {
          let data = this.resultDataFilter.filter(
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
    putTogetherFormulaWithData() {
      const resultTextForComputed = this.dataListVariablesOnFormula?.reduce(
        (resultText, item) => {
          return (resultText +=
            typeof item.summ === "number" ? item.summ : item);
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
    resultDataFilterInOutputText() {
      return this.resultDataFilter.filter((item) => item.formOutputMethod);
    },
    /**
     * Текст со всеми полями которые должны отображаться в форме
     * @returns {string}
     */
    resultTextDataForForm() {
      let result = "";
      this.resultDataFilterInOutputText.forEach((item) => {
        if (item.formOutputMethod && item.value) {
          result += "\n" + item.label;

          if (
            item.formOutputMethod === "value" ||
            item.formOutputMethod === "valueSumm"
          ) {
            const unit = item.unit ? item.unit : "";
            result += " - " + item.value + " " + unit;
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
     * @returns {number}
     */
    resultSummForForm() {
      if (this.isUseFormula) {
        return this.putTogetherFormulaWithData;
      } else {
        return this.resultDataFilter.reduce((sum, item) => {
          if (item.summ !== null) {
            return sum + Number(item.summ);
          }
          return sum + 0;
        }, 0);
      }
    },
    /**
     * Текст для вывода в форму
     * @returns {string}
     */
    resultTextForForm() {
      let result = this.resultTextDataForForm;
      result += this.resultSummForForm
        ? "Общая сумма составляет = " +
          this.resultSummForForm +
          " " +
          this.currency
        : "";
      return result;
    },
    /**
     * Есть ошибки валидации
     * @returns {boolean}
     */
    isErrorCalc() {
      return Boolean(this.errorsElements.size);
    },
    /**
     * Отобразить блок с текстом о наличии ошибок,
     * если ошибки есть и глобально разрешено их отображение
     * @returns {false|boolean}
     */
    showErrorTextBlock() {
      return this.isErrorCalc && this.shownAllTooltips;
    },
    /**
     * Добавить данные в форму если нет ошибок валидации
     * @returns {boolean}
     */
    initTeleport() {
      return !this.isErrorCalc && this.initEnabledSendForm;
    },
    isEnabledSendForm() {
      return this.initTeleport && !Boolean(this.resultTextDataForForm.length);
    },
  },
};
</script>

<style lang="scss">
//normal orange - FF5D2B
//normal dark- 464657
//hover orange - FF7044
//hover dark- 5A5A70
//font - 00000
//серый - CCCCCC
// border - E6E6E6 -
// background - F2F2F2

$color-dark-normal: #464657;
$color-orange-normal: #ff5d2b;

$color-dark-hover: #5a5a70;
$color-orange-hover: #ff7044;

$color-danger: #ff4444;

$color-black: #000000;
$color-white: #ffffff;

$color-gray-light: #f2f2f2;
$color-gray-middle: #e6e6e6;
$color-gray-dark: #cccccc;

$border-radius: 4px;

@mixin style-border {
  border: 1px solid $color-gray-middle;
  border-radius: $border-radius;
}

@mixin style-border-hover {
  border: 1px solid $color-gray-dark;
}

@mixin style-button {
  color: $color-white;
  cursor: pointer;
  background-color: $color-dark-normal;
  @include style-flex-center;
  @include style-border;
}

@mixin style-button-hover {
  background-color: $color-dark-hover;
  box-shadow: 0 0 3px 1px $color-gray-dark;
}

@mixin style-flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin style-flex-start {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

@mixin style-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.button {
  @include style-button;
}

.calc__wrapper-group-data {
  margin-bottom: 20px;
  padding-left: 20px;
  border-left: 3px solid $color-orange-normal;
  width: 100%;
  &:hover {
    background-color: $color-gray-middle;
  }
}

#app-base-constructor-calculator {
  .calc {
    box-sizing: border-box;
    &__wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    &__error-block {
      width: 100%;
      @include style-flex-center;
      margin: 10px 0;
      padding: 20px;
      background-color: $color-danger;
      color: $color-white;
    }
    &__show-result-btn {
      @include style-button;
      padding: 20px;
      align-self: center;
      &:hover {
        @include style-button-hover;
        background-color: $color-orange-normal;
      }
    }
  }
}
</style>
