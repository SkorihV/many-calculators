import {computed, watch} from "vue";

/**
 *
 * @param dependencyPrices
 * @returns {{initProcessingDependencyPrice: ComputedRef<boolean>}}
 */
export const useInitProcessingDependencyPrice = (dependencyPrices) => {

    /**
     * Существует список цен с зависимостями
     * @returns {boolean}
     */

    const initProcessingDependencyPrice = computed(() => {
        return Boolean(
            dependencyPrices.value &&
            dependencyPrices.value?.filter(
                (item) =>
                    !item?.disabledFormula && item?.dependencyFormulaCost?.length
            )
        );
    })
    return {initProcessingDependencyPrice}
};
