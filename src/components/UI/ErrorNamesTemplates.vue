<template>
  <div
    class="calc__error-wrapper"
    v-if="isShow"
    :class="{ isShow: isShow }"
    v-cloak
  >
    <div class="calc__error-toggle" @click="displayAlert = !displayAlert">
      X
    </div>
    <template v-if="displayAlert">
      <template v-if="Object.keys(recurringTemplateNames).length">
        <div class="calc__error-label">Обнаружены дубли имен:</div>
        <div
          class="calc__error-item"
          v-for="(error, key) in recurringTemplateNames"
          :key="key"
        >
          <div class="calc__error-item-name">
            Имя элемента '{{ key }}' обнаружено у следующих элементов:
          </div>
          <div class="calc__error-item-label" v-for="label in error">
            Заголовок: {{ label.length ? label : "Отсутствует" }}
          </div>
        </div>
        <p class="calc__error-alert">Имена должны быть уникальными!</p>
      </template>
      <template v-if="notExistUsedNamesInFormulaInOut.length">
        <div class="calc__error-label">
          Обнаружены не существующие имена в зависимостях:
        </div>
        <div
          class="calc__error-item"
          v-for="(error, key) in notExistUsedNamesInFormulaInOut"
          :key="key"
        >
          <div class="calc__error-item-name">
            Имя элемента: '{{
              error?.label?.length ? error?.label : "Отсутствует"
            }}' Значение: '{{ error.name }}' - не существует.
          </div>
        </div>
        <p class="calc__error-alert">
          Измените существующие имена или добавьте недостающие.
        </p>
      </template>

      <template v-if="notExistNamesInMainFormula.length">
        <div class="calc__error-label">
          В результирующей формуле есть не существующие переменные.
        </div>
        <div
          class="calc__error-item"
          v-for="(error, key) in notExistNamesInMainFormula"
          :key="key"
        >
          {{ error }}
        </div>
      </template>
      <p class="calc__error-item">
        В случае наличия ошибок, калькулятор может вести расчет некорректно!
      </p>
    </template>
  </div>
</template>

