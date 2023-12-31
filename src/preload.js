import { contextBridge, ipcRenderer } from 'electron';
import { BadRequest } from './errors';

const whitelistListenChannels = ['err', 'k8s.watchPodLogs', 'k8s.logPing'];
const whitelistSendChannels = ['k8s.logPong'];
const whitelistInvokeChannels = [
  'k8s.reloadConfig',
  'k8s.getClusters',
  'k8s.getNamespaces',
  'k8s.setCurrentContext',
  'k8s.setCurrentNamespace',
  'k8s.getSecrets',
  'k8s.readSecret',
  'k8s.getPods',
  'k8s.readPod',
  'k8s.watchPodLogs',
  'k8s.stopPodLogs',
];

contextBridge.exposeInMainWorld('app', {
  version: () => ipcRenderer.invoke('app.getVersion'),
});

contextBridge.exposeInMainWorld('api', {
  /**
   * Listen to events from backend
   * @param {string} channel
   * @param {(event: import('electron').IpcRendererEvent, ...args: any[]) => void} listener
   */
  on: (channel, listener) => {
    if (!whitelistListenChannels.includes(channel))
      throw new BadRequest(`Listening on channel "${channel}" is not allowed.`);

    ipcRenderer.on(channel, listener);
  },

  /**
   * Remove event listeners
   * @param {string} channel
   */
  off: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },

  /**
   * Send an event to backend
   * @param {string} channel
   * @param  {any[]} args
   */
  send: (channel, ...args) => {
    if (!whitelistSendChannels.includes(channel))
      throw new BadRequest(
        `Sending event to channel "${channel}" is not allowed.`,
      );

    ipcRenderer.send(channel, ...args);
  },

  /**
   * Send an event to backend and wait for response
   * @param {string} channel
   * @param  {any[]} args
   */
  invoke: (channel, ...args) => {
    if (!whitelistInvokeChannels.includes(channel))
      throw new BadRequest(`Invoke channel "${channel}" is not allowed.`);

    return ipcRenderer.invoke(channel, ...args);
  },
});
