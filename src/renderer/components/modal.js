import m from 'mithril';
import { twMerge } from 'tailwind-merge';
import hljs from 'highlight.js';

import ModalStream from '../streams/modal';

import Button from './button';

import CloseIcon from '../icons/close';

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
          onclick: (e) => {
            if (v.attrs?.closeable === false) return;
            if (e.target.classList.contains('modal')) ModalStream(false);
          },
        },
        m(
          'div',
          {
            class: twMerge(
              'relative max-h-full min-w-[25rem]',
              v.attrs.fullWidth ? 'w-full' : 'max-w-md',
            ),
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
                m(CloseIcon),
                m('span', { class: 'sr-only' }, 'Close'),
              ),

            m(
              'div',
              { class: 'p-6 text-center' },

              v.attrs.type === 'error' &&
                m.trust(`<svg class="mx-auto mb-4 text-red-400 w-12 h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>`),

              v.attrs.text &&
                m(
                  'h3',
                  {
                    class: 'text-lg font-normal text-gray-500',
                  },
                  v.attrs.text,
                ),

              v.attrs.code &&
                m(
                  'div',
                  { class: 'border border-gray-200 mb-3 rounded-lg mt-6' },
                  m(
                    'pre',
                    {
                      class: 'text-left p-2 overflow-auto text-sm',
                    },
                    m.trust(
                      hljs.highlight(v.attrs.code, {
                        language: v.attrs.codeLanguage,
                      }).value,
                    ),
                  ),
                ),

              (v.attrs.buttons?.length > 0 || v.attrs.code) &&
                m(
                  'div',
                  {
                    class: 'flex items-center justify-center',
                  },
                  v.attrs.code &&
                    m(Button, {
                      type: 'copy',
                      text: 'Copy',
                      onclick: () => {
                        navigator.clipboard.writeText(v.attrs.code);
                      },
                    }),
                  v.attrs?.buttons,
                ),
            ),
          ),
        ),
      ),
  };
}
