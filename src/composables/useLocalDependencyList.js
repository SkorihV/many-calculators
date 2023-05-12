import { useBaseStore } from "@/store/piniaStore";
import { mapState } from "pinia";
import { getBaseStoreFields } from "@/composables/useBaseStore";
import { ref, reactive, unref, watch, isReactive } from "vue";


export function useLocalDependencyList() {
  const { globalDependenciesList} = getBaseStoreFields();
  const localDependencyList = reactive({});
  const countUpdatedDependency = ref(0);

  /**
   * Собираем локальный список зависимостей из глобального на основе формулы
   * @param formula
   */
  const constructLocalListElementDependencyInFormula = (formula) => {
    unref(formula).forEach((name) => {
      if (
        isElementDependency(name) &&
        !existLocalElementDependency(name)
      ) {
        putElementDependencyInLocalList(name);
      }
    });
  };

  const isElementDependency = (name) => {
    const elementIsNotExist = !name?.length && !globalDependenciesList.value;
    if (elementIsNotExist) {
      return false;
    }
    return name in globalDependenciesList.value;
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

  watch(() => globalDependenciesList,
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
      // вынести обновление из функции в сам компонент
      // if (isUpdated && this.changeValue) {
      //   this.changeValue("changeValueDependenciesElements");
      // }

    },
    {deep: true}
    );

  watch(() => localDependencyList,
    (newValue, oldValue)=> {
      let isUpdated = false;
      Object.entries(newValue).forEach(([key, data]) => {
        if (data.value !== oldValue[key].value) {
          isUpdated = true;
        }
      });
    },
    {deep: true});

  return {
    countUpdatedDependency,
    localDependencyList,
    isElementDependency,
    constructLocalListElementDependencyInFormula
  }
}



// export const MixinLocalDependencyList = {
//   data() {
//     return {
//       /**
//        * список переменных от которого зависит именно текущий элемент
//        */
//       localDependencyList: {},
//       countUpdatedDependency: 0,
//     };
//   },
//   methods: {
//     /**
//      * Собираем локальный список зависимостей из глобального на основе формулы
//      * @param formula
//      */
//     constructLocalListElementDependencyInFormula(formula) {
//       formula.forEach((name) => {
//         if (
//           this.isElementDependency(name) &&
//           !this.existLocalElementDependency(name)
//         ) {
//           this.putElementDependencyInLocalList(name);
//         }
//       });
//     },
//     isElementDependency(name) {
//       const elementIsNotExist = !name?.length && !this.globalDependenciesList;
//       if (elementIsNotExist) {
//         return false;
//       }
//       return name in this.globalDependenciesList;
//     },
//     /**
//      * @param name
//      * @returns {boolean}
//      */
//     existLocalElementDependency(name) {
//       return name in this.localDependencyList;
//     },
//     /**
//      * @param name
//      */
//     putElementDependencyInLocalList(name) {
//       this.localDependencyList[name] = this.globalDependenciesList[name];
//     },
//   },
//   watch: {
//     globalDependenciesList: {
//       handler(newValue) {
//         let isUpdated = false;
//         for (let key in newValue) {
//           const isUpdatedDependencyList =
//             this.existLocalElementDependency(key) &&
//             (newValue[key].value !== this.localDependencyList[key].value ||
//               newValue[key].isShow !== this.localDependencyList[key].isShow);
//
//           if (isUpdatedDependencyList) {
//             this.localDependencyList[key] = newValue[key];
//             isUpdated = true;
//             this.countUpdatedDependency++;
//           }
//         }
//         if (isUpdated && this.changeValue) {
//           this.changeValue("changeValueDependenciesElements");
//         }
//       },
//       deep: true,
//     },
//     localDependencyList: {
//       handler(newValue, oldValue) {
//         let isUpdated = false;
//         Object.entries(newValue).forEach(([key, data]) => {
//           if (data.value !== oldValue[key].value) {
//             isUpdated = true;
//           }
//         });
//       },
//       deep: true,
//     },
//   },
//   computed: {
//     ...mapState(useBaseStore, [
//       "globalDependenciesList",
//     ]),
//   },
// };
