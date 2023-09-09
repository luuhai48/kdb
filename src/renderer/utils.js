window.utils = {
  /**
   * Translates milliseconds into human readable format of seconds, minutes, hours, days, and years
   *
   * @param  {number} milliseconds The number of seconds to be processed
   * @return {string} The phrase describing the amount of time
   */
  forHumans(milliseconds) {
    let temp = Math.floor(milliseconds / 1000);
    const years = Math.floor(temp / 31536000);
    if (years) {
      return years + 'y';
    }
    const days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
      return days + 'd';
    }
    const hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
      return hours + 'h';
    }
    const minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
      return minutes + 'm';
    }
    const seconds = temp % 60;
    if (seconds) {
      return seconds + 's';
    }
    return 'Just now';
  },
};
