<template>
  <div id="app_mortgage_calculator" v-cloak>
    <div id="custom-style" class="calc calc-wrapper">
      <the-banks
        v-if="banks.length"
        :slider-options="sliderOptions"
        :banks="banks"
        @select-current-bank="selectCurrentBank"
      />
      <div class="calc__wrapper-content content">
        <div class="content__left-side">
          <div class="calc__wrapper-common-data">
            <ui-input
              label="Годовая ставка:"
              :min="outData?.interest_rate.min"
              :max="outData?.interest_rate.max"
              not-empty
              only-number
              element-name="handlerRate"
              :input-value="currentInterestRate"
              @changed-value="changeCurrentRateOnHandler"
              @change-valid="changeValid"
              v-if="isHandlerRate"
            />
          </div>
          <div class="calc__wrapper-common-data">
            <ui-input
              classes="mb5"
              label="Стоимость объекта недвижимости:"
              :inputValue="propertyPrice"
              @changedValue="changePropertyPrice"
              @changeValid="changeValid"
              element-name="propertyPrice"
              :unit="outData?.property_price?.unit || 'руб'"
              not-empty
              only-number
              :min="outData?.property_price?.min"
              :max="outData?.property_price?.max"
              is-currency
            />
            <ui-range
              :range-value="propertyPrice"
              @changedValue="changePropertyPrice"
              :min="outData?.property_price?.min"
              :max="outData?.property_price?.max"
              :step="outData?.property_price?.steps"
            >
            </ui-range>
          </div>
          <div class="calc__wrapper-common-data">
            <div class="content__min-wrapper">
              <ui-input
                classes="mb5"
                label="Первоначальный взнос:"
                element-name="downPaymentPercentage"
                :input-value="downPaymentPercentage"
                @changedValue="changeDownPaymentPercentage"
                @changeValid="changeValid"
                :min="outData?.payment_percentage?.min"
                :max="outData?.payment_percentage?.max"
                :unit="outData?.payment_percentage?.unit"
                not-empty
                only-number
                type-number
                controls
              />
              <ui-input
                classes="mb5"
                :unit="outData?.payment_currency?.unit"
                :inputValue="downPaymentCurrency"
                element-name="downPaymentCurrency"
                @changedValue="changeDownPaymentCurrency"
                @changeValid="changeValid"
                :min="outData?.payment_currency?.min"
                :max="outData?.payment_currency?.max"
                not-empty
                only-number
                is-currency
              />
            </div>
            <ui-range
              :range-value="downPaymentPercentage"
              @changedValue="changeDownPaymentPercentage"
              :min="outData?.payment_percentage?.min"
              :max="outData?.payment_percentage?.max"
              show-steps
              :step-prompt="outData?.payment_percentage?.steps"
            />
          </div>
          <div class="calc__wrapper-common-data">
            <div class="content__min-wrapper">
              <ui-input
                v-if="currentTypeTime.value === 'year'"
                label="Срок кредита:"
                :inputValue="creditTermYear"
                @changeValid="changeValid"
                @changedValue="changeCreditTermYear"
                element-name="creditTermYear"
                :max="outData?.credit_term?.max_year"
                :min="outData?.credit_term?.min_year"
                only-number
                not-empty
                is-stretch
              />
              <ui-input
                v-show="currentTypeTime.value === 'month'"
                label="Срок кредита:"
                :inputValue="creditTermMonth"
                @changeValid="changeValid"
                @changedValue="changeCreditTermMonth"
                element-name="creditTermMonth"
                :max="outData?.credit_term?.max_month"
                :min="outData?.credit_term?.min_month"
                only-number
                not-empty
                is-stretch
              />
              <ui-select
                :select-values="timeFroSelect"
                @changedValue="changeMethodChoiceTime"
                min-width="50"
                max-width="100"
              />
            </div>
          </div>
          <div v-show="typeCalculate === 'Both' && !isInvalid">
            <div class="content__min-wrapper">
              <ui-checkbox
                label="Аннуитетный"
                label-second="Дифференцированный"
                element-name="toggleTypeComputed"
                type-display-class="switcher"
                :checkboxValue="showDifferentiatedPayment"
                @changedValue="changeCheckbox"
                @change-valid="changeValid"
              />
            </div>
          </div>
        </div>

        <div class="content__right-side right-side">
          <div v-if="isInvalid" class="right-side__error-block">
            <div class="right-side__error-block-title">
              Не корректно заполнены данные. Исправьте, пожалуйста!
            </div>
          </div>
          <div v-else class="right-side__content-block">
            <div v-if="currenSelectedBank?.image" class="right-side__item">
              <div class="right-side__content">
                <img
                  :src="imageDir + currenSelectedBank.image.filename"
                  alt="Логотип банка"
                />
              </div>
            </div>

            <div v-if="currenSelectedBank?.title" class="right-side__item">
              <div class="right-side__label">Банк:</div>
              <div class="right-side__content right-side__content_little">
                {{ currenSelectedBank.title }}
              </div>
            </div>

            <div class="right-side__item">
              <div class="right-side__label">Ставка:</div>
              <div class="right-side__content">
                {{ currentInterestRate }}
              </div>
            </div>

            <div class="right-side__item">
              <div class="right-side__label">Сумма кредита:</div>
              <div class="right-side__content">{{ startCreditSumInOut }}</div>
            </div>

            <div class="right-side__item" v-if="typeCurrentCalculation === 'A'">
              <div class="right-side__label">Ежемесячный платеж:</div>
              <div class="right-side__content">{{ monthlyPaymentInOut }}</div>
            </div>

            <div class="right-side__item" v-if="typeCurrentCalculation === 'D'">
              <div class="right-side__label">Первый ежемесячный платеж:</div>
              <div class="right-side__content">
                {{ firstItemForCreditDifferentiatedPaymentInOut }}
              </div>
            </div>

            <div class="right-side__item">
              <div class="right-side__label">Начисленные проценты:</div>
              <div class="right-side__content">
                {{ overpaymentAmountInOut }}
              </div>
            </div>

            <div class="right-side__item">
              <div class="right-side__label">Долг + проценты:</div>
              <div class="right-side__content">{{ totalSumCreditInOut }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-show="!isInvalid">
        <payment-schedule
          :start-credit-sum="startCreditSum"
          :credit-term-month="amountMonth"
          :monthly-payment="monthlyPayment"
          :monthly-interest-rate="monthlyInterestRate"
          :typeCurrentCalculation="typeCurrentCalculation"
          @change-first-item-for-credit-differentiated-payment="
            changeFirstItemForCreditDifferentiatedPayment
          "
        ></payment-schedule>
      </div>
    </div>

    <teleport v-if="!isInvalid" to="#teleport-element">
      {{ resultForOut }}
    </teleport>
  </div>
</template>

<script>
import { computed } from "vue";
import TheBanks from "@/components/creditCalculatorComponents/TheBanks";
import UiInput from "@/components/UI/UiInput";
import UiRange from "@/components/UI/UiRange";
import UiSelect from "@/components/UI/UiSelect";
import PaymentSchedule from "@/components/creditCalculatorComponents/PaymentSchedule";
import UiCheckbox from "@/components/UI/UiCheckbox";

export default {
  name: "TheCreditCalculator",
  components: {
    UiCheckbox,
    TheBanks,
    UiInput,
    UiRange,
    UiSelect,
    PaymentSchedule,
  },
  async mounted() {
    const isGlobal = window.location.hostname !== "localhost";
    const localPath = "http://localhost:3000/credit-calculator";
    if (!isGlobal) {
      await fetch(localPath)
        .then((response) => response.json())
        .then((data) => {
          this.outData = data;
        });
    } else {
      this.outData = window?.dataCalculator;
    }

    this.currentInterestRate = this.outData?.interest_rate?.rate
      ? this.outData?.interest_rate?.rate
      : 0;

    this.propertyPrice = this.outData?.property_price?.cost
      ? this.outData?.property_price?.cost
      : 0;

    this.downPaymentPercentage = this.outData?.payment_percentage?.rate
      ? this.outData?.payment_percentage?.rate
      : 10;

    this.downPaymentCurrency = this.outData?.payment_currency?.cost
      ? this.outData?.payment_currency?.cost
      : 100000;

    this.creditTermYear = this.outData?.credit_term?.count_time_year
      ? this.outData?.credit_term?.count_time_year
      : 1;
    this.creditTermMonth = this.outData?.credit_term?.count_time_month
      ? this.outData?.credit_term?.count_time_month
      : 1;

    this.isHandlerRate = this.outData?.interest_rate?.is_rate
      ? this.outData?.interest_rate?.is_rate
      : false;

    this.banks = this.outData?.bank_list?.banks
      ? this.outData?.bank_list?.banks
      : [];

    this.typeCalculate = this.outData?.type_calculate
      ? this.outData?.type_calculate
      : "Both";

    this.showDifferentiatedPayment = this.typeCalculate === "D";

    this.imageDir = window?.imageDir || "";

    if (this.banks?.length) {
      this.selectCurrentBank(this.banks[0]);
    }
  },
  provide() {
    return {
      globalCanBeShownTooltip: computed(() => this.shownAllTooltips),
    };
  },
  data() {
    return {
      /**
       * Настройки слайдера
       */
      sliderOptions: {
        slidesToShow: 3,
        dots: true,
        infinite: false,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 2000,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 3,
              infinite: true,
              dots: true,
            },
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2,
            },
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
            },
          },
        ],
      },

      /**
       * Данные получаемые извне
       */
      imageDir: null,
      outData: null,
      currentInterestRate: 0, // выбранная процентная ставка
      propertyPrice: 0, //стоимость покупаемого объекта недвижимости
      downPaymentPercentage: 0, //первоначальный взнос процент
      downPaymentCurrency: 0, //первоначальный взнос валюта
      creditTermMonth: 0, //срок кредита в месяцах
      creditTermYear: 0, //срок кредита в годах
      isHandlerRate: false, // ручная годовая ставка
      banks: [],
      typeCalculate: "Both", //варианты доступных расчетов  А - аннуитет. D -дифференцированный
      shownAllTooltips: true,
      /**
       * данные высчитывающиеся на лету
       */
      currenSelectedBank: {}, // выбранный банк из списка
      errorsElements: new Set(), // список ошибок инпутов
      typeTimes: [],
      showDifferentiatedPayment: false,
      currentTypeTime: {}, // текущие единицы времени для расчета год или месяц
      firstItemForCreditDifferentiatedPayment: 0, // данные по первому дифференцированному платежу
    };
  },
  methods: {
    /**
     * Изменить выбранный банк из списка
     * @param bank
     */
    selectCurrentBank(bank) {
      this.changeCurrentRateOnHandler({ value: bank.interestRate });
      setTimeout(() => {
        this.currenSelectedBank = bank ? bank : null;
      }, 10);
    },
    /**
     * изменить годовую ставку в ручную
     * @param value
     * @param bank
     */
    changeCurrentRateOnHandler({ value }) {
      this.currenSelectedBank = null;
      try {
        if (value.toString().indexOf(".") > 0) {
          this.currentInterestRate = parseFloat(value).toFixed(2);
        } else {
          this.currentInterestRate = value;
        }
      } catch (e) {
        console.error(e.message);
      }
    },

    /**
     * изменить стоимость объекта недвижимости
     * @param price
     */
    changePropertyPrice({ value: price }) {
      this.propertyPrice = price;
    },
    /**
     * изменить процент первоначального взноса
     * @param paymentPercent
     */
    changeDownPaymentPercentage({ value: paymentPercent }) {
      this.downPaymentPercentage = paymentPercent;
    },
    /**
     * изменить сумму первоначального взноса
     * @param paymentCurrency
     */
    changeDownPaymentCurrency({ value: paymentCurrency }) {
      this.downPaymentCurrency = paymentCurrency;
    },
    /**
     * изменить срок кредита
     * @param creditTerm
     */
    changeCreditTermMonth({ value: creditTerm }) {
      this.creditTermMonth = creditTerm;
    },
    /**
     * изменить срок кредита
     * @param creditTerm
     */
    changeCreditTermYear({ value: creditTerm }) {
      this.creditTermYear = creditTerm;
    },
    /**
     *
     * @param error
     * @param name
     */
    changeValid({ error, name }) {
      if (error) {
        this.errorsElements.add(name);
      } else {
        if (this.errorsElements.has(name)) this.errorsElements.delete(name);
      }

      this.checkEnabledResultButton();
    },
    /**
     * Округлить дробное число
     * @param value
     * @param factor
     * @returns {number}
     */
    aroundCeil(value, factor = 100) {
      return Math.ceil(value * factor) / factor;
    },
    /**
     * выбор единицы измерения срока кредита
     * @param item
     */
    changeMethodChoiceTime({ value: item }) {
      this.currentTypeTime = item;
    },
    /**
     * изменить первый данные о первом взносе по дифференцированному варианту оплаты
     * @param item
     */
    changeFirstItemForCreditDifferentiatedPayment(item) {
      this.firstItemForCreditDifferentiatedPayment = item;
    },
    changeCheckbox({ value: checkbox }) {
      this.showDifferentiatedPayment = checkbox;
    },
    /*
    Разрешаем отправку формы
     */
    checkEnabledResultButton() {
      if (this.submitSend !== null && this.submitSend !== undefined) {
        this.submitSend.disabled = Boolean(this.errorsElements.size);
      }
    },
  },
  watch: {
    propertyPrice() {
      this.downPaymentCurrency = Math.ceil(
        this.propertyPrice -
          (this.propertyPrice / 100) * (100 - this.downPaymentPercentage)
      );
    },
    downPaymentPercentage() {
      this.downPaymentCurrency = Math.ceil(
        (parseFloat(this.propertyPrice) / 100) *
          parseFloat(this.downPaymentPercentage)
      );
    },
    downPaymentCurrency() {
      this.downPaymentPercentage = Math.ceil(
        this.downPaymentCurrency / (parseFloat(this.propertyPrice) / 100)
      );
    },
  },
  computed: {
    submitSend() {
      return document.querySelector("#send-result");
    },
    timeFroSelect() {
      let t1 = parseInt(this.creditTermYear) % 10;
      let t2 = parseInt(this.creditTermYear) % 100;

      let yearName =
        t1 === 1 && t2 !== 11
          ? "Год"
          : t1 >= 2 && t1 <= 4 && (t2 < 10 || t2 >= 20)
          ? "Года"
          : "Лет";

      return [
        {
          selectName: "Мес",
          value: "month",
        },
        {
          selectName: yearName,
          value: "year",
        },
      ];
    },
    /**
     *  // тип отображаемого варианта расчета А - аннуитет. D -дифференцированный
     */
    typeCurrentCalculation() {
      return this.showDifferentiatedPayment ? "D" : "A";
    },
    /**
     * срок кредита в месяцах
     * @returns {number}
     */
    amountMonth() {
      if (this.currentTypeTime.value === "year") {
        return parseFloat(this.creditTermYear) * 12;
      }
      return parseFloat(this.creditTermMonth);
    },
    /**
     * месячная ставка исходя из годовой
     * @returns {number}
     */
    monthlyInterestRate() {
      return this.aroundCeil(this.currentInterestRate / 12 / 100, 10000);
    },
    /**
     * общая ставка
     * @returns {number}
     */
    totalRate() {
      return Math.pow(1 + this.monthlyInterestRate, this.amountMonth);
    },
    /**
     * ежемесячный платеж
     * @returns {number}
     */
    monthlyPayment() {
      const top = this.totalRate * this.monthlyInterestRate;
      const bottom = this.totalRate - 1;

      return this.aroundCeil(this.startCreditSum * (top / bottom));
    },
    monthlyPaymentInOut() {
      return this.monthlyPayment.toLocaleString("ru");
    },

    /**
     * сумма переплаты (начисленные проценты)
     */
    overpaymentAmount() {
      return this.aroundCeil(this.totalSumCredit - this.startCreditSum);
    },
    overpaymentAmountInOut() {
      return this.overpaymentAmount.toLocaleString("ru");
    },

    /**
     * начальная сумма кредита
     * @returns {number}
     */
    startCreditSum() {
      return this.aroundCeil(this.propertyPrice - this.downPaymentCurrency);
    },
    startCreditSumInOut() {
      return this.startCreditSum.toLocaleString("ru");
    },
    /**
     * общая сумма кредита (долг + проценты)
     * @returns {number}
     */
    totalSumCredit() {
      return this.aroundCeil(this.monthlyPayment * this.amountMonth);
    },
    totalSumCreditInOut() {
      return this.totalSumCredit.toLocaleString("ru");
    },

    /**
     * вывод данных о первом взносе по дифференцированному варианту оплаты
     * @returns {(function(): number)|*}
     */
    firstItemForCreditDifferentiatedPaymentInOut() {
      return this.firstItemForCreditDifferentiatedPayment.monthlyPayment;
    },

    /**
     * есть не валидный инпут
     * @returns {boolean}
     */
    isInvalid() {
      return Boolean(this.errorsElements.size);
    },
    resultForOut() {
      let currentTerm =
        this.currentTypeTime.value === "year"
          ? this.creditTermYear
          : this.creditTermMonth;
      let textForBank = this.currenSelectedBank
        ? "Банк: " + this.currenSelectedBank?.title
        : "";
      return (
        textForBank +
        "\n Ставка: " +
        this.currentInterestRate +
        "\n Сумма кредита: " +
        this.startCreditSumInOut +
        "\n Стоимость объекта недвижимости: " +
        this.propertyPrice +
        "\n Первоначальный взнос: " +
        this.downPaymentCurrency +
        "\n Срок кредита: " +
        +currentTerm +
        " " +
        this.currentTypeTime.selectName +
        "\n Начисленные проценты:" +
        this.overpaymentAmountInOut +
        "\n Долг + проценты: " +
        this.totalSumCreditInOut
      );
    },
  },
};
</script>

