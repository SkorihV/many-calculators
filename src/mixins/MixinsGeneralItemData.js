import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";

export const MixinsGeneralItemData = {
  watch: {
    /**
     * При глобальном включении возможности отображать подсказки - отправить состояние элемента
     */
    isCanShowAllTooltips() {
      if (this.parentIsShow) {
        this.changeValid("global");
      }
    },
    /**
     * При изменении состояния видимости родителя - отправить состояние элемента.
     */
    parentIsShow(newValue) {
      if (newValue) {
        this.changeValue("global");
      } else {
        this.changeValue("delete");
      }
    },
  },
  computed: {
    ...mapState(useBaseStore, [
      "isCanShowAllTooltips",
      "devMode",
      "showInsideElementStatus",
    ]),
    /**
     * Существует список цен с зависимостями
     * @returns {boolean}
     */
    isDependencyPriceExist() {
      return Boolean(
        this.dependencyPrices?.filter(
          (item) =>
            !item?.disabledFormula && item?.dependencyFormulaCost?.length
        )
      );
    },
    /**
     * Инициализировать проверку условий зависимых цен
     *
     * @returns {boolean}
     */
    initProcessingDependencyPrice() {
      return this.isDependencyPriceExist;
    },
  },
};
