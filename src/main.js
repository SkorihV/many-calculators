import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import store from "@/store/store";

const AppCalc = createApp(App);
AppCalc.config.unwrapInjectedRef = true;
AppCalc.use(router);
AppCalc.use(store);
AppCalc.mount("#App");
