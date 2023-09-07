/// <reference path="../types.d.ts"/>
import m from 'mithril';
import { twMerge } from 'tailwind-merge';

import yaml from 'yaml';

import Select from '../components/select';
import ClustersStream from '../streams/cluster';
import NamespaceStream from '../streams/namespace';
import ModalStream from '../streams/modal';
import LoadingStream from '../streams/loading';

export default function () {
  let selected;
  let disabled = false;

  let search;
  let listResources = [];
  let selectedResouce;

  const showError = (err) => {
    ModalStream({
      type: 'error',
      text: err.message || 'Something went wrong',
    });
  };

  return {
    view: () =>
      m('div', { class: 'max-w-screen-xl mx-auto p-4' }, [
        m(Select, {
          options: ClustersStream().contexts,
          selected: ClustersStream().currentContext,
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
            selected: ClustersStream().currentNamespace || 'default',
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
                        'w-full text-left inline-block px-4 py-2 rounded-full text-gray-700 hover:text-black hover:bg-gray-200',
                        ...(selected === 'btn-secrets'
                          ? ['bg-gray-100 text-black']
                          : []),
                      ),
                      disabled,
                      onclick: async (e) => {
                        if (selected === e.target.id) return;

                        disabled = true;
                        selected = e.target.id;
                        listResources = [];
                        selectedResouce = null;

                        const { err, data } = await window.api.invoke(
                          'k8s.getSecrets',
                          ClustersStream().currentNamespace || 'default',
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
                        'w-full text-left inline-block px-4 py-2 rounded-full text-gray-700 hover:text-black hover:bg-gray-200',
                        ...(selected === 'btn-workloads'
                          ? ['bg-gray-100 text-black']
                          : []),
                      ),
                      disabled,
                      onclick: (e) => {
                        selected = e.target.id;

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
                class: 'flex min-w-full relative overflow-hidden',
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
                                  ClustersStream().currentNamespace ||
                                    'default',
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
                                  'p-2 text-xs font-medium text-gray-600 hover:text-blue-700 h-10 rounded-full hover:bg-gray-100',
                                title: 'Go back',
                                onclick: () => {
                                  selectedResouce = null;
                                },
                              },
                              m.trust(`<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"></path>
                      </svg>`),
                            ),

                            m(
                              'button',
                              {
                                class:
                                  'px-3 py-2 text-xs font-medium text-gray-600 hover:text-blue-700 h-10 ml-auto rounded-full hover:bg-gray-100',
                                onclick: () => {
                                  const doc = new yaml.Document();
                                  delete selectedResouce['metadata'][
                                    'managedFields'
                                  ];
                                  doc.contents = selectedResouce;
                                  console.log(doc.toString());
                                },
                              },
                              'Raw value',
                            ),

                            m(
                              'button',
                              {
                                class:
                                  'inline-flex items-center px-3 py-2 text-xs font-medium text-gray-600 hover:text-blue-700 border h-10 rounded-full ml-2',
                                onclick: (e) => {
                                  const parsedSecrets = Object.entries(
                                    selectedResouce.data,
                                  )
                                    .map(([key, val]) => `${key}=${atob(val)}`)
                                    .join('\n');

                                  navigator.clipboard.writeText(parsedSecrets);
                                  e.target.innerHTML =
                                    e.target.innerHTML.replace(
                                      `Copy`,
                                      `Copied`,
                                    );
                                  setTimeout(() => {
                                    e.target.innerHTML =
                                      e.target.innerHTML.replace(
                                        `Copied`,
                                        `Copy`,
                                      );
                                  }, 3000);
                                },
                              },
                              [
                                m.trust(`<svg class="w-3.5 h-3.5 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                        <path d="M5 9V4.13a2.96 2.96 0 0 0-1.293.749L.879 7.707A2.96 2.96 0 0 0 .13 9H5Zm11.066-9H9.829a2.98 2.98 0 0 0-2.122.879L7 1.584A.987.987 0 0 0 6.766 2h4.3A3.972 3.972 0 0 1 15 6v10h1.066A1.97 1.97 0 0 0 18 14V2a1.97 1.97 0 0 0-1.934-2Z"></path>
                        <path d="M11.066 4H7v5a2 2 0 0 1-2 2H0v7a1.969 1.969 0 0 0 1.933 2h9.133A1.97 1.97 0 0 0 13 18V6a1.97 1.97 0 0 0-1.934-2Z"></path>
                      </svg>`),
                                'Copy',
                              ],
                            ),
                          ],
                        ),

                      selectedResouce &&
                        m(
                          'div',
                          { class: 'w-full' },
                          Object.entries(selectedResouce.data).map(
                            ([key, val]) =>
                              m('div', [
                                m(
                                  'span',
                                  {
                                    class: 'text-blue-500',
                                    spellcheck: false,
                                  },
                                  key,
                                ),
                                m('span', { class: 'text-teal-400' }, '='),
                                m(
                                  'span',
                                  {
                                    spellcheck: false,
                                  },
                                  atob(val),
                                ),
                              ]),
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
