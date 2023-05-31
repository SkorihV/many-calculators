import {getBaseStoreGetters} from "@/composables/useBaseStore";
import {computed, watch} from "vue";

/**
 *
 * @param parentIsShow
 * @param changeValid
 * @param dependencyPrices
 * @returns {{initProcessingDependencyPrice: ComputedRef<boolean>}}
 */
export const useGeneralItemData = (parentIsShow, dependencyPrices, changeValue, changeValid) => {
  const {isCanShowAllTooltips} = getBaseStoreGetters()
  /**
   * При глобальном включении возможности отображать подсказки - отправить состояние элемента
   */
  watch(isCanShowAllTooltips, () => {
    if (parentIsShow.value) {
      changeValid("global");
    }
  })
  /**
   * При изменении состояния видимости родителя - отправить состояние элемента.
   */
  watch(() => parentIsShow.value, (newValue) => {
    if (newValue) {
      changeValue("global");
    } else {
      changeValue("delete");
    }
  })

  /**
   * Существует список цен с зависимостями
   * @returns {boolean}
   */

  const isDependencyPriceExist = computed(() => {
      return Boolean(
          dependencyPrices.value &&
          dependencyPrices.value?.filter(
              (item) =>
                  !item?.disabledFormula && item?.dependencyFormulaCost?.length
          )
      );
    })

    /**
     * Инициализировать проверку условий зависимых цен
     *
     * @returns {boolean}
     */
  const initProcessingDependencyPrice = computed(() => {
      return isDependencyPriceExist.value;
    })

  return {
    initProcessingDependencyPrice
  }

};
