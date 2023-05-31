import { useBaseStore } from "@/store/piniaStore";
import { storeToRefs } from "pinia";

export function getBaseStoreGetters() {
  const store = useBaseStore();
  return storeToRefs(store);
}

/**
 *
 * @param actionName
 * @returns {*|null}
 */
export function getBaseStoreAction(actionName = null) {
  const store = useBaseStore();
  if (Array.isArray(actionName)) {
    return actionName.reduce((result, name) => {
      if (name in store) {
        result[name] = store[name];
        return result;
      }
      result[name] = null;
      return result;
    }, {});
  } else if (typeof actionName === "string") {
    if (actionName in store) {
      return store[actionName];
    }
    return null;
  }
  return null;
}
