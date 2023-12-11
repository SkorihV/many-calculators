import {defineStore} from "pinia";

export const useDisplayComponentsStore = defineStore( 'displayComponents',{
    state: () => ({
        components: {}
    }),
    getters: {
        isExistComponent: ({components}) => (name) => {
            return name in components;
        },
        isShowComponent: ({components}) => (name) => {
           if (name in components) {
               return components[name]?.isShow;
           }
           return null;
        }
    },
    actions: {
        addDisplayComponent(dataElement) {
            if (!dataElement?.name) {
                return false;
            }
          this.components[dataElement.name] = dataElement
        },
        deleteDisplayInList(name) {
            if (name in this.components) {
                delete this.components[name]
            }
        }

    }
})

