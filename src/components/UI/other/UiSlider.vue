<script setup>
import { nextTick, ref, reactive } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Zoom } from "swiper";
import 'swiper/scss';
import 'swiper/scss/navigation'
import 'swiper/scss/pagination'
import 'swiper/scss/zoom'
import 'swiper/scss/scrollbar'
import 'swiper/scss/thumbs'


const modules = [Navigation, Pagination, Zoom];

const props = defineProps({
  zoom: {
    type: Boolean,
    default: true
  },
  navigation: {
    type: Boolean,
    default: true
  },
  autoHeight: {
    type: Boolean,
    default: true
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  speed: {
    type: [Number, String],
    default: 400
  }
})


const images = ref([
  {
    img:'https://abc-decor.com/img/interior_previews/41/width_l_3.png',
    title: "Заголовок картинки 1",
  },
  {
    img:'https://abc-decor.com/img/gallery/4/thumbs/thumb_m_9994.jpg',
    title: "Заголовок картинки 2",
  },
  {
    img:'https://abc-decor.com/img/interior_previews/41/sq_l_2.png',
    title: "Заголовок картинки 3",
  },
  {
    img:'https://abc-decor.com/img/gallery/4/thumbs/thumb_m_31039.jpg',
    title: "Заголовок картинки 4",
  },
  {
    img:'https://abc-decor.com/img/gallery/4/thumbs/thumb_m_5811.jpg',
    title: "Заголовок картинки 5",
  },
])

/**
 * type: bullets | progressbar | fraction
 */
const pagination = ref({
  clickable: true,
  type: 'bullets'
})


</script>

<template>
  <div class="calc__wrapper-group-data">
    <div>
      <swiper
        class="calc__swiper"
        :modules="modules"
        :pagination="pagination"
        :navigation="navigation"
        :zoom="zoom"
        :auto-height="autoHeight"
        :speed="speed"
        :autoplay="autoplay"
        :loop="true"
        :lazy="true"
        :round-lengths="true"
        :centered-slides="true"
        :lazy-preload-prev-next="3"
        :loop-prevents-sliding="true"
      >
        <swiper-slide v-for="image in images">
          <p>{{image.title}}</p>
          <div class="swiper-zoom-container">
            <img :src="image.img" :alt="image.title">
          </div>
        </swiper-slide>
      </swiper>
    </div>


  </div>
</template>

<style lang="scss">

</style>