<style lang="scss">
//normal orange - FF5D2B
//normal dark- 464657
//hover orange - FF7044
//hover dark- 5A5A70
//font - 00000
//серый - CCCCCC
// border - E6E6E6 -
// background - F2F2F2

$color-dark-normal: #464657;
$color-orange-normal: #ff5d2b;

$color-dark-hover: #5a5a70;
$color-orange-hover: #ff7044;

$color-danger: #ff4444;

$color-black: #000000;
$color-white: #ffffff;

$color-gray-light: #f2f2f2;
$color-gray-middle: #e6e6e6;
$color-gray-dark: #cccccc;

$border-radius: 4px;

@mixin style-border {
  border: 1px solid $color-gray-middle;
  border-radius: $border-radius;
}

@mixin style-border-hover {
  border: 1px solid $color-gray-dark;
}

@mixin style-button {
  color: $color-white;
  cursor: pointer;
  background-color: $color-dark-normal;
  @include style-flex-center;
  @include style-border;
}

@mixin style-button-hover {
  background-color: $color-dark-hover;
  box-shadow: 0 0 3px 1px $color-gray-dark;
}

@mixin style-flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin style-flex-start {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

@mixin style-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

#app_mortgage_calculator {
  margin: 0 auto;
  background-color: $color-gray-light;
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
  * {
    box-sizing: border-box;
  }
}

