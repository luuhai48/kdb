import m from 'mithril';

import ModalStream from '../streams/modal';

export default function () {
  return {
    /**
     * @param {import('mithril').Vnode} v
     */
    view: (v) =>
      m(
        'div.modal',
        {
          tabindex: -1,
          class:
            'fixed top-0 left-0 right-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 max-h-full bg-gray-600 bg-opacity-90 flex justify-center items-center',
        },
        m(
          'div',
          {
            class: 'relative w-full max-w-md max-h-full',
          },

          m(
            'div',
            { class: 'relative bg-white rounded-lg shadow' },
            v.attrs?.closeable !== false &&
              m(
                'button',
                {
                  class:
                    'absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center',
                  onclick: () => {
                    ModalStream(false);
                  },
                },
                m.trust(`<svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
  </svg>`),
                m('span', { class: 'sr-only' }, 'Close'),
              ),

            m(
              'div',
              { class: 'p-6 text-center' },
              m.trust(`<svg class="mx-auto mb-4 text-gray-400 w-12 h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
  </svg>`),
              m(
                'h3',
                {
                  class: 'mb-5 text-lg font-normal text-gray-500',
                },
                v.attrs.text,
              ),
              ...(v.attrs?.buttons || []),
            ),
          ),
        ),
      ),
  };
}
