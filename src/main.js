import { createApp } from "vue";
import { createPinia } from "pinia";
import ConstructorCalculator from "./App.vue";

const AppCalc = createApp(ConstructorCalculator);

AppCalc.config.unwrapInjectedRef = true;
AppCalc.use(createPinia());
AppCalc.mount("#App_calc");
