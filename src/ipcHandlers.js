const stream = require('stream');
import { app, ipcMain } from 'electron';

import k8s from './k8s';
import { BadRequest, InternalServerError } from './errors';

/**
 * @param {{window: import('electron').BrowserWindow}} args
 */
export default (args) => {
  ipcMain.handle('app.getVersion', () => {
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
    if (!k8s.config || !k8s.api || !k8s.appsApi || !k8s.log) {
      return InternalServerError('Invalid kube config');
    }

    return {
      contexts: k8s.config.contexts,
      currentContext: k8s.config.currentContext,
    };
  });

  ipcMain.handle('k8s.getNamespaces', async () => {
    if (!k8s.config || !k8s.api || !k8s.appsApi || !k8s.log) {
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

    return true;
  });

  ipcMain.handle('k8s.getSecrets', async (_, namespace) => {
    if (!k8s.config || !k8s.api || !k8s.appsApi || !k8s.log) {
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
          s.metadata.managedFields[s.metadata.managedFields.length - 1].time,
      }));
    } catch (err) {
      return BadRequest(err.message);
    }
  });

  ipcMain.handle('k8s.readSecret', async (_, secretName, namespace) => {
    if (!k8s.config || !k8s.api || !k8s.appsApi || !k8s.log) {
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
    if (!k8s.config || !k8s.api || !k8s.appsApi || !k8s.log) {
      return InternalServerError('Invalid kube config');
    }

    try {
      const data = await k8s.api
        .listNamespacedPod(namespace)
        .then((r) => r.body.items);

      return data.map((p) => {
        const terminatedStates = (p.status?.containerStatuses || []).filter(
          (s) => s.lastState?.terminated,
        );

        return {
          name: p.metadata.name,
          creationTimestamp: p.metadata.creationTimestamp,
          lastUpdatedTimestamp:
            p.metadata.managedFields[p.metadata.managedFields.length - 1].time,
          status: p.metadata.deletionTimestamp ? 'Terminating' : p.status.phase,
          ready: `${p.status?.containerStatuses?.length}/${
            (p.status?.containerStatuses || []).filter((s) => s.ready).length
          }`,
          restarts: (p.status?.containerStatuses || []).reduce(
            (result, cur) => {
              return result + cur.restartCount;
            },
            0,
          ),
          terminaltedTimestamp:
            terminatedStates?.length > 0
              ? terminatedStates[terminatedStates.length - 1].lastState
                  .terminated.finishedAt
              : undefined,
        };
      });
    } catch (err) {
      return BadRequest(err.message);
    }
  });

  ipcMain.handle('k8s.readPod', async (_, podName, namespace) => {
    if (!k8s.config || !k8s.api || !k8s.appsApi || !k8s.log) {
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

  const logRequests = {};

  ipcMain.handle('k8s.watchPodLogs', async (_, podName, namespace) => {
    if (!k8s.config || !k8s.api || !k8s.appsApi || !k8s.log) {
      return InternalServerError('Invalid kube config');
    }

    const logChannel = `${namespace}:${podName}`;
    if (logRequests[logChannel]) return true;

    try {
      const logStream = new stream.PassThrough();
      logStream.on('data', (chunk) => {
        args.window.webContents.send('k8s.watchPodLogs', {
          channel: logChannel,
          data: chunk.toString(),
        });
      });

      const req = await k8s.log.log(namespace, podName, undefined, logStream, {
        follow: true,
        tailLines: 100,
        pretty: true,
      });

      logRequests[logChannel] = {
        req,
        stream: logStream,
        interval: setInterval(() => {
          if (!logRequests[logChannel]) return;

          args.window.webContents.send('k8s.logPing', logChannel);

          logRequests[logChannel].timeout = setTimeout(() => {
            if (!logRequests[logChannel]) return;
            const log = logRequests[logChannel];

            log.req.abort();
            log.stream.destroy();
            clearInterval(log.interval);
            delete logRequests[logChannel];
          }, 5000);
        }, 5000),
      };

      return true;
    } catch (err) {
      return BadRequest(err.message);
    }
  });

  ipcMain.handle('k8s.stopPodLogs', async (_, logChannel) => {
    if (!logRequests[logChannel]) return false;

    try {
      const log = logRequests[logChannel];
      log.req.abort();
      log.stream.destroy();
      clearInterval(log.interval);
      clearTimeout(log.timeout);
      delete logRequests[logChannel];

      return true;
    } catch (err) {
      return BadRequest(err.message);
    }
  });

  ipcMain.on('k8s.logPong', (_, logChannel) => {
    if (!logRequests[logChannel]) return;
    clearTimeout(logRequests[logChannel].timeout);
  });
};
