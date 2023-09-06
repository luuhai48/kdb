/// <reference path="types.d.ts"/>

import m from 'mithril';

import Layout from './components/layout';
import Button from './components/button';
import Home from './routes/home';

import ModalStream from './streams/modal';
import ClusterStream from './streams/cluster';

// =============================================================================

window.api.on('err', (_, err) => {
  ModalStream({
    modal: {
      type: 'error',
      text: err.message || 'Something went wrong',
    },
  });
});

// =============================================================================

m.route(document.body, '/', {
  '/': {
    render: () => m(Layout, m(Home)),
  },
});

// =============================================================================

const reloadConfig = () =>
  window.api
    .invoke('k8s.reloadConfig')
    .then(({ data: { contexts, currentContext } }) => {
      ClusterStream({
        contexts: contexts.map((c) => c.cluster),
        currentContext,
      });
    })
    .catch((err) => {
      ModalStream({
        modal: {
          type: 'error',
          text: err.message || 'Something went wrong',
          closeable: false,
          buttons: [
            m(Button, {
              type: 'error',
              text: 'Try again',
              onclick: () => {
                ModalStream().modal = false;

                reloadConfig();
              },
            }),
          ],
        },
      });
    });

reloadConfig();
