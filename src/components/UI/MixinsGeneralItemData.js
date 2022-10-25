export const MixinsGeneralItemData = {
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
     * Исключить элемент из расчета по формуле
     */
    excludeFromCalculations: {
      type: [Boolean, Number],
      default: false,
      validator(value) {
        return value === false || value === true || value === 0 || value === 1;
      },
    },

    /**
     * имя необходимое для корректной работы Label
     */
    elementName: {
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
  watch: {
    /**
     * При глобальном включении возможности отображать подсказки - отправить состояние элемента
     */
    globalCanBeShownTooltip() {
      if (this.parentIsShow) {
        this.changeValid("global");
      }
    },
    /**
     * При изменении состояния видимости родителя - отправить состояние элемента.
     */
    parentIsShow() {
      if (this.parentIsShow) {
        this.changeValid("global");
      } else {
        this.changeValue("delete");
      }
    },
  },

  computed: {
    /**
     * Существует список цен с зависимостями
     * @returns {boolean}
     */
    isDependencyPriceExist() {
      return Boolean(
        this.dependencyPrices?.filter(
          (item) => item?.enabledFormula && item?.dependencyFormulaCost?.length
        )
      );
    },
    /**
     * Иницаилизировать проверку условий зависимых цен
     *
     * @returns {boolean}
     */
    initProcessingDependencyPrice() {
      return this.isDependencyPriceExist;
    },
  },
};