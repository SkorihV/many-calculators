import { useBaseStore } from "@/store/piniaStore";
import { storeToRefs } from "pinia";
import { reactive, ref } from "vue";

export function getBaseStoreGetters(fieldsList = null) {
  const store = useBaseStore();
  if (fieldsList === null) {
    return storeToRefs(store);
  } else if (Array.isArray(fieldsList)) {
    let returnList = reactive({});
    fieldsList.forEach((field) => {
      if (field in store) {
        returnList[field] = store[field];
      } else {
        returnList[field] = null;
      }
    });
    return returnList;
  } else if (typeof fieldsList === "string") {
    if (fieldsList in store) {
      return ref(store[fieldsList]);
    }
    return null;
  }
  return null;
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
