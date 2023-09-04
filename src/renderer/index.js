/// <reference path="types.d.ts"/>

import m from 'mithril';

import Layout from './components/layout';
import Button from './components/button';
import Home from './routes/home';

import ModalStream from './streams/modal';

m.route(document.body, '/', {
  '/': {
    render: () => m(Layout, m(Home)),
  },
});

// =============================================================================

window.api.on('err', (_, err) => {
  ModalStream({
    modal: {
      type: 'error',
      text: err.message || 'Something went wrong',
      closeable: false,
      buttons: [
        m(Button, {
          type: 'error',
          pill: true,
          text: 'Try again',
          onclick: () => {
            window.api.send('k8s.reloadConfig');
            ModalStream().modal = false;
          },
        }),
      ],
    },
  });
});

/** @type {[key: string]: any} */
const awaits = {};

window.api.on('event', (_, args) => {
  const { channel, id, err, data } = args;

  if (!awaits[channel] || !awaits[channel][id]) return;

  const { resolve, reject } = awaits[channel][id];
  delete awaits[channel][id];

  if (err) {
    return reject(err);
  }
  return resolve(data);
});

window.api.sendAsync = async (channel, data) => {
  if (!awaits[channel]) {
    awaits[channel] = {};
  }

  const id = window.crypto.randomUUID();
  window.api.send(channel, { ...data, id });

  const result = await Promise.race([
    new Promise((resolve, reject) => {
      awaits[channel][id] = { resolve, reject };
    }),

    new Promise((_, reject) =>
      setTimeout(() => {
        delete awaits[channel][id];
        return reject(new Error(`Timeout waiting for event on "${channel}"`));
      }, 5_000),
    ),
  ]);

  return result;
};
