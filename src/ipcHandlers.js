import { app, ipcMain } from 'electron';

import k8s from './k8s';
import { BadRequest, InternalServerError } from './errors';

/**
 * @param {{window:import('electron').BrowserWindow}}
 */
// eslint-disable-next-line no-unused-vars
export default (args) => {
  ipcMain.handle('getVersion', () => {
    return app.getVersion();
  });

  ipcMain.handle('k8s.reloadConfig', async () => {
    const err = await k8s.reloadConfig();
    if (err) {
      return InternalServerError(err.message);
    }

    return {
      contexts: k8s.config.contexts,
      currentContext: k8s.config.currentContext,
    };
  });

  ipcMain.handle('k8s.getClusters', async () => {
    if (!k8s.config || !k8s.api || !k8s.appsApi) {
      return InternalServerError('Invalid kube config');
    }

    return {
      contexts: k8s.config.contexts,
      currentContext: k8s.config.currentContext,
    };
  });

  ipcMain.handle('k8s.getNamespaces', async () => {
    if (!k8s.config || !k8s.api || !k8s.appsApi) {
      return InternalServerError('Invalid kube config');
    }

    try {
      const data = await k8s.api.listNamespace().then((r) => r.body.items);

      return data.map((n) => n.metadata.name);
    } catch (err) {
      return InternalServerError(err.message);
    }
  });

  ipcMain.handle('k8s.setCurrentContext', async (_, contextName) => {
    const err = await k8s.setCurrentContext(contextName);
    if (err) {
      return BadRequest(err.message);
    }

    return true;
  });

  ipcMain.handle('k8s.setCurrentNamespace', async (_, namespaceName) => {
    const err = await k8s.setCurrentNamespace(namespaceName);
    if (err) {
      return BadRequest(err.message);
    }

    return { data: true };
  });

  ipcMain.handle('k8s.getSecrets', async (_, namespace) => {
    if (!k8s.config || !k8s.api || !k8s.appsApi) {
      return InternalServerError('Invalid kube config');
    }

    try {
      const data = await k8s.api
        .listNamespacedSecret(namespace)
        .then((r) => r.body.items);

      return data.map((s) => ({
        name: s.metadata.name,
        type: s.type,
        data: Object.keys(s.data || {}).length,
        creationTimestamp: s.metadata.creationTimestamp,
        lastUpdatedTimestamp:
          s.metadata.managedFields[s.metadata.managedFields.length - 1].time !==
          s.metadata.creationTimestamp
            ? s.metadata.managedFields[s.metadata.managedFields.length - 1].time
            : undefined,
      }));
    } catch (err) {
      return BadRequest(err.message);
    }
  });

  ipcMain.handle('k8s.readSecret', async (_, secretName, namespace) => {
    if (!k8s.config || !k8s.api || !k8s.appsApi) {
      return InternalServerError('Invalid kube config');
    }

    try {
      return await k8s.api
        .readNamespacedSecret(secretName, namespace)
        .then((r) => r.body);
    } catch (err) {
      return BadRequest(err.message);
    }
  });

  ipcMain.handle('k8s.getPods', async (_, namespace) => {
    if (!k8s.config || !k8s.api || !k8s.appsApi) {
      return InternalServerError('Invalid kube config');
    }

    try {
      return await k8s.api.listNamespacedPod(namespace).then((r) => r.body);
    } catch (err) {
      return BadRequest(err.message);
    }
  });

  ipcMain.handle('k8s.readPod', async (_, podName, namespace) => {
    if (!k8s.config || !k8s.api || !k8s.appsApi) {
      return InternalServerError('Invalid kube config');
    }

    try {
      return await k8s.api
        .readNamespacedPod(podName, namespace)
        .then((r) => r.body);
    } catch (err) {
      return BadRequest(err.message);
    }
  });
};