<script>
export default {
  name: "ErrorUniqueNamesTemplates",
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
      this.processingAllTemplatesForDependencyNames();
      this.checkInShowing();
    }, 2000);
  },
  data() {
    return {
      existsNamesDependencyData: [], // Список всех имен элементов которые могут участвовать в расчетах
      usedNamesDependencyListData: [], //список используемых имен для создания зависимостей
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
        "==",
        "===",
        "_otherSumma_",
        "self",
        "true",
        "false",
        "empty",
      ],
      isShow: false,
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
     * рекурсивная функция обходящая все шаблоны
     * и собирающая имена переменных участвующих в формулах
     * @param template
     * @returns {boolean}
     */
    recursivelyTraverseAllTemplateElements(template) {
      this.isElementNameExist(template)
        ? this.existsNamesDependencyData.push({
            label: template.label,
            elementName: template.elementName,
          })
        : false;

      let currentFormulaTemplate = this.getFormulaTemplate(template);
      if (currentFormulaTemplate.length) {
        this.usedNamesDependencyListData.push({
          label: template?.label
            ? template.label
              ? template?.title
              : template?.title
            : null,
          dependencyNames: currentFormulaTemplate,
        });
      }

      for (let prop in template) {
        if (
          typeof template[prop] === "object" &&
          !Array.isArray(template[prop]) &&
          template[prop] !== null
        ) {
          this.recursivelyTraverseAllTemplateElements(template[prop]);
        } else if (
          Array.isArray(template[prop]) &&
          template[prop].length &&
          template[prop] !== null
        ) {
          template[prop].forEach((item) =>
            this.recursivelyTraverseAllTemplateElements(item)
          );
        }
      }
      return false;
    },
    processingAllTemplatesForDependencyNames() {
      if (!this.templates?.length) {
        return [];
      }
      const length = this.templates.length;
      for (let i = 0; i < length; i++) {
        const currentTemplate = this.templates[i];
        this.recursivelyTraverseAllTemplateElements(currentTemplate);
      }
    },

    isElementNameExist(template) {
      return Boolean(template?.elementName?.length);
    },

    getFormulaTemplate(template) {
      let formula = [];
      if (
        "dependencyFormulaDisplay" in template &&
        template.dependencyFormulaDisplay?.length
      ) {
        formula = this.processingFormulaSpecialsSymbols(
          template.dependencyFormulaDisplay
        );
      } else if (
        "dependencyFormulaItem" in template &&
        template.dependencyFormulaItem?.length
      ) {
        formula = this.processingFormulaSpecialsSymbols(
          template.dependencyFormulaItem
        );
      } else if (
        "dependencyFormulaCost" in template &&
        template.dependencyFormulaCost?.length
      ) {
        formula = this.processingFormulaSpecialsSymbols(
          template.dependencyFormulaCost
        );
      }

      if (
        "dependencyFormulaDisplayLeftSide" in template &&
        template.dependencyFormulaDisplayLeftSide?.length
      ) {
        formula = [
          ...formula,
          ...this.processingFormulaSpecialsSymbols(
            template.dependencyFormulaDisplayLeftSide
          ),
        ];
      }

      if (
        "dependencyFormulaDisplayRightSide" in template &&
        template.dependencyFormulaDisplayRightSide?.length
      ) {
        formula = [
          ...formula,
          ...this.processingFormulaSpecialsSymbols(
            template.dependencyFormulaDisplayRightSide
          ),
        ];
      }
      return formula;
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
          /([A-Za-z0-9-_]*)(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)*/g
        )
        ?.map((item) => {
          //удаляем пробелы по краям
          let nextItem = item?.replace(/^\s*|\s*$/g, "");
          // если по краям есть кавычки, то удаляем пробелы между
          // кавычками и текстом в середине, не трогая пробелы внутри текста
          if (item?.match(/(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)/)) {
            item = "";
            // nextItem = "'" + nextItem?.replace(/^('|")\s*|\s*('|")$/g, "") + "'";
          }
          return item;
        })
        .filter(
          (item) =>
            item?.trim()?.length && !item.match(/^('|"|[0-9])\s*|\s*('|")$/g)
        );
      // formula = formula.filter((item) => {
      //    return item && item?.length && isNaN(Number(item))
      //   });

      return formula;
    },

    /**
     *
     */
    checkInShowing() {
      this.isShow = Boolean(
        (Object.keys(this.recurringTemplateNames)?.length ||
          this.notExistUsedNamesInFormulaInOut?.length ||
          this.notExistNamesInMainFormula?.length) &&
          this.initTemplate
      );
    },
  },
  computed: {
    existNames() {
      return this.existsNamesDependencyData.map((item) => {
        return item.elementName;
      });
    },

    /**
     * Не существующие переменные указанные в формулах зависимостей
     * @returns {*[]}
     */
    notExistUsedNamesInFormulaInOut() {
      let usedNamesDependencyListOut = [];
      this.usedNamesDependencyListData.filter((item) => {
        item.dependencyNames.map((name) => {
          if (
            !this.existNames.includes(name) &&
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
      this.existsNamesDependencyData.forEach((item) => {
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
    /**
     * Не существующие переменные указанные в основной формуле
     * @returns {*[]}
     */
    notExistNamesInMainFormula() {
      if (this.formula?.length) {
        let outputDataFormula = [];
        let innerFormula = this.formula
          .split(" ")
          .filter(
            (item) =>
              item.length &&
              !this.exceptionVariablesFormula.includes(item) &&
              isNaN(Number(item))
          );

        const lengthFormula = innerFormula.length;

        for (let i = 0; i < lengthFormula; i++) {
          const length = this.existsNamesDependencyData.length;
          let isEmpty = true;
          for (let j = 0; j < length; j++) {
            if (
              this.existsNamesDependencyData[j].elementName === innerFormula[i]
            ) {
              isEmpty = false;
              break;
            }
          }
          if (isEmpty) {
            outputDataFormula.push(innerFormula[i]);
          }
        }

        return outputDataFormula;
      }
      return [];
    },
  },
};
</script>

<style lang="scss"></style>
