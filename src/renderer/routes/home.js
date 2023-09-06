/// <reference path="../types.d.ts"/>
import m from 'mithril';

import Select from '../components/select';
import ClustersStream from '../streams/cluster';
import NamespaceStream from '../streams/namespace';
import ModalStream from '../streams/modal';
import LoadingStream from '../streams/loading';

export default function () {
  return {
    view: () =>
      m('div', { class: 'max-w-screen-xl mx-auto p-4' }, [
        m(Select, {
          options: ClustersStream().contexts,
          selected: ClustersStream().currentContext,
          placeholder: 'Select cluster',
          onchange: async (e) => {
            LoadingStream(true);

            const { err } = await window.api.invoke(
              'k8s.setCurrentContext',
              e.target.value,
            );

            if (err) {
              LoadingStream(false);
              ModalStream({
                type: 'error',
                text: err.message || 'Something went wrong',
              });
              return;
            }

            window.reloadConfig();
          },
        }),

        m('div', {
          class: 'w-5 inline-block',
        }),

        NamespaceStream().length &&
          m(Select, {
            options: NamespaceStream(),
            selected: ClustersStream().currentNamespace || 'default',
            placeholder: 'Select namespace',
            onchange: async (e) => {
              LoadingStream(true);

              const { err } = await window.api.invoke(
                'k8s.setCurrentNamespace',
                e.target.value,
              );

              if (err) {
                LoadingStream(false);
                ModalStream({
                  type: 'error',
                  text: err.message || 'Something went wrong',
                });
                return;
              }

              window.reloadConfig();
            },
          }),
      ]),
  };
}
