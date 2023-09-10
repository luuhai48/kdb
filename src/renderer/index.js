/// <reference path="types.d.ts"/>

import m from 'mithril';

import './utils';

import Layout from './components/layout';
import Home from './routes/home';
import Secrets from './routes/secrets';
import Pods from './routes/pods';

import LoadingStream from './streams/loading';
import ClusterStream from './streams/cluster';
import NamespaceStream from './streams/namespace';
import AppStream from './streams/app';

// =============================================================================

m.route(document.body, '/', {
  '/': {
    render: () => m(Layout, m(Home)),
  },
  '/secrets': {
    render: () => m(Layout, m(Secrets)),
  },
  '/pods': {
    render: () => m(Layout, m(Pods)),
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

  const data = await window.invoke('k8s.reloadConfig');
  if (!data) return;

  const { contexts, currentContext } = data;

  const currentContextObj = contexts.find((c) => c.cluster === currentContext);

  ClusterStream({
    contexts: contexts.map((c) => c.name),
    currentContext,
    currentNamespace: currentContextObj?.namespace || 'default',
  });

  const namespaces = await window.invoke('k8s.getNamespaces');
  if (!namespaces) return;

  NamespaceStream(namespaces);

  LoadingStream(false);
};
window.reloadConfig();

window.app.version().then((v) => {
  AppStream({ version: v });
});
