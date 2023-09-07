import { contextBridge, ipcRenderer } from 'electron';

const whitelistListenChannels = ['err'];
const whitelistSendChannels = [];
const whitelistInvokeChannels = [
  'k8s.reloadConfig',
  'k8s.getClusters',
  'k8s.getNamespaces',
  'k8s.setCurrentContext',
  'k8s.setCurrentNamespace',
  'k8s.getSecrets',
  'k8s.readSecret',
];

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
   * Send an event to backend
   * @param {string} channel
   * @param  {any[]} args
   */
  send: (channel, ...args) => {
    if (!whitelistSendChannels.includes(channel))
      throw new Error(`Sending event to channel "${channel}" is not allowed.`);

    ipcRenderer.send(channel, ...args);
  },

  /**
   * Send an event to backend and wait for response
   * @param {string} channel
   * @param  {any[]} args
   */
  invoke: (channel, ...args) => {
    if (!whitelistInvokeChannels.includes(channel))
      throw new Error(`Invoke channel "${channel}" is not allowed.`);

    return ipcRenderer.invoke(channel, ...args);
  },
});
