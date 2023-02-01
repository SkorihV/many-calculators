/**
 *
 * @param propsName
 * @returns {{}}
 */
export default function (propsName) {
  const propsForReturn = {};

  /**
   * заголовок
   */
  const label = () => {
    return {
      type: String,
      default: "",
    };
  };
  const elementName = () => {
    return {
      type: String,
      default: Math.random().toString(),
    };
  };
  const classes = () => {
    return {
      type: String,
      default: null,
    };
  };

  /**
   * Формула на результатах вычисления которой будет строиться результат отображения элемента
   * @returns {{default: string, type: StringConstructor}}
   */
  const dependencyFormulaDisplay = () => {
    return {
      type: String,
      default: "",
    };
  };

  const parentIsShow = () => {
    return {
      type: Boolean,
      default: true,
    };
  };

  const prompt = () => {
    return {
      type: String,
      default: null,
    };
  };

  const maxWidthSide = () => {
    return {
      type: [Number, String],
      default: 50,
    };
  };

  const maxWidth = () => {
    return {
      type: [Number, String],
      default: 50,
    };
  };

  const maxHeight = () => {
    return {
      type: [Number, String],
      default: 50,
    };
  };

  const templateName = () => {
    return {
      type: String,
      default: null,
    };
  };

  const template = () => {
    return {
      type: Object,
      default: null,
    };
  };

  const formulaProcessingLogic = () => {
    return {
      type: String,
      default: "error",
    };
  };

  const parentName = () => {
    return {
      type: String,
      default: null,
    };
  };

  /**
   * Исключить элемент из расчета по формуле
   */
  const excludeFromCalculations = () => {
    return {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    };
  };
  /**
   * элемент не может быть пустым и требуется выбор
   */
  const notEmpty = () => {
    return {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    };
  };

  const index = () => {
    return {
      type: [Number, String],
      default: null,
    };
  };

  const cost = () => {
    return {
      type: [Number, String],
      default: null,
      validator(value) {
        return !isNaN(Number(value));
      },
    };
  };
  /**
   * Список цен с зависимостями / условиями
   */
  const dependencyPrices = () => {
    return {
      type: Array,
      default: () => [],
    };
  };

  const isColumn = () => {
    return {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    };
  };

  /**
   * По умолчанию не выбрано - нужно сделать выбор.
   */
  const isNeedChoice = () => {
    return {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    };
  };
  /**
   * метод вывода данных в результирующую форму
   */
  const formOutputMethod = () => {
    return {
      type: String,
      default: "no",
    };
  };

  /**
   *     Всегда включена. Отключить нельзя
   */
  const isChecked = () => {
    return {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    };
  };

  const formula = () => {
    return {
      type: String,
      default: "",
    };
  };

  const min = () => {
    return {
      type: [Number, String],
      default: 0,
      validator(value) {
        return !isNaN(Number(value));
      },
    };
  };

  const max = () => {
    return {
      type: [Number, String],
      default: 10,
      validator(value) {
        return !isNaN(Number(value));
      },
    };
  };

  const unit = () => {
    return {
      type: String,
      default: "",
    };
  };

  const resultsData = {
    label: label(),
    elementName: elementName(),
    classes: classes(),
    dependencyFormulaDisplay: dependencyFormulaDisplay(),
    parentIsShow: parentIsShow(),
    prompt: prompt(),
    notEmpty: notEmpty(),
    excludeFromCalculations: excludeFromCalculations(),
    parentName: parentName(),
    formulaProcessingLogic: formulaProcessingLogic(),
    templateName: templateName(),
    maxWidthSide: maxWidthSide(),
    maxWidth: maxWidth(),
    maxHeight: maxHeight(),
    template: template(),
    index: index(),
    cost: cost(),
    dependencyPrices: dependencyPrices(),
    isColumn: isColumn(),
    isNeedChoice: isNeedChoice(),
    formOutputMethod: formOutputMethod(),
    isChecked: isChecked(),
    formula: formula(),
    min: min(),
    max: max(),
    unit: unit(),
  };

  if (Array.isArray(propsName)) {
    propsName.map((name) => {
      if (resultsData[name]) {
        propsForReturn[name] = resultsData[name];
      } else {
        throw "Попытка вызвать отсутствующий в базе Props - " + name;
      }
    });
  }
  return propsForReturn;
}
