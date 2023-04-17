<template>
  <div
    class="calc__error-wrapper"
    v-if="isShow"
    :class="{ 'isShow': isShow }"
    v-cloak
  >
    <div class="calc__error-control-wrapper">
      <label class="calc__error-checkbox-label" v-if="displayAlert">
        <span class="calc__error-checkbox-text">
          Отобразить внутреннее состояние элементов:
        </span>
        <input
          class="calc__error-checkbox-input"
          v-model="localShowInsideElementStatus"
          type="checkbox"
        />
      </label>
      <div
        class="calc__error-toggle"
        @click="displayAlert = !displayAlert"
        :class="{ 'isError': isExistError, 'close': !displayAlert }"
      >
        X
      </div>
    </div>
    <template v-if="displayAlert">
      <div class="calc__error-content">
        <template v-if="listExistElementNames.length">
          <div class="calc__error-label">
            Список всех имен элементов Заголовок / Имя:
          </div>
          <div
            class="calc__error-item"
            v-for="(data, key) in listExistElementNames"
            :key="key"
          >
            <div class="calc__error-item-name">
              {{ data.label ? data.label : "Без заголовка " }} /
              {{ data.elementName }}
            </div>
          </div>
        </template>

        <template v-if="isExistDoubleNames">
          <div class="calc__error-label">Дубли имен:</div>
          <div
            class="calc__error-item"
            v-for="(error, key) in recurringTemplateNames"
            :key="key"
          >
            <div class="calc__error-item-name">
              Имя элемента '{{ key }}' обнаружено у следующих элементов:
            </div>
            <div class="calc__error-item-name" v-for="label in error">
              {{ label?.length ? label : "Отсутствует" }}
            </div>
          </div>
          <p class="calc__error-alert">Имена должны быть уникальными!</p>
        </template>

        <template v-if="isExistNamesIsDisplayFormula">
          <div class="calc__error-label">
            Не существующие имена в формулах на отображение: Заголовок / Имя
          </div>
          <div
            class="calc__error-item"
            v-for="(error, key) in notExistNamesInDisplayFormula"
            :key="key"
          >
            <div class="calc__error-item-name">
              Имя элемента: '{{
                error?.label?.length ? error?.label : "Отсутствует"
              }}' Имя элемента: '{{ error.name }}' - не существует.
            </div>
          </div>
          <p class="calc__error-alert">
            Измените существующие имена или добавьте недостающие.
          </p>
        </template>

        <template v-if="isExistNamesInComputedFormula">
          <div class="calc__error-label">
            Не существующие имена в формулах на расчет: Заголовок / Имя
          </div>
          <div
            class="calc__error-item"
            v-for="(error, key) in notExistNamesInComputedFormula"
            :key="key"
          >
            <div class="calc__error-item-name">
              Имя элемента: '{{
                error?.label?.length ? error?.label : "Отсутствует"
              }}' Имя элемента: '{{ error.name }}' - не существует.
            </div>
          </div>
          <p class="calc__error-alert">
            Измените существующие имена или добавьте недостающие.
          </p>
        </template>

        <template
          v-if="
            listExistElementNames.filter((item) =>
              listBannedElementsName.includes(item.elementName)
            ).length
          "
        >
          <div class="calc__error-label">
            <p>Недоступные имена элементов</p>
            <p>Список всех имен элементов Заголовок / Имя:</p>
          </div>
          <div
            class="calc__error-item"
            v-for="(data, key) in listExistElementNames.filter((item) =>
              listBannedElementsName.includes(item.elementName)
            )"
            :key="key"
          >
            <div class="calc__error-item-name">
              {{ data.label ? data.label : "Без заголовка " }} /
              {{ data.elementName }}
            </div>
          </div>
          <p>
            Переименуйте указанные элементы иначе расчет может быть не
            корректен.
          </p>
        </template>
      </div>
      <p class="calc__error-item">
        В случае наличия ошибок, калькулятор может вести расчет некорректно!
      </p>
    </template>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useBaseStore } from "@/store/piniaStore";

