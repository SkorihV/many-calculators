export default {
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
     * @param year
     * @returns {number}
     */
    getCurrentDayInYear(year) {
      return (new Date(year, 11, 31) - new Date(year, 0, 0)) / 86400000;
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
  },
};
