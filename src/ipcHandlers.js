import { ipcMain } from 'electron';

import k8s from './k8s';

/**
 * @param {{window: () => import('electron').BrowserWindow}}
 */
export default ({ window }) => {
  ipcMain.on('k8s.reloadConfig', async (_, { id }) => {
    const err = await k8s.reloadConfig();

    if (err) {
      return window().webContents.send('event', {
        channel: 'k8s.reloadConfig',
        id,
        err,
      });
    }

    return window().webContents.send('event', {
      channel: 'k8s.reloadConfig',
      id,
      data: {
        contexts: k8s.config.contexts,
        currentContext: k8s.config.currentContext,
      },
    });
  });

  ipcMain.on('k8s.getClusters', async (_, { id }) => {
    if (!k8s.config || !k8s.api) {
      return window().webContents.send('event', {
        channel: 'k8s.getClusters',
        id,
        err: new Error('Invalid kube config'),
      });
    }

    return window().webContents.send('event', {
      channel: 'k8s.getClusters',
      id,
      data: {
        contexts: k8s.config.contexts,
        currentContext: k8s.config.currentContext,
      },
    });
  });
};
