import {useBaseStore} from '@/store/piniaStore'
import {storeToRefs} from "pinia";

export function getBaseStoreFields () {
  const store = useBaseStore();
  return storeToRefs(store)
}
