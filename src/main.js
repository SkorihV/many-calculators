import {createPinia} from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import store from "@/store/store";

const AppCalc = createApp(App);

AppCalc.config.unwrapInjectedRef = true;
AppCalc.use(store);
AppCalc.use(createPinia());
AppCalc.mount("#App");
