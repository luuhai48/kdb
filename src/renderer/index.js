/// <reference path="types.d.ts"/>

import m from 'mithril';

import Layout from './components/layout';
import Button from './components/button';
import Home from './routes/home';

import ModalStream from './streams/modal';
import LoadingStream from './streams/loading';
import ClusterStream from './streams/cluster';
import NamespaceStream from './streams/namespace';

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

window.reloadConfig = async () => {
  LoadingStream(true);

  ClusterStream({
    contexts: [],
    currentContext: '',
    currentNamespace: 'default',
  });
  NamespaceStream([]);

  const { err, data } = await window.api.invoke('k8s.reloadConfig');

  if (err) {
    LoadingStream(false);

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
            window.reloadConfig();
          },
        }),
      ],
    });
    return;
  }

  const { contexts, currentContext } = data;

  const currentContextObj = contexts.find((c) => c.cluster === currentContext);

  ClusterStream({
    contexts: contexts.map((c) => c.cluster),
    currentContext,
    currentNamespace: currentContextObj?.namespace || 'default',
  });

  const { err: namespaceErr, data: namespaces } =
    await window.api.invoke('k8s.getNamespaces');

  if (namespaceErr) {
    LoadingStream(false);

    ModalStream({
      type: 'error',
      text: err.message || 'Something went wrong',
      closeable: false,
      buttons: [
        m(Button, {
          type: 'error',
          text: 'Try again',
          onclick: () => {
            LoadingStream(false);
            ModalStream(false);
            window.reloadConfig();
          },
        }),
      ],
    });
    return;
  }

  NamespaceStream(namespaces);

  LoadingStream(false);
};
window.reloadConfig();
