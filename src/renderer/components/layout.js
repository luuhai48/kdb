import m from 'mithril';

import Modal from './modal';
import AppState from '../streams/appstate';

export default function () {
  return {
    /**
     * @param {import('mithril').Vnode} v
     */
    view: (v) =>
      m('main', { class: '' }, [
        m(
          'nav',
          { class: 'bg-white border-gray-200 dark:bg-gray-900' },
          m(
            'div',
            {
              class:
                'max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4',
            },
            m(
              'a',
              { class: 'flex items-center' },
              m('img', {
                src: '/src/assets/icons/png/1024x1024.png',
                class: 'h-8 mr-3',
                alt: 'KDB Logo',
              }),
              m(
                'span',
                {
                  class:
                    'self-center text-2xl font-semibold whitespace-nowrap dark:text-white',
                },
                'KDB',
              ),
            ),
            //             m(
            //               'button',
            //               {
            //                 class:
            //                   'inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600',
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
            //                     'font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700',
            //                 },
            //                 m(
            //                   'li',
            //                   m(
            //                     'a',
            //                     {
            //                       href: '#!/',
            //                       class:
            //                         'block py-2 pl-3 pr-4 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500',
            //                     },
            //                     'Home',
            //                   ),
            //                 ),
            //               ),
            //             ),
          ),
        ),

        v.children,

        AppState().modal && m(Modal),
      ]),
  };
}
