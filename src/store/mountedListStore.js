import {defineStore} from "pinia";


export const useMountedListStore = defineStore('mountedList', {
    state: () => ({
        mountedList: {},
    }),
    getters: {
        appIsMounted: ({ mountedList }) => Object.values(mountedList).every(value => value),
    },
    actions: {
        toggleElementIsMounted(name, flag) {
            this.mountedList[name] = flag;
        },
        deleteElementInMountedList(name) {
            if (name in this.mountedList) {
                delete this.mountedList[name];
            }
        },
    }
})