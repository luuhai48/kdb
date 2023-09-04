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
