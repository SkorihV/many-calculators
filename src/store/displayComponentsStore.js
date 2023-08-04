import {defineStore} from "pinia";

export const useDisplayComponentsStore = defineStore( 'displayComponents',{
    state: () => ({
        components: new Map()
    }),
    getters: {
        isExistComponent: ({components}) => (name) => {
            return components.has(name);
        },
        isDisplayingComponent: ({components}) => (name) => {
           if (components.has(name)) {
               return components.get(name)?.isShow;
           }
           return null;
        }
    },
    actions: {
        addDisplayComponent(dataElement) {
          this.components.set(dataElement.name, dataElement)
        },

    }
})

