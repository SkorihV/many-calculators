import {useBaseStore} from '@/store/piniaStore'
import {storeToRefs} from "pinia";
import { reactive } from "vue";

export function getBaseStoreFields (fieldsList = null) {
  if (fieldsList === null) {
    const store = useBaseStore();
    return storeToRefs(store)
  }
  if (Array.isArray(fieldsList)) {
    let returnList = reactive({});
    fieldsList.map(field => {
      if (store[field]) {
        returnList[field] = store[field].value;
      }
    })
  }
  return null;
}
