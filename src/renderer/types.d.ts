import { IpcRendererEvent } from 'electron';

declare global {
  interface Window {
    app: {
      /**
       * Application version. Defined in `package.json`
       */
      version: string;
    };

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

      /**
       * Send an event to backend and wait for response
       */
      invoke: (
        channel: string,
        ...args: any[]
      ) => Promise<{ err?: Error; data: any }>;
    };

    /**
     * Send an event to backend and wait for response, but it catches and
     * show modal automaticly
     */
    invoke: (channel: string, ...args: any[]) => Promise<any | undefined>;
  }
}
