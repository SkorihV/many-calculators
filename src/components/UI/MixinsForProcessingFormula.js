export const MixinsForProcessingFormula = {
  props: {
    /**
     * Формула на результатах вычисления которой будет строиться результат отображения элемента
     */
    dependencyFormulaDisplay: {
      type: String,
      default: "",
    },
    parentIsShow: {
      type: Boolean,
      default: true,
    },
  },
  mounted() {},
  data() {
    return {
      spec: Object.entries({
        "&gt;": ">",
        "&lt;": "<",
        "&amp;": "&",
        "&quot;": '"',
      }),
      /**
       * список переменных от которого зависит именно текущий элемент
       */
      localListElementDependency: {},
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
        formula = formula?.replaceAll(specItem[0], specItem[1]);
      });
      //разбиваем формулу на массив отдельных данных
      formula = formula
        ?.split(
          /([A-Za-z0-9-_]*)(\)|\(|>=|<=|<|>|!==|===|&&|\|\||\+|-|\/|\*)*/g
        )
        .filter((item) => item?.trim()?.length);

      formula = formula?.map((item) => {
        //удаляем пробелы по краям
        let nextItem = item?.replace(/^\s*|\s*$/g, "");
        // если по краям есть кавычки, то удаляем пробелы между
        // кавычками и текстом в середине, не трогая пробелы внутри текста
        if (nextItem.match(/^('|").*('|")$/)) {
          nextItem = "'" + nextItem?.replace(/^('|")\s*|\s*('|")$/g, "") + "'";
        }

        return nextItem;
      });
      return formula;
    },

    constructLocalListElementDependencyInFormula(formula) {
      formula.forEach((name) => {
        if (
          this.isElementDependency(name) &&
          !this.existLocalElementDependency(name)
        ) {
          this.putElementDependencyInLocalList(name);
        }
      });
    },

    /**
     * Обработать полученные переменные из формулы
     * и получить строку со значениями
     * @returns {string}
     */
    processingVariablesOnFormula(formula) {
      return formula?.reduce((resultText, item) => {
        // this.constructLocalListElementDependencyInFormula(formula)
        let elementDependency =
          item in this.localListElementDependency
            ? this.localListElementDependency[item]
            : null;

        if (elementDependency && elementDependency.isShow) {
          if (!isNaN(parseFloat(elementDependency?.value))) {
            return resultText + elementDependency?.value;
          } else if (typeof elementDependency?.value === "boolean") {
            return resultText + Boolean(elementDependency?.value);
          } else {
            return resultText + "'" + elementDependency.value + "'";
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
      let result = dependencyPrice?.reduce(
        (resultReduce, item) => {
          if (!item.enabledFormula) {
            return resultReduce;
          }
          let formula = this.processingFormulaSpecialsSymbols(
            item?.dependencyFormulaCost
          );

          this.constructLocalListElementDependencyInFormula(formula);
          formula = this.processingVariablesOnFormula(formula);
          try {
            if (eval(formula)) {
              resultReduce.changed = true;
              resultReduce.cost = item.cost ? item.cost : 0;
              return resultReduce;
            }
            return resultReduce;
          } catch (e) {
            // console.log(e.message);
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
    /**
     * Элемент от которого идет зависимость
     * @returns {*|null}
     */
    isElementDependency(name) {
      if (!name?.length && !this.globalDataForDependencies) {
        return false;
      }
      return name in this.globalDataForDependencies;
    },
    existLocalElementDependency(name) {
      return name in this.localListElementDependency;
    },
    putElementDependencyInLocalList(name) {
      this.localListElementDependency[name] =
        this.globalDataForDependencies[name];
    },
  },
  watch: {
    /**
     * Отправить команду на удаление элемента из общих данных при его скрытии
     * @param newValue
     */
    isVisibilityFromDependency(newValue) {
      if (newValue && this.globalCanBeShownTooltip) {
        this.changeValue("dependency");
      } else {
        setTimeout(() => {
          this.changeValue("delete");
        }, 10);
      }
    },

    globalCanBeShownTooltip(newValue) {
      if (newValue && this.isVisibilityFromDependency) {
        this.changeValue("dependency");
      }
    },

    globalDataForDependencies: {
      handler(newValue) {
        let isUpdated = false;
        for (let key in newValue) {
          if (this.existLocalElementDependency(key)) {
            if (
              newValue[key].value !==
              this.localListElementDependency[key].value ||
              newValue[key].isShow !==
              this.localListElementDependency[key].isShow
            ) {
              this.localListElementDependency[key] = newValue[key];
              isUpdated = true;
            }
          }
        }
        if (isUpdated) {
          this.changeValue("changeValueDependenciesElements");
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
      if (this.isDependencyElementVisibility || !this.parentIsShow) {
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
      return Boolean(this.dependencyFormulaDisplay?.length);
    },

    /**
     * Получить массив значений из формулы
     * @returns {string|boolean}
     */
    parsingFormulaVariables() {
      if (!this.isDependencyElementVisibility) {
        return false;
      }

      let formula = this.processingFormulaSpecialsSymbols(
        this.dependencyFormulaDisplay
      );
      this.constructLocalListElementDependencyInFormula(formula);
      return this.processingVariablesOnFormula(formula);
    },
  },
};
