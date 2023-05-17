import {getBaseStoreGetters} from "@/composables/useBaseStore";


const isElementDependency = (name) => {
  const {globalDependenciesList} = getBaseStoreGetters();
  const elementIsNotExist = !name?.length && !globalDependenciesList.value;
  if (elementIsNotExist) {
    return false;
  }
  return name in globalDependenciesList.value;
};

export {isElementDependency}
