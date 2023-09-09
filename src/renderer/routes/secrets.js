/// <reference path="../types.d.ts"/>
import m from 'mithril';
import { twMerge } from 'tailwind-merge';
import yaml from 'yaml';
import hljs from 'highlight.js';

import Button from '../components/button';

import ClusterStream from '../streams/cluster';
import NamespaceStream from '../streams/namespace';
import ModalStream from '../streams/modal';

import SearchIcon from '../icons/search';
import ReloadIcon from '../icons/reload';
import BackIcon from '../icons/back';

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
    await new Promise((resolve) => {
      NamespaceStream.map((ns) => {
        if (ns.length > 0) {
          resolve();
        }
      });
    });

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
              m(SearchIcon, {
                class: 'text-gray-500 dark:text-gray-400',
              }),
            ),
            m('input', {
              type: 'search',
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
                class: 'ml-2 p-3',
                title: 'Reload',
                disabled,
                onclick: () => {
                  oninit();
                },
              },
              m(ReloadIcon),
            ),
          ]),

          disabled
            ? m('h3', { class: 'mt-4' }, 'Loading ...')
            : listResources.length === 0
            ? m('h3', { class: 'mt-4' }, 'No resource found')
            : m(
                'div',
                {
                  class: 'relative overflow-x-auto mt-2',
                },
                m(
                  'table',
                  { class: 'w-full text-sm text-left text-gray-500' },
                  [
                    m(
                      'thead',
                      {
                        class: 'text-xs text-gray-700 uppercase bg-gray-50">',
                      },
                      [
                        m('tr', [
                          m('th', { class: 'px-6 py-3', scope: 'col' }, 'NAME'),
                          m('th', { class: 'px-6 py-3', scope: 'col' }, 'TYPE'),
                          m('th', { class: 'px-6 py-3', scope: 'col' }, 'DATA'),
                          m('th', { class: 'px-6 py-3', scope: 'col' }, 'AGE'),
                          m(
                            'th',
                            { class: 'px-6 py-3', scope: 'col' },
                            'LAST UPDATE',
                          ),
                        ]),
                      ],
                    ),

                    m(
                      'tbody',
                      (search
                        ? listResources.filter((s) => s.name.includes(search))
                        : listResources
                      ).map((s) =>
                        m(
                          'tr',
                          {
                            class:
                              'bg-white border-b hover:bg-gray-50 cursor-pointer',
                            onclick: async () => {
                              if (disabled) return;

                              disabled = true;

                              const { err, data } = await window.api.invoke(
                                'k8s.readSecret',
                                s.name,
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
                          [
                            m(
                              'th',
                              {
                                class:
                                  'px-6 py-4 font-bold text-gray-900 whitespace-nowrap',
                                scope: 'row',
                              },
                              s.name,
                            ),
                            m(
                              'th',
                              { class: 'px-6 py-4', scope: 'row' },
                              s.type,
                            ),
                            m(
                              'th',
                              { class: 'px-6 py-4', scope: 'row' },
                              s.data,
                            ),
                            m(
                              'th',
                              { class: 'px-6 py-4', scope: 'row' },
                              window.utils.forHumans(
                                Date.now() -
                                  new Date(s.creationTimestamp).getTime(),
                              ),
                            ),
                            m(
                              'th',
                              { class: 'px-6 py-4', scope: 'row' },
                              s.lastUpdatedTimestamp
                                ? window.utils.forHumans(
                                    Date.now() -
                                      new Date(
                                        s.lastUpdatedTimestamp,
                                      ).getTime(),
                                  )
                                : '',
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
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
                  class: 'absolute -top-10 left-0 flex w-full items-center',
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
                    m(BackIcon),
                  ),

                  m(Button, {
                    type: 'noBorder',
                    class: 'h-8 ml-auto',
                    text: 'Raw value',
                    onclick: () => {
                      const content = { ...selectedResouce };
                      delete content['metadata']['managedFields'];
                      const doc = new yaml.Document();
                      doc.contents = content;

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
                  class: 'border border-gray-200 rounded-lg',
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
