import m from 'mithril';
import hljs from 'highlight.js';

import ModalStream from './streams/modal';
import LoadingStream from './streams/loading';

import Button from './components/button';

window.utils = {
  /**
   * Translates time into human readable format of seconds, minutes, hours, days, and years
   *
   * @param  {number|string|Date} milliseconds The number of milliseconds in number or string, or a Date
   * @return {string} The phrase describing the amount of time
   */
  forHumans(milliseconds) {
    if (milliseconds === undefined || milliseconds === null) return '';

    if (typeof milliseconds === 'string') {
      try {
        milliseconds = Date.parse(milliseconds);
      } catch {
        return '';
      }
    }

    if (milliseconds instanceof Date) {
      milliseconds = milliseconds.getTime();
    }

    milliseconds = Date.now() - milliseconds;

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

  /**
   * Highlight using highlight.js
   * @param {string} text
   * @param {string} language
   * @returns
   */
  highlight(text, language) {
    return hljs.highlight(text, { language }).value;
  },
};

window.invoke = async (channel, ...args) => {
  const result = await window.api.invoke(channel, ...args);
  LoadingStream(false);

  if (!(result instanceof Object && 'error' in result)) {
    return result;
  }

  const modalData = {
    type: 'error',
    text: result.error,
  };
  if (!result.code || result.code === 500) {
    modalData.closeable = false;
    modalData.buttons = [
      m(Button, {
        type: 'error',
        class: 'mt-4',
        text: 'Try again',
        onclick: () => {
          ModalStream(false);
          window.reloadConfig();
        },
      }),
    ];
  }

  ModalStream(modalData);
};

window.api.on('err', (_, err) => {
  const modalData = {
    type: 'error',
    text: err.error,
  };
  if (!err.code || err.code === 500) {
    modalData.closeable = false;
    modalData.buttons = [
      m(Button, {
        type: 'error',
        class: 'mt-4',
        text: 'Try again',
        onclick: () => {
          ModalStream(false);
          window.reloadConfig();
        },
      }),
    ];
  }

  ModalStream(modalData);
});
