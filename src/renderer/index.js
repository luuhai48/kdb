/// <reference path="types.d.ts"/>

import m from 'mithril';

import Layout from './components/layout';
import Home from './routes/home';

import AppState from './components/appstate';

const contexts = [];

m.route(document.body, '/', {
  '/': {
    render: () => m(Layout, Home(contexts)),
  },
});

// =============================================================================

window.api.on('err', (_, err) => {
  AppState({
    modal: {
      type: 'error',
      text: err.message || 'Something went wrong',
      closeable: false,
      buttons: [
        m(
          'button',
          {
            class:
              'select-none text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2',
            onclick: () => {
              window.api.send('k8s.reloadConfig');
              AppState().modal = false;
            },
          },
          'Try again',
        ),
      ],
    },
  });
});
