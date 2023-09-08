/// <reference path="../types.d.ts"/>
import m from 'mithril';
import { twMerge } from 'tailwind-merge';
import yaml from 'yaml';
import hljs from 'highlight.js';

import Button from '../components/button';

import ClusterStream from '../streams/cluster';
import NamespaceStream from '../streams/namespace';
import ModalStream from '../streams/modal';

export default function () {
  let disabled = false;
  let listResources = [];
  let selectedResouce;
  let search;

  ClusterStream.map(() => {
    disabled = false;
    listResources = [];
    selectedResouce = null;
    search = null;

    m.redraw();
  });

  NamespaceStream.map(() => {
    disabled = false;
    listResources = [];
    selectedResouce = null;
    search = null;

    m.redraw();
  });

  const showError = (err) => {
    ModalStream({
      type: 'error',
      text: err.message || 'Something went wrong',
    });
  };

  const oninit = async () => {
    disabled = true;

    const { err, data } = await window.api.invoke(
      'k8s.getSecrets',
      ClusterStream().currentNamespace,
    );

    disabled = false;
    if (err) {
      m.redraw();
      return showError(err);
    }

    listResources = data;
    m.redraw();
  };

  return {
    oninit,
    view: () => [
      m(
        'div',
        {
          class: twMerge(
            'px-6 w-full flex-[0_0_auto] transition-all',
            ...(selectedResouce ? ['-translate-x-full'] : ['translate-x-0']),
          ),
        },
        [
          m('div', { class: 'relative w-max flex' }, [
            m(
              'div',
              {
                class:
                  'absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none',
              },
              m.trust(`<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>`),
            ),
            m('input', {
              type: 'search',
              id: 'resource-search',
              placeholder: 'Search resouce...',
              class:
                'block p-2 pl-8 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500',
              oninput: (e) => {
                if (e.target.value?.length > 0) {
                  search = e.target.value;
                } else {
                  search = null;
                }
              },
            }),
            m(
              Button,
              {
                type: 'noBorder',
                pill: true,
                class: 'ml-2',
                title: 'Reload',
                disabled,
                onclick: () => {
                  oninit();
                },
              },
              m.trust(`<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 1v5h-5M2 19v-5h5m10-4a8 8 0 0 1-14.947 3.97M1 10a8 8 0 0 1 14.947-3.97"/>
            </svg>`),
            ),
          ]),

          disabled
            ? m('h3', { class: 'mt-4' }, 'Loading ...')
            : listResources.length === 0
            ? m('h3', { class: 'mt-4' }, 'No resource found')
            : m(
                'ul',
                { class: 'mt-5' },
                (search
                  ? listResources.filter((n) => n.includes(search))
                  : listResources
                ).map((name) =>
                  m(
                    'li',
                    m(
                      'button',
                      {
                        class: 'hover:underline',
                        disabled,
                        onclick: async () => {
                          disabled = true;

                          const { err, data } = await window.api.invoke(
                            'k8s.readSecret',
                            name,
                            ClusterStream().currentNamespace || 'default',
                          );

                          disabled = false;
                          if (err) {
                            m.redraw();
                            return showError(err);
                          }

                          selectedResouce = data;
                          m.redraw();
                        },
                      },
                      name,
                    ),
                  ),
                ),
              ),
        ],
      ),

      m(
        'div',
        {
          class: twMerge(
            'w-full flex-[0_0_auto] transition-all',
            ...(selectedResouce ? ['-translate-x-full'] : ['translate-x-0']),
          ),
        },
        [
          m(
            'div',
            {
              class: 'whitespace-pre leading-6 ml-6 relative mt-10',
            },

            selectedResouce &&
              m(
                'div',
                {
                  class:
                    'absolute -top-[2.5rem] left-0 flex w-full items-center',
                },
                [
                  m(
                    Button,
                    {
                      title: 'Go back',
                      type: 'noBorder',
                      pill: true,
                      onclick: () => {
                        selectedResouce = null;
                      },
                    },
                    m.trust(`<svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"></path>
                    </svg>`),
                  ),

                  m(Button, {
                    type: 'noBorder',
                    class: 'h-8 ml-auto',
                    pill: true,
                    text: 'Raw value',
                    onclick: () => {
                      const doc = new yaml.Document();
                      delete selectedResouce['metadata']['managedFields'];
                      doc.contents = selectedResouce;

                      ModalStream({
                        fullWidth: true,
                        code: doc.toString(),
                        codeLanguage: 'yaml',
                        buttons: [
                          m(Button, {
                            type: 'copy',
                            text: 'Copy',
                            onclick: () => {
                              navigator.clipboard.writeText(doc.toString());
                            },
                          }),
                        ],
                      });
                    },
                  }),

                  m(Button, {
                    type: 'copy',
                    text: 'Copy',
                    class: 'h-8 ml-2',
                    pill: true,
                    onclick: () => {
                      const parsedSecrets = Object.entries(selectedResouce.data)
                        .map(([key, val]) => `${key}=${atob(val)}`)
                        .join('\n');

                      navigator.clipboard.writeText(parsedSecrets);
                    },
                  }),
                ],
              ),

            selectedResouce &&
              m(
                'div',
                {
                  class: 'border border-gray-200',
                },
                m(
                  'pre',
                  {
                    class: 'w-full text-left p-2 overflow-auto text-sm',
                  },
                  m.trust(
                    hljs.highlight(
                      Object.entries(selectedResouce.data)
                        .map(([key, val]) => `${key}=${atob(val)}`)
                        .join('\n'),
                      { language: 'properties' },
                    ).value,
                  ),
                ),
              ),
          ),
        ],
      ),
    ],
  };
}
