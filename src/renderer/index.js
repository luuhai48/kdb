/// <reference path="types.d.ts"/>

import m from 'mithril';

import Layout from './components/layout';
import Button from './components/button';
import Home from './routes/home';

import ModalStream from './streams/modal';
import ClusterStream from './streams/cluster';
import LoadingStream from './streams/loading';

// =============================================================================

window.api.on('err', (_, err) => {
  ModalStream({
    type: 'error',
    text: err.message || 'Something went wrong',
  });
});

// =============================================================================

m.route(document.body, '/', {
  '/': {
    render: () => m(Layout, m(Home)),
  },
});

// =============================================================================

(async function reloadConfig() {
  LoadingStream(true);

  const { err, data } = await window.api.invoke('k8s.reloadConfig');

  if (err) {
    ModalStream({
      type: 'error',
      text: err.message || 'Something went wrong',
      closeable: false,
      buttons: [
        m(Button, {
          type: 'error',
          text: 'Try again',
          onclick: () => {
            ModalStream(false);

            reloadConfig();
          },
        }),
      ],
    });
    return;
  }

  const { contexts, currentContext } = data;

  ClusterStream({
    contexts: contexts.map((c) => c.cluster),
    currentContext,
  });

  LoadingStream(false);
})();
