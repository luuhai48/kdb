import m from 'mithril';

import Modal from './modal';
import Select from './select';
import ModalStream from '../streams/modal';
import ClusterStream from '../streams/cluster';
import NamespaceStream from '../streams/namespace';
import LoadingStream from '../streams/loading';

export default function () {
  const showError = (err) => {
    ModalStream({
      type: 'error',
      text: err.message || 'Something went wrong',
    });
  };

  return {
    /**
     * @param {import('mithril').Vnode} v
     */
    view: (v) =>
      m('main', { class: '' }, [
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
                src: '/src/assets/icons/png/1024x1024.png',
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
            //             m(
            //               'button',
            //               {
            //                 class:
            //                   'inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200',
            //               },
            //               m('span', { class: 'sr-only' }, 'Open Menu'),
            //               m.trust(`<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            //     <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
            // </svg>`),
            //             ),
            //             m(
            //               'div',
            //               { class: 'hidden w-full md:block md:w-auto' },
            //               m(
            //                 'ul',
            //                 {
            //                   class:
            //                     'font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white',
            //                 },
            //                 m(
            //                   'li',
            //                   m(
            //                     'a',
            //                     {
            //                       href: '#!/',
            //                       class:
            //                         'block py-2 pl-3 pr-4 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0',
            //                     },
            //                     'Home',
            //                   ),
            //                 ),
            //               ),
            //             ),
          ),
        ),

        m('div', { class: 'mx-auto p-4' }, [
          m(Select, {
            options: ClusterStream().contexts,
            selected: ClusterStream().currentContext,
            label: 'Cluster',
            onchange: async (e) => {
              LoadingStream(true);

              const { err } = await window.api.invoke(
                'k8s.setCurrentContext',
                e.target.value,
              );

              if (err) {
                LoadingStream(false);
                return showError(err);
              }

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

                const { err } = await window.api.invoke(
                  'k8s.setCurrentNamespace',
                  e.target.value,
                );

                if (err) {
                  LoadingStream(false);
                  return showError(err);
                }

                window.reloadConfig();
              },
            }),
        ]),

        v.children,

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
