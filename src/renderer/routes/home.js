/// <reference path="../types.d.ts"/>
import m from 'mithril';
import { twMerge } from 'tailwind-merge';
import yaml from 'yaml';
import hljs from 'highlight.js';

import Select from '../components/select';
import Button from '../components/button';

import ClusterStream from '../streams/cluster';
import NamespaceStream from '../streams/namespace';
import ModalStream from '../streams/modal';
import LoadingStream from '../streams/loading';

export default function () {
  let selectedBtn;
  let disabled = false;

  let search;
  let listResources = [];
  let selectedResouce;

  ClusterStream.map(() => {
    search = null;
    selectedResouce = null;
    listResources = [];
    disabled = false;
    selectedBtn = null;

    m.redraw();
  });

  NamespaceStream.map(() => {
    search = null;
    selectedResouce = null;
    listResources = [];
    disabled = false;
    selectedBtn = null;

    m.redraw();
  });

  const showError = (err) => {
    ModalStream({
      type: 'error',
      text: err.message || 'Something went wrong',
    });
  };

  return {
    view: () =>
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

        m(
          'div',
          {
            class: 'mt-8 flex',
          },
          [
            m(
              'ul',
              {
                class:
                  'flex flex-col -mb-px text-sm font-medium text-center border-r w-40 pr-6',
              },
              [
                m(
                  'li',
                  { class: 'mr-2' },
                  m(
                    'button',
                    {
                      id: 'btn-secrets',
                      type: 'button',
                      role: 'tab',
                      class: twMerge(
                        'w-full text-center inline-block px-4 py-2 rounded-full text-gray-700 hover:text-black hover:bg-gray-200 font-medium',
                        ...(selectedBtn === 'btn-secrets'
                          ? ['bg-gray-100 text-black']
                          : []),
                      ),
                      disabled,
                      onclick: async (e) => {
                        if (selectedBtn === e.target.id) return;

                        disabled = true;
                        selectedBtn = e.target.id;
                        listResources = [];
                        selectedResouce = null;

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
                      id: 'btn-workloads',
                      type: 'button',
                      role: 'tab',
                      class: twMerge(
                        'w-full text-center inline-block px-4 py-2 rounded-full text-gray-700 hover:text-black hover:bg-gray-200 font-medium',
                        ...(selectedBtn === 'btn-workloads'
                          ? ['bg-gray-100 text-black']
                          : []),
                      ),
                      disabled,
                      onclick: (e) => {
                        selectedBtn = e.target.id;

                        listResources = [];
                        selectedResouce = null;
                      },
                    },
                    'Workloads',
                  ),
                ),
              ],
            ),

            m(
              'div',
              {
                class: 'flex w-full relative overflow-hidden',
              },
              [
                m(
                  'div',
                  {
                    class: twMerge(
                      'px-6 w-full flex-[0_0_auto] transition-all',
                      ...(selectedResouce
                        ? ['-translate-x-full']
                        : ['translate-x-0']),
                    ),
                  },
                  [
                    m('div', { class: 'relative w-max' }, [
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
                    ]),
                    m(
                      'ul',
                      { class: 'mt-6' },
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
                      ...(selectedResouce
                        ? ['-translate-x-full']
                        : ['translate-x-0']),
                    ),
                  },
                  [
                    m(
                      'div',
                      {
                        class:
                          'whitespace-pre leading-6 ml-6 relative mt-[60px]',
                      },

                      selectedResouce &&
                        m(
                          'div',
                          {
                            class:
                              'absolute -top-[3.75rem] left-0 flex w-full items-center',
                          },
                          [
                            m(
                              'button',
                              {
                                class:
                                  'px-2 text-xs font-medium text-gray-600 hover:text-blue-700 h-8 rounded-full hover:bg-gray-100',
                                title: 'Go back',
                                onclick: () => {
                                  selectedResouce = null;
                                },
                              },
                              m.trust(`<svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"></path>
                              </svg>`),
                            ),

                            m(
                              'button',
                              {
                                class:
                                  'px-3 py-2 text-xs font-medium text-gray-600 hover:text-blue-700 h-8 ml-auto rounded-full hover:bg-gray-100',
                                onclick: () => {
                                  const doc = new yaml.Document();
                                  delete selectedResouce['metadata'][
                                    'managedFields'
                                  ];
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
                                          navigator.clipboard.writeText(
                                            doc.toString(),
                                          );
                                        },
                                      }),
                                    ],
                                  });
                                },
                              },
                              'Raw value',
                            ),

                            m(Button, {
                              type: 'copy',
                              text: 'Copy',
                              class: 'h-8 ml-2',
                              onclick: () => {
                                const parsedSecrets = Object.entries(
                                  selectedResouce.data,
                                )
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
                          m(
                            'pre',
                            {
                              class:
                                'w-full text-left p-2 overflow-auto text-sm',
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
            ),
          ],
        ),
      ]),
  };
}
