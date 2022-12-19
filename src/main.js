import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";


const AppCalc = createApp(App);

AppCalc.config.unwrapInjectedRef = true;
AppCalc.use(createPinia());
AppCalc.mount("#App");
