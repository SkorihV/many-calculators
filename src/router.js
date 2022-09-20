import { createRouter, createWebHashHistory } from "vue-router";
import TheMain from "@/templates/TheMain.vue";
import TheCreditCalculator from "@/templates/TheCreditCalculator";

const routes = [
  { path: "/", component: TheMain, name: "Главная" },
  { path: "/credit", component: TheCreditCalculator, name: "Кредитный" },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
