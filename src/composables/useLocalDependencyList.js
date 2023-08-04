import { ref, reactive, watch} from "vue";
import {useBaseStore} from "@/store/piniaStore";
import {storeToRefs} from "pinia";

export function useLocalDependencyList() {
  const baseStore = useBaseStore()
  const baseStoreRefs = storeToRefs(baseStore)
  const { globalDependenciesList } = baseStoreRefs;
  const localDependencyList = reactive({});
  const countUpdatedDependency = ref(0);

  /**
   * Собираем локальный список зависимостей из глобального на основе формулы
   * @param formula
   */
  const constructLocalListElementDependencyInFormula = (formula) => {
    formula?.forEach((name) => {
      if (baseStore.isElementDependency(name) && !existLocalElementDependency(name)) {
        putElementDependencyInLocalList(name);
      }
    });
  };

  /**
   * @param name
   * @returns {boolean}
   */
  const existLocalElementDependency = (name) => {
    return name in localDependencyList;
  };
  /**
   * @param name
   */
  const putElementDependencyInLocalList = (name) => {
    localDependencyList[name] = globalDependenciesList.value[name];
  };

  watch(
    globalDependenciesList,
    (newValue) => {
      let isUpdated = false;
      for (let key in newValue) {
        const isUpdatedDependencyList =
          existLocalElementDependency(key) &&
          (newValue[key].value !== localDependencyList[key].value ||
            newValue[key].isShow !== localDependencyList[key].isShow);

        if (isUpdatedDependencyList) {
          localDependencyList[key] = newValue[key];
          isUpdated = true;
          countUpdatedDependency.value++;
        }
      }
      //вынести обновление из функции в сам компонент
      // if (isUpdated && this.changeValue) {
      //   this.changeValue("changeValueDependenciesElements");
      // }
    },
    { deep: true }
  );

  watch(
    () => localDependencyList,
    (newValue, oldValue) => {
      let isUpdated = false;
      Object.entries(newValue).forEach(([key, data]) => {
        if (data.value !== oldValue[key].value) {
          isUpdated = true;
        }
      });
    },
    { deep: true }
  );

  return {
    countUpdatedDependency,
    localDependencyList,
    constructLocalListElementDependencyInFormula,
  };
}
