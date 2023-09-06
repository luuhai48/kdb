import { ipcMain } from 'electron';

import k8s from './k8s';

/**
 * @param {{window: () => import('electron').BrowserWindow}}
 */
// eslint-disable-next-line no-unused-vars
export default ({ window }) => {
  ipcMain.handle('k8s.reloadConfig', async () => {
    const err = await k8s.reloadConfig();

    if (err) {
      return {
        err,
      };
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
};
