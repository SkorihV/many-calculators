import { createRouter, createWebHashHistory } from "vue-router";
import TheMain from "@/templates/TheMain.vue";
import TheCreditCalculator from "@/templates/TheCreditCalculator";
import TheStretchCeilingCalculator from "@/templates/TheStretchCeilingCalculator";
import TheCleaningCalculator from "@/templates/TheCleaningCalculator";
import TheBaseCalculator from "@/templates/TheBaseCalculator";

const routes = [
  { path: "/", component: TheMain, name: "Главная" },
  { path: "/credit", component: TheCreditCalculator, name: "Кредитный" },
  {
    path: "/stretch",
    component: TheStretchCeilingCalculator,
    name: "Натяжные потолки",
  },
  {
    path: "/cleaning1",
    component: TheCleaningCalculator,
    name: "Калькулятор уборки",
  },
  {
    path: "/base",
    component: TheBaseCalculator,
    name: "Калькулятор фундамента",
  },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
