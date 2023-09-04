import { ipcMain } from 'electron';

import k8s from './k8s';

/**
 * @param {{window: () => import('electron').BrowserWindow}}
 */
export default ({ window }) => {
  ipcMain.on('k8s.reloadConfig', async () => {
    const err = await k8s.reloadConfig();

    if (err) {
      window().webContents.send('err', err);
    }
  });
};
