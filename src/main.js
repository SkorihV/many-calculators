import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";

const AppCalc = createApp(App);
AppCalc.config.unwrapInjectedRef = true;
AppCalc.use(router);
AppCalc.mount("#App");
