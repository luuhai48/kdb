import m from 'mithril';
import { twMerge } from 'tailwind-merge';

import Modal from './modal';
import Select from './select';
import ModalStream from '../streams/modal';
import ClusterStream from '../streams/cluster';
import NamespaceStream from '../streams/namespace';
import LoadingStream from '../streams/loading';
import AppStream from '../streams/app';

export default function () {
  return {
    /**
     * @param {import('mithril').Vnode} v
     */
    view: (v) =>
      m('main', [
        m(
          'nav',
          { class: 'bg-white border-b border-gray-200' },
          m(
            'div',
            {
              class: 'flex flex-wrap items-center justify-between mx-auto p-4',
            },
            m(
              'a',
              { class: 'flex items-center' },
              m('img', {
                src: '/src/assets/icons/png/256x256.png',
                class: 'h-10 mr-3',
                alt: 'KDB Logo',
                draggable: false,
              }),
              m(
                'span',
                {
                  class: 'self-center text-2xl font-semibold whitespace-nowrap',
                },
                'KDB',
              ),
            ),

            m('div', { class: 'hidden w-full md:block md:w-auto' }, [
              `Version: ${AppStream().version}`,
            ]),
          ),
        ),

        m('div', { class: 'mx-auto px-4 pb-4 pt-8' }, [
          m(Select, {
            options: ClusterStream().contexts,
            selected: ClusterStream().currentContext,
            label: 'Cluster',
            onchange: async (e) => {
              LoadingStream(true);

              const success = await window.invoke(
                'k8s.setCurrentContext',
                e.target.value,
              );
              if (!success) return;

              window.reloadConfig();
            },
          }),

          m('div', {
            class: 'w-5 inline-block',
          }),

          NamespaceStream().length > 0 &&
            m(Select, {
              options: NamespaceStream(),
              selected: ClusterStream().currentNamespace,
              label: 'Namespace',
              onchange: async (e) => {
                LoadingStream(true);

                const success = await window.invoke(
                  'k8s.setCurrentNamespace',
                  e.target.value,
                );
                if (!success) return;

                window.reloadConfig();
              },
            }),
        ]),

        m('div', { class: 'mx-auto px-4 py-6' }, [
          m(
            'div',
            {
              class: 'flex',
            },
            [
              m(
                'ul',
                {
                  class:
                    'flex flex-col -mb-px text-sm font-medium text-center border-r w-60 pr-6',
                },
                [
                  m(
                    'li',
                    m(
                      'button',
                      {
                        id: 'secrets',
                        type: 'button',
                        role: 'tab',
                        class: twMerge(
                          'w-full text-center inline-block p-2 rounded-lg text-gray-700 hover:text-black hover:bg-gray-200 font-medium',
                          ...(m.route.get() === '/secrets'
                            ? ['bg-gray-100 text-black']
                            : []),
                        ),
                        onclick: async () => {
                          if (m.route.get() === '/secrets') return;
                          m.route.set('/secrets');
                        },
                      },
                      'Secrets',
                    ),
                  ),
                  m(
                    'li',
                    { class: 'mt-2' },
                    m(
                      'button',
                      {
                        id: 'pods',
                        type: 'button',
                        role: 'tab',
                        class: twMerge(
                          'w-full text-center inline-block p-2 rounded-lg text-gray-700 hover:text-black hover:bg-gray-200 font-medium',
                          ...(m.route.get() === '/pods'
                            ? ['bg-gray-100 text-black']
                            : []),
                        ),
                        onclick: () => {
                          if (m.route.get() === '/pods') return;
                          m.route.set('/pods');
                        },
                      },
                      'Pods',
                    ),
                  ),
                ],
              ),

              m(
                'div',
                {
                  class: 'flex w-full relative overflow-hidden',
                },
                v.children,
              ),
            ],
          ),
        ]),

        LoadingStream() &&
          m(
            'div',
            {
              class:
                'fixed top-0 left-0 right-0 bottom-0 z-100 bg-gray-600 bg-opacity-90 flex justify-center items-center select-none',
            },
            m(
              'div',
              {
                class:
                  'select-none inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]',
                role: 'status',
              },
              m(
                'span',
                {
                  class:
                    '!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]',
                },
                'Loading...',
              ),
            ),
          ),

        ModalStream() &&
          m(Modal, {
            ...ModalStream(),
            onclick: () => {
              ModalStream(false);
            },
          }),
      ]),
  };
}
