<script>
const typeElement = "UiSlider";
</script>

<script setup>
import { computed, onUnmounted, reactive, ref, toRef } from "vue";

import {useBaseStore} from "@/store/baseStore";
import {storeToRefs} from "pinia";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Zoom, Controller, Autoplay, Thumbs } from "swiper";

import 'swiper/scss';
import 'swiper/scss/navigation'
import 'swiper/scss/pagination'
import 'swiper/scss/zoom'
import 'swiper/scss/scrollbar'
import 'swiper/scss/thumbs'

import { propsTemplate } from "@/servises/UsePropsTemplatesSingle";
import { useLocalDependencyList } from "@/composables/useLocalDependencyList";
import { useProcessingFormula } from "@/composables/useProcessingFormula";
import { useDisplayComponents } from "@/composables/useDisplayComponents";
import { useDisplaySpinner } from "@/composables/useDisplaySpinner";

import { isBoolean } from "@/validators/validators";
import devBlock from "@/components/UI/devMode/devBlock/devBlock.vue"
import { checkedValueOnVoid } from "@/servises/UtilityServices";

const baseStore = useBaseStore()
const {getImageDir} = storeToRefs(baseStore)

const props = defineProps({
  images: {
    type: Array,
    require: true,
    default: () => []
  },
  isZoom: {
    type: [Boolean, Number],
    default: false,
    validator: isBoolean
  },
  isNavigation: {
    type: [Boolean, Number],
    default: true,
    validator: isBoolean
  },
  /**
   * type: no | bullets | progressbar | fraction
   */
  paginationType: {
    type: String,
    default: 'no',
  },
  isAutoHeight: {
    type: [Boolean, Number],
    default: false,
    validator: isBoolean
  },
  isAutoplay: {
    type: [Boolean, Number],
    default: false,
    validator: isBoolean
  },
  /**
   * пауза перед автоматическим пролистыванием
   */
  delay: {
    type: [Number, String],
    default: 5000
  },
  isThumbs: {
    type: [Boolean, Number],
    default: false,
    validator: isBoolean
  },
  ...propsTemplate.getProps([
    "classes",
    "label",
    "maxHeight",
    "elementName",
    "templateName",
    "parentIsShow",
    "dependencyFormulaDisplay",
  ]),
})

const modulesMain = [Navigation, Pagination, Zoom, Controller, Autoplay, Thumbs];
const modulesThumbs = [ Controller];
/**
 * скорость смены слайдера
 */
const speed = 500
const zoomData = {
  maxRatio: 5,
  minRatio: 1
}
const navigationData = {
  nextEl: '.calc__swiper-button-next',
  prevEl: '.calc__swiper-button-prev',
  disabledClass: 'calc__swiper-button_disabled',
}
const autoplayData = ref({
  pauseOnMouseEnter: true,
  delay: props.delay
})
const breakpoints = {
  320: {
    slidesPerView: 2,
    spaceBetween: 10
  },
  480: {
    slidesPerView: 3,
    spaceBetween: 15
  },
  640: {
    slidesPerView: 4,
    spaceBetween: 20
  }
}
const firstSwiper = ref(null)
const secondSwiper = ref(null)
const isPagination = ref(props.paginationType !== 'no')
/**
 * type: bullets | progressbar | fraction
 */
const paginationData = ref({
  clickable: true,
  el: '.calc__swiper-pagination',
  bulletClass: 'calc__swiper-pagination-bullet',
  bulletActiveClass: 'calc__swiper-pagination-bullet_active',
  type: props.paginationType
})

const isLabel = ref(Boolean(props?.label?.toString()?.length))

const localImagesListUrl = computed(() => {
  return props.images?.map(data => {
    let filename = data?.image?.filename
    let isPath = Boolean(filename?.length)

    return isPath
      ? getImageDir.value + filename
      : "";
  })
})

const localHeight = computed(() => {
  return props.maxHeight >= 100 ? props.maxHeight : null
})

const localElementName = computed(()=> {
  return checkedValueOnVoid(props.elementName)
    ? props.elementName
    : Math.random().toString();
})

const { localDependencyList, constructLocalListElementDependencyInFormula } =
  useLocalDependencyList();

const { isVisibilityFromDependency, formulaAfterProcessingVariables } =
  useProcessingFormula(
    reactive({
      localDependencyList: localDependencyList,
      constructLocalListElementDependencyInFormula,
      parentIsShow: toRef(props, "parentIsShow"),
      formula: toRef(props, "dependencyFormulaDisplay"),
    })
  );
useDisplayComponents(props.elementName, isVisibilityFromDependency, typeElement)
useDisplaySpinner(props.elementName);
onUnmounted(() => {
  baseStore?.tryDeleteAllDataOnStoreForElementName(props.elementName);
});

const setFirstSwiper = (swiper) => {
  firstSwiper.value = swiper
};
const setSecondSwiper = (swiper) => {
  secondSwiper.value = swiper
};

function next(swiper) {
  clickedSwiperFirst(swiper)
}
function prev(swiper) {
  clickedSwiperFirst(swiper)
}
function clickedSwiperFirst(swiper) {
  secondSwiper.value?.slideTo(swiper.activeIndex)
}
function clickedSwiperSecond(swiper) {
  firstSwiper.value?.slideTo(swiper.clickedIndex)
}
</script>

<template>
  <div class="calc__wrapper-group-data"  :class="classes"
    v-if="isVisibilityFromDependency"
       :id="localElementName"
  >
      <div
        class="calc__swiper-label-wrapper"
        v-if="isLabel"
      >
        {{label}}
      </div>
      <swiper
        class="calc__swiper"
        :modules="modulesMain"
        :pagination="isPagination ? paginationData : false"
        :navigation="isNavigation ? navigationData : false"
        :zoom="isZoom ? zoomData : false"
        :auto-height="isAutoHeight"
        :autoplay="isAutoplay ? autoplayData : false"
        :speed="speed"
        :watch-overflow="true"
        :watch-slides-progress="true"
        :centered-slides="true"

        @swiper="setFirstSwiper"
        @navigation-next="next"
        @navigation-prev="prev"
        @slideChange="clickedSwiperFirst"
      >
        <swiper-slide v-for="url in localImagesListUrl">
          <div :class="{'swiper-zoom-container': isZoom}" :style="{maxHeight: localHeight + 'px'}">
            <img :src="url" loading="lazy" :height="localHeight" :style="{maxHeight: localHeight + 'px'}">
          </div>
        </swiper-slide>
        <div v-if="isPagination" class="calc__swiper-pagination" slot="paginationData"></div>
        <template v-if="isNavigation">
          <div class="calc__swiper-button-next"></div>
          <div class="calc__swiper-button-prev"></div>
        </template>
      </swiper>
      <swiper
        v-if="isThumbs"
        class="calc__swiper calc__swiper-thumb"
        :modules="modulesThumbs"
        :speed="speed"
        :breakpoints="breakpoints"
        :centered-slides="true"
        :slidesPerView="6"
        @swiper="setSecondSwiper"
        @click="clickedSwiperSecond"
      >
        <swiper-slide v-for="url in localImagesListUrl">
          <div class="calc__swiper-thumb__image">
            <img :src="url" loading="lazy">
          </div>
        </swiper-slide>
      </swiper>

  </div>
  <dev-block
    hidden-value
    hidden-cost
    :label="label || elementName"
    :type-element="typeElement"
    :element-name="elementName"
    :is-visibility-from-dependency="isVisibilityFromDependency"
    :dependency-formula-display="dependencyFormulaDisplay"
  />
</template>


