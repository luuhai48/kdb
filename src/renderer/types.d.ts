import { IpcRendererEvent } from 'electron';

declare global {
  interface Window {
    /**
     * Context bridge to communicate with backend
     */
    api: {
      /**
       * Listen to event from backend
       */
      on: (
        channel: string,
        listener: (event: IpcRendererEvent, ...args: any[]) => void,
      ) => void;

      /**
       * Send an event to backend
       */
      send: (channel: string, ...args: any[]) => void;
    };

    sendAsync: (
      channel: string,
      data?: Record<string, any>,
      opts?: { timeoutMs: number },
    ) => Promise<any>;
  }
}