#app_mortgage_calculator {
  .calc {
    .mb5 {
      margin-bottom: 5px;
    }
    //-------------------Стили слайдера-----
    &-slider {
      padding: 0 45px;
      margin: 10px 0 20px;
      .slick-list {
        display: flex;
        .slick-track {
          display: flex;
        }
      }
      &__item {
        @include style-flex-center;
        flex-direction: column;
        background-color: $color-gray-dark;
        margin: 0 5px;
        padding: 1px;
        cursor: pointer;
        width: 100%;
        max-width: calc(100% / 3);
        @include style-border;
        &:hover {
          @include style-border-hover;
        }
      }
      &__wrapper-img {
        @include style-flex-center;
        max-height: 150px;
      }
      &__img {
        @include style-img;
      }
      &__wrapper-title {
        @include style-flex-center;
        border-top: 1px solid #e6e6e6;
        width: 100%;
        padding: 5px;
        display: flex;
        justify-content: center;
        align-items: initial;
        flex-direction: column;
        margin-top: auto;
      }
      &__title {
        color: $color-dark-normal;
        padding: 5px;
      }
      &__interest-rate {
        flex: 0 0 auto;
        padding: 5px;
        background-color: $color-orange-normal;
        height: 100%;
        margin-left: 5px;
        font-size: 20px;
        color: $color-gray-light;
        @include style-flex-center;
        border-radius: $border-radius;
        max-height: 35px;
      }

      .slick {
        &-next,
        &-prev {
          font-size: 0;
          line-height: 0;
          position: absolute;
          top: 50%;
          display: block;
          width: 40px;
          height: 40px;
          padding: 0;
          -webkit-transform: translate(0, -50%);
          -ms-transform: translate(0, -50%);
          transform: translate(0, -50%);
          border: none;
          outline: none;
          @include style-button;
          &:hover {
            @include style-button-hover;
          }
          &.slick-disabled {
            background-color: $color-dark-hover;
            opacity: 0.8;
            cursor: default;
            @include style-button-hover;
          }
          &:before {
            position: absolute;
            width: 100%;
            height: 100%;
            font-size: 25px;
            @include style-flex-center;
          }
        }

        &-next {
          right: 0;
          &:before {
            content: ">";
          }
        }
        &-prev {
          left: 0;
          &:before {
            content: "<";
          }
        }
        &-dots {
          margin-top: 2px;
          @include style-flex-center;
          list-style: none;
          padding-left: 0;

          .slick-active {
            @include style-button-hover;
          }
          button {
            @include style-button;
            background-color: $color-dark-normal;
            line-height: 0;
            font-size: 0;
            height: 17px;
            width: 17px;
          }
        }
      }
    }
    //----------контент-------

    &__wrapper {
      &-content {
        display: flex;
        align-items: flex-start;
        @media all and (max-width: 800px) {
          flex-direction: column;
          width: 100%;
        }
      }
      &-common-data {
        margin-bottom: 20px;
        padding-left: 20px;
        border-left: 3px solid $color-orange-normal;
        .calc__wrapper-group-data {
          border: none;
        }
      }
    }

    .content {
      &__left-side {
        display: flex;
        flex: 0 0 auto;
        flex-direction: column;
        @media all and (max-width: 800px) {
          flex-direction: column;
          width: 100%;
        }
      }
      &__min-wrapper {
        @include style-flex-start;
        align-items: flex-end;
      }

      &__right-side {
        flex: 1 1 100%;
        @include style-flex-center;
        flex-direction: column;
        padding: 15px;
        @media all and (max-width: 800px) {
          width: 100%;
        }

        .right-side {
          &__error-block-title {
            color: $color-orange-normal;
            font-size: 30px;
          }
          &__content-block {
            display: flex;
            flex-direction: column;
            width: 100%;
          }

          &__item {
            @include style-flex-center;
            justify-content: space-between;
            padding: 10px;
            @media all and (max-width: 900px) {
              flex-direction: column;
            }
            @media all and (max-width: 800px) {
              flex-direction: row;
            }
          }
          &__label {
            font-size: 18px;
            color: $color-dark-normal;
            text-align: start;
          }
          &__content {
            color: $color-gray-dark;
            font-size: 30px;
            img {
              @include style-img;
              max-height: 150px;
            }
            &_little {
              font-size: 20px;
            }
          }
        }
      }
    }

    &__title {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 10px;
      display: flex;
    }
    &__toggle-btn {
      font-weight: 600;
      @include style-flex-center;
      @include style-button;
      padding: 10px;
      &:hover {
        @include style-button-hover;
        @include style-border-hover;
      }
    }

    //----------таблица------------
    &__table-payment {
      width: 100%;
      &-show {
        @include style-button;
        padding: 10px;
        margin-top: 10px;
        &:hover {
          @include style-button-hover;
          @include style-border-hover;
        }
      }
      &-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        max-height: 500px;
        overflow-y: auto;
        border-top: 1px solid $color-dark-normal;
      }
      &-tr {
        &_sticky {
          position: sticky;
          top: 0;
          background-color: $color-gray-dark;
        }
        &:hover {
          background-color: $color-gray-middle;
        }
      }
      &-th {
        border-bottom: 1px solid $color-gray-dark;
        padding: 5px 0;
        border-right: 1px solid $color-gray-light;
      }
      &-td {
        border-bottom: 1px solid $color-gray-dark;
        padding: 5px 0;
        color: $color-dark-normal;
        border-right: 1px solid $color-gray-dark;
      }
    }
  }
}
</style>
