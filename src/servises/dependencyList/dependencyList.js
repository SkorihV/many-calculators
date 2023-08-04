import {useBaseStore} from "@/store/piniaStore";
import {storeToRefs} from "pinia";
const isElementDependency = (name) => {
  const { globalDependenciesList } = storeToRefs(useBaseStore());
  const elementIsNotExist = !name?.length && !globalDependenciesList.value;
  if (elementIsNotExist) {
    return false;
  }
  return name in globalDependenciesList.value;
};

export { isElementDependency };
