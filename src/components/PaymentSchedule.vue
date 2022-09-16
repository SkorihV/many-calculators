<template></template>

<script>
// расчеты тут https://mobile-testing.ru/loancalc/rachet_dosrochnogo_pogashenia/

export default {
  name: "PaymentSchedule",
  props: {
    principalAmount: {
      // сумма основного долга
      type: Number,
      default: null,
    },
    currenInterestRate: {
      // текущая процентная ставка
      type: Number,
      default: null,
    },
    startDate: {
      // дата начала расчета
      type: Number,
      default: Date.now(),
    },
    creditTermMonth: {
      type: Number, // срок кредита в месяцах
    },
  },
  methods: {
    /**
     * получить объект с данными о дне
     * @param timeStamp
     * @returns {{month: number, year: number, day: number}}
     */
    getDataDayInTimeStamp(timeStamp) {
      const newDate = new Date(timeStamp);
      const day = newDate.getDate();
      const month = newDate.getMonth();
      const year = newDate.getFullYear();
      return { year, month, day };
    },
    /**
     * получить timestamp из объекта дня
     * @param date
     * @returns {number}
     */
    getTimeStampInDate(date) {
      const time = new Date(date.year, date.month, date.day);
      return time.getTime();
    },
    /**
     * количество дней в году из timestamp
     * @param timestamp
     * @returns {number}
     */
    getCurrentDayInYear(timestamp) {
      const { year, month, day } = this.getDataDayInTimeStamp(timestamp);
      return (new Date(year, month, day) - new Date(year, 0, 0)) / 86400000;
    },

    /**
     * количество дней между двумя датами timestamp
     * @param firstDay
     * @param lastDay
     * @returns {number}
     */
    getDifferenceDays(firstDay, lastDay) {
      return Math.abs((firstDay - lastDay) / 86400000);
    },

    /**
     * получить количество дней в месяце
     * @param month
     * @param year
     * @returns {number}
     */
    getDaysInMonth(month, year = null) {
      if (year === null) {
        let currentDate = this.getDataDayInTimeStamp(Date.now());
        year = currentDate.year;
      }
      return new Date(year, month + 1, 0).getDate();
    },

    /**
     * получить номер следующего месяца
     * @param month
     * @returns {number}
     */
    getNextMonth(month) {
      let nextMonth = month;
      if (nextMonth === 11) {
        nextMonth = 0;
      } else {
        nextMonth++;
      }
      return nextMonth;
    },

    /**
     * получить первый день следующего месяца исходя из начальной даты
     * если 1 число, то первое число, если 22, то 22.
     * Если в текущем месяце дней больше чем в следующем, то первое
     * Если в текущем месяце дней меньше чем в следующем, то первое
     * @param timestamp
     */
    getFirstDayNextMonth(timestamp) {
      let { oldYear, oldMonth, oldDay } = this.getDataDayInTimeStamp(timestamp);
      let month = this.getNextMonth(oldMonth);
      let year = oldYear;
      let day = oldDay;
      let daysInCurrentMonth = this.getDaysInMonth(oldMonth, oldYear);
      let daysInNextMonth = this.getDaysInMonth(month, year);
      if (month === 0) {
        month++;
      }

      if (oldDay === 1) {
        return this.getTimeStampInDate({ year, month, day });
      }
    },

    /**
     * проценты по кредиту за указанный промежуток времени
     */
    getLoanInterestInMonth(firstDay, lastDay) {
      return (
        (this.principalAmount *
          this.currenInterestRate *
          this.getDifferenceDays(firstDay, lastDay)) /
        (100 * this.getCurrentDayInYear(firstDay))
      );
    },

    /**
     * Получаем один или два промежутка дней в текущем периоде оплаты.
     * Если первый день месяца, то будет один промежуток, если нет, то два.
     */
    datesInTheCurrentDueDate(stamp) {
      let { year, month, day } = this.getDataDayInTimeStamp(stamp);
      let firstDay = 1;

      let nextMonth = this.getNextMonth(month);
      let nextYear = year;
      if (nextMonth === 0) {
        nextYear++;
      }

      let dayInMonth = this.getDaysInMonth(month, year);

      if (day === 1) {
        return [
          {
            firstDay: stamp,
            lastDay: this.getTimeStampInDate({ year, month, dayInMonth }),
          },
        ];
      } else {
        return [
          {
            firstDay: stamp,
            lastDay: this.getTimeStampInDate({ year, month, dayInMonth }),
          },
          {
            firstDay: this.getTimeStampInDate({
              nextYear,
              nextMonth,
              firstDay,
            }),
            lastDay: this.getTimeStampInDate({ nextYear, nextMonth, day }),
          },
        ];
      }
    },
  },
  computed: {
    dataListForCredit() {
      let creditList = [];
      let localPrincipalAmount = this.principalAmount;
      let start = this.startDate;

      for (let i = 0; i < this.creditTermMonth; i++) {
        this.datesInTheCurrentDueDate(start);
      }
    },
  },
};
</script>

<style scoped></style>