export default {
  name: "ErrorTemplates",
  props: {
    templates: {
      type: Array,
      default: () => [],
    },
    initTemplate: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },
    formula: {
      type: String,
      default: null,
    },
  },
  mounted() {
    setTimeout(() => {
      this.processingAllTemplatesOnData();
      this.checkInShowing();
    }, 2000);
    console.warn(
      "Включен режим отладки с демонстрацией ошибок и внутренних состояний элементов."
    );
  },
  data() {
    return {
      listExistElementNames: [], // Список всех имен элементов которые могут участвовать в расчетах
      listDisplayFormula: [], //список всех формул отвечающих за отображение
      listComputedFormula: [], //Список всех формул отвечающих за расчет
      listBannedElementsName: [
        "_otherSum_",
        "_globalSum_",
        "_self_",
        "true",
        "false",
        "empty",
        "null",
      ],
      usedArrayNamesInElements: new Set(), //список используемых имен для создания зависимостей
      displayAlert: false,
      exceptionVariablesFormula: [
        "-",
        "+",
        "/",
        "*",
        "(",
        ")",
        "!==",
        "!=",
        "=",
        ">=",
        "<=",
        "<",
        ">",
        "==",
        "===",
        "||",
        "&&",
        "_otherSum_",
        "_self_",
        "_globalSum_",
        "true",
        "false",
        "empty",
        "null",
      ],
      isShow: false,
      localShowInsideElementStatus: false,
      spec: Object.entries({
        "&gt;": ">",
        "&lt;": "<",
        "&amp;": "&",
        "&quot;": '"',
      }),
    };
  },
  methods: {
    /**
     * рекурсивно обходим все шаблоны и получаем нужный массив данных
     * по указанному полю в указанную переменную
     * @param template - данные по которым происходит обход
     * @param desiredField - название / массив полей которые будут искаться в данных
     * @param accumulatorVariable - переменная из data() в которую будет передаваться полученный массив объектов
     * @param nameFieldOnResult - название поля в объекте куда будет передаваться полученные результаты по отдельному полю
     * @param label  - заголовок для переменной
     * @returns {boolean}
     */
    getNeedleDataInTemplates(
      template,
      desiredField,
      accumulatorVariable,
      nameFieldOnResult,
      label = null
    ) {
      if (template?.label) {
        label = template.label;
      }
      if (Array.isArray(desiredField)) {
        desiredField?.forEach((field) => {
          this.isExistField(template, field)
            ? this[accumulatorVariable].push({
                label: template?.label ? template?.label : label ? label : null,
                [nameFieldOnResult]: template[field],
              })
            : false;
        });
      } else {
        this.isExistField(template, desiredField)
          ? this[accumulatorVariable].push({
              label: template?.label ? template?.label : label ? label : null,
              [nameFieldOnResult]: template[desiredField],
            })
          : false;
      }

      for (let prop in template) {
        if (this.isDataObject(template[prop])) {
          this.getNeedleDataInTemplates(
            template[prop],
            desiredField,
            accumulatorVariable,
            nameFieldOnResult,
            label
          );
        } else if (this.isDataArray(template[prop])) {
          template[prop].forEach((item) =>
            this.getNeedleDataInTemplates(
              item,
              desiredField,
              accumulatorVariable,
              nameFieldOnResult,
              label
            )
          );
        }
      }
      return false;
    },
    /**
     * поле существует
     * @param template
     * @param field
     * @returns {boolean}
     */
    isExistField(template, field) {
      return Boolean(template[field]?.length);
    },
    /**
     * @param data
     */
    isDataObject(data) {
      return (
        typeof data === "object" &&
        !Array.isArray(data) &&
        data !== null &&
        data !== "undefined"
      );
    },
    /**
     *
     * @param data
     * @returns {*|boolean}
     */
    isDataArray(data) {
      return (
        Array.isArray(data) &&
        data?.length &&
        data !== null &&
        data !== "undefined"
      );
    },

    /**
     *
     * @returns {*[]}
     */
    processingAllTemplatesOnData() {
      if (!this.templates?.length) {
        return [];
      }
      const listFieldsInFormula = [
        "dependencyFormulaDisplay",
        "dependencyFormulaItem",
        "dependencyFormulaDisplayLeftSide",
        "dependencyFormulaDisplayRightSide",
      ];

      this.getNeedleDataInTemplates(
        this.templates,
        "elementName",
        "listExistElementNames",
        "elementName"
      );
      this.getNeedleDataInTemplates(
        this.templates,
        listFieldsInFormula,
        "listDisplayFormula",
        "displayFormula"
      );
      this.getNeedleDataInTemplates(
        this.templates,
        ["formula", "dependencyFormulaCost"],
        "listComputedFormula",
        "formula"
      );

      if (this.formula?.length) {
        this.listComputedFormula.push({
          label: "Основная формула",
          formula: this.formula,
        });
      }

      this.listDisplayFormula = this.listDisplayFormula.map((item) => {
        item.displayFormula = this.processingFormulaSpecialsSymbols(
          item.displayFormula
        );
        return item;
      });
      this.listComputedFormula = this.listComputedFormula.map((item) => {
        item.formula = this.processingFormulaSpecialsSymbols(item.formula);
        return item;
      });
      this.listExistElementNames.forEach((item) =>
        this.usedArrayNamesInElements.add(item.elementName)
      );
    },

    /**
     *
     * @param formula
     * @returns {*}
     */
    processingFormulaSpecialsSymbols(formula) {
      this.spec.forEach((specItem) => {
        formula = formula?.replaceAll(specItem[0], specItem[1]);
      });
      //разбиваем формулу на массив отдельных данных
      formula = formula
        ?.split(
          /([A-Za-zА-Яа-яЁё0-9_"']*)(\)|\(|>=|<=|<|>|\}|\{|!==|===|&&|\|\||\+|-|\/|\*)*/g
        )
        ?.map((item) => {
          //удаляем пробелы по краям
          let nextItem = item?.replace(/^\s*|\s*$/g, "");
          // если по краям есть кавычки, то удаляем пробелы между
          // кавычками и текстом в середине, не трогая пробелы внутри текста
          if (item?.match(/(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)/)) {
            item = "";
          }
          return item;
        })
        .filter(
          (item) =>
            item?.trim()?.length && !item.match(/^('|"|[0-9])\s*|\s*('|")$/g)
        );
      return formula;
    },

    /**
     *
     */
    checkInShowing() {
      this.isShow = Boolean(
        (Object.keys(this.recurringTemplateNames)?.length ||
          this.notExistNamesInComputedFormula?.length ||
          this.notExistNamesInDisplayFormula?.length ||
          this.usedArrayNamesInElements.size) &&
          this.initTemplate
      );
    },
  },
  watch: {
    localShowInsideElementStatus(newValue) {
      this.tryToggleShowInsideElementStatus(newValue);
    },
  },
  computed: {
    ...mapState(useBaseStore, ["tryToggleShowInsideElementStatus"]),
    /**
     * не существующие имена в формулах отвечающих за отображение элементов
     * @returns {*[]}
     */
    notExistNamesInDisplayFormula() {
      let usedNamesDependencyListOut = [];
      this.listDisplayFormula.forEach((item) => {
        item.displayFormula.forEach((name) => {
          if (
            !this.usedArrayNamesInElements.has(name) &&
            !this.exceptionVariablesFormula.includes(name)
          ) {
            usedNamesDependencyListOut.push({
              label: item.label,
              name: name,
            });
          }
        });
      });
      return usedNamesDependencyListOut;
    },

    /**
     * не существующие имена в формулах на расчет
     * @returns {*[]}
     */
    notExistNamesInComputedFormula() {
      let usedNamesDependencyListOut = [];
      this.listComputedFormula.forEach((item) => {
        item.formula.forEach((name) => {
          if (
            !this.usedArrayNamesInElements.has(name) &&
            !this.exceptionVariablesFormula.includes(name)
          ) {
            usedNamesDependencyListOut.push({
              label: item.label,
              name: name,
            });
          }
        });
      });
      return usedNamesDependencyListOut;
    },

    /**
     * Повторяющиеся имена переменных
     * @returns {{}}
     */
    recurringTemplateNames() {
      let recurring = {};
      let resultRecurring = {};
      this.listExistElementNames.forEach((item) => {
        if (item.elementName in recurring) {
          recurring[item.elementName].push(item.label);
        } else {
          recurring[item.elementName] = [];
          recurring[item.elementName].push(item.label);
        }
      });
      for (let key in recurring) {
        recurring[key].length > 1
          ? (resultRecurring[key] = recurring[key])
          : false;
      }
      return resultRecurring;
    },
    isExistDoubleNames() {
      return Boolean(Object.keys(this.recurringTemplateNames).length);
    },
    isExistNamesIsDisplayFormula () {
      return Boolean(this.notExistNamesInDisplayFormula.length);
    },
    isExistNamesInComputedFormula() {
      return Boolean(this.notExistNamesInComputedFormula.length)
    },
    isExistError() {
      return this.isExistDoubleNames || this.isExistNamesIsDisplayFormula || this.isExistNamesInComputedFormula
    }
  },
};
</script>
