import { createRouter, createWebHashHistory } from "vue-router";
import TheMain from "@/templates/TheMain.vue";
import TheCreditCalculator from "@/templates/TheCreditCalculator";
import TheStretchCeilingCalculator from "@/templates/TheStretchCeilingCalculator";

const routes = [
  { path: "/", component: TheMain, name: "Главная" },
  { path: "/credit", component: TheCreditCalculator, name: "Кредитный" },
  {
    path: "/stretch",
    component: TheStretchCeilingCalculator,
    name: "Натяжные потолки",
  },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
