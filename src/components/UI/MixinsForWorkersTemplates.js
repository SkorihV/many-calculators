export const MixinsForWorkersTemplates = {
  props: {
    /**
     * заголовок
     */
    label: {
      type: String,
      default: "",
    },
    /**
     * инпут не может быть пустым
     */
    notEmpty: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

    /**
     * метод вывода данных в результирующую форму
     */
    formOutputMethod: {
      type: String,
      default: "no",
    },
    /**
     * имя необходимое для корректной работы Label
     */
    elementName: {
      type: String,
      default: null,
    },
    /**
     * Название элемента от значения которого будет строиться зависимость
     */
    dependencyName: {
      type: String,
      default: "",
    },
    /**
     * Формула на результатах вычисления которой будет строиться результат отображения элемента
     */
    dependencyFormulaDisplay: {
      type: String,
      default: "",
    },
    /**
     * Список классов для переопределения стилей на обертке
     */
    classes: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      spec: Object.entries({
        "&gt;": ">",
        "&lt;": "<",
        "&amp;": "&",
      }),
    };
  },
  methods: {
    checkedValueOnVoid(value) {
      return value?.length !== 0 && value !== undefined && value !== null;
    },
    /**
     *
     * @param formula
     * @returns {*}
     */
    processingFormulaSpecialsSymbols(formula) {
      this.spec.forEach((specItem) => {
        formula = formula.replaceAll(specItem[0], specItem[1]);
      });
      //разбиваем формулу на массив отдельных данных
      formula = formula
        ?.split(
          /([A-Wa-wА-Яа-яЁё0-9-_'" ]*)(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)*/g
        )
        .filter((item) => item?.trim()?.length);

      formula = formula.map((item) => {
        //удаляем пробелы по краям
        let nextItem = item.replace(/^\s*|\s*$/g, "");
        // если по краям есть кавычки, то удаляем пробелы между
        // кавычками и текстом в середине, не трогая пробелы внутри текста
        if (nextItem.match(/^('|").*('|")$/)) {
          nextItem = "'" + nextItem.replace(/^('|")\s*|\s*('|")$/g, "") + "'";
        }

        return nextItem;
      });
      return formula;
    },

    /**
     * Обработать полученные переменные из формулы
     * и получить строку со значениями
     * @returns {string}
     */
    processingVariablesOnFormula(formula) {
      if (!this.getMajorElementDependency) {
        return '';
      }

      return formula.reduce((resultText, item) => {
        if (item === this.dependencyName) {
          if (!isNaN(parseFloat(this.getMajorElementDependency?.value))) {
            return resultText + this.getMajorElementDependency.value;
          } else if (
            this.getMajorElementDependency?.value === false ||
            this.getMajorElementDependency?.value === true
          ) {
            return resultText + Boolean(this.getMajorElementDependency?.value);
          } else {
            return resultText + "'" + this.getMajorElementDependency.value + "'";
          }
        }
        return resultText + item;
      }, "");
    },
    /**     *
     * Обработать список цен на подходящее условие и вернуть итоговую цену или null
     *
     * @param dependencyPrice
     * @returns {number|number|*|null}
     */
    costAfterProcessingDependencyPrice(dependencyPrice) {
      let result = dependencyPrice.reduce(
        (resultReduce, item) => {
          if (!item.enabledFormula) {
            return resultReduce;
          }

          let formula = this.processingFormulaSpecialsSymbols(
            item?.dependencyFormulaCost
          );

          formula = this.processingVariablesOnFormula(formula);
          try {
            if (eval(formula)) {
              resultReduce.changed = true;
              resultReduce.cost = item.cost ? item.cost : 0;
              return resultReduce;
            }
            return resultReduce;
          } catch (e) {
            console.log(e.message);
            return resultReduce;
          }
        },
        /**
         * changed - необходим для понимания сработала формула хоть раз или нет,
         * если не сработала, то блок с зависимыми ценами пропускается и выводится стандартная
         */
        { cost: 0, changed: false }
      );
      return result.changed ? result.cost : null;
    },
  },
  watch: {
    /**
     * Отправить команду на удаление элемента из общих данных при его скрытии
     * @param newValue
     */
    isVisibilityFromDependency(newValue) {
      if (newValue) {
        this.changeValue("dependency");
      } else {
        setTimeout(() => {
          this.changeValue("delete");
        }, 10)

      }
    },
    /**
     * При изменении состояния элемента от которого зависит текущий - повторно производить вычисления состояния текущего
     */
    majorElementDependency: {
      handler(newValue, oldValue) {
        if (
          newValue?.value !== oldValue?.value &&
          this.isVisibilityFromDependency
        ) {
          this.changeValue();
        }
      },
      deep: true,
    },
  },

  computed: {
    /**
     * Отобразить текущий элемент
     * @returns {boolean|any}
     */
    isVisibilityFromDependency() {
      if (this.isDependencyElementVisibility && this.getMajorElementDependency) {
        try {
          return eval(this.parsingFormulaVariables);
        } catch (e) {
          return false;
        }
      }
      return true;
    },
    /**
     * Отобразить поле
     * @returns {boolean}
     */
    isDependencyElementVisibility() {
      return Boolean(
        this.isDependencyNameExist && this.dependencyFormulaDisplay?.length
      );
    },
    /**
     * Для поля указано имя от которого оно будет зависеть
     * @returns {boolean}
     */
    isDependencyNameExist() {
      return Boolean(this.dependencyName?.length);
    },
    /**
     * Элемент от которого идет зависимость
     * @returns {*|null}
     */
    getMajorElementDependency() {
      if (!this.dependencyName.length) {
        return null;
      }

      return this.dependencyName in this.globalDataForDependencies
        ? this.globalDataForDependencies[this.dependencyName]
        : null;
    },
    /**
     * Получить массив значений из формулы
     * @returns {string|*[]}
     */
    parsingFormulaVariables() {
      if (!this.dependencyFormulaDisplay.length) {
        return [];
      }
      let formula = this.processingFormulaSpecialsSymbols(
        this.dependencyFormulaDisplay
      );

      return this.processingVariablesOnFormula(formula);
    }
  },
};
