import { ipcMain } from 'electron';

import k8s from './k8s';

/**
 * @param {{window:import('electron').BrowserWindow}}
 */
// eslint-disable-next-line no-unused-vars
export default (args) => {
  ipcMain.handle('k8s.reloadConfig', async () => {
    const err = await k8s.reloadConfig();

    if (err) {
      return { err };
    }

    return {
      data: {
        contexts: k8s.config.contexts,
        currentContext: k8s.config.currentContext,
      },
    };
  });

  ipcMain.handle('k8s.getClusters', async () => {
    if (!k8s.config || !k8s.api) {
      return {
        err: new Error('Invalid kube config'),
      };
    }

    return {
      data: {
        contexts: k8s.config.contexts,
        currentContext: k8s.config.currentContext,
      },
    };
  });

  ipcMain.handle('k8s.getNamespaces', async () => {
    if (!k8s.config || !k8s.api) {
      return {
        err: new Error('Invalid kube config'),
      };
    }

    const data = await k8s.api.listNamespace().then((r) => r.body.items);

    return {
      data: data.map((n) => n.metadata.name),
    };
  });

  ipcMain.handle('k8s.setCurrentContext', async (_, contextName) => {
    const err = await k8s.setCurrentContext(contextName);

    if (err) {
      return { err };
    }

    return { data: true };
  });

  ipcMain.handle('k8s.setCurrentNamespace', async (_, namespaceName) => {
    const err = await k8s.setCurrentNamespace(namespaceName);

    if (err) {
      return { err };
    }

    return { data: true };
  });

  ipcMain.handle('k8s.getSecrets', async (_, namespace) => {
    try {
      const data = await k8s.api
        .listNamespacedSecret(namespace)
        .then((r) => r.body.items);

      return {
        data: data.map((s) => s.metadata.name),
      };
    } catch (err) {
      return { err };
    }
  });

  ipcMain.handle('k8s.readSecret', async (_, secretName, namespace) => {
    try {
      const data = await k8s.api
        .readNamespacedSecret(secretName, namespace)
        .then((r) => r.body);

      return { data };
    } catch (err) {
      return { err };
    }
  });
};
