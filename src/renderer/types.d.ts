import { IpcRendererEvent } from 'electron';
import { Vnode } from 'mithril';

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
       * Remove event listeners
       */
      off: (channel: string) => void;

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

    utils: {
      /**
       * Translates time into human readable format of seconds, minutes, hours, days, and years
       */
      forHumans: (milliseconds: number | string | Date) => string;

      /**
       * Highlight using `highlight.js`
       */
      highlight: (text: string, language: string) => Vnode<any, any>;
    };
  }
}
