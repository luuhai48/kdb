import { contextBridge, ipcRenderer } from 'electron';

const whitelistListenChannels = ['err'];
const whitelistSendChannels = [];

contextBridge.exposeInMainWorld('api', {
  /**
   * Listen to events from backend
   * @param {string} channel
   * @param {(event: import('electron').IpcRendererEvent, ...args: any[]) => void} listener
   */
  on: (channel, listener) => {
    if (!whitelistListenChannels.includes(channel))
      throw new Error(`Listening on channel "${channel}" is not allowed.`);

    ipcRenderer.on(channel, listener);
  },

  /**
   * Send an event to channel
   * @param {string} channel
   * @param  {any[]} args
   */
  send: (channel, ...args) => {
    if (!whitelistSendChannels.includes(channel))
      throw new Error(`Sending event to channel "${channel}" is not allowed.`);

    ipcRenderer.send(channel, ...args);
  },
});
