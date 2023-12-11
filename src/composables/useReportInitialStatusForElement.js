import { watch } from "vue";
import {useBaseStore} from "@/store/baseStore";
import {storeToRefs} from "pinia";

/**
 *
 * @param parentIsShow
 * @param changeValue
 * @param changeValid
 * @returns {{initProcessingDependencyPrice: ComputedRef<boolean>}}
 */
export const useReportInitialStatusForElement = (
  parentIsShow,
  changeValue,
  changeValid
) => {
  const { isCanShowAllTooltips } = storeToRefs(useBaseStore());
  /**
   * При глобальном включении возможности отображать подсказки - отправить состояние элемента
   */
  watch(isCanShowAllTooltips, () => {
    if (parentIsShow.value) {
      changeValid("global");
    }
  });
  /**
   * При изменении состояния видимости родителя - отправить состояние элемента.
   */
  watch(
    () => parentIsShow.value,
    (newValue) => {
      if (newValue) {
        changeValue("global");
      } else {
        changeValue("delete");
      }
    }
  );
};
