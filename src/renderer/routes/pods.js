/// <reference path="../types.d.ts"/>
import m from 'mithril';
import { twMerge } from 'tailwind-merge';

import Button from '../components/button';

import ClusterStream from '../streams/cluster';
import NamespaceStream from '../streams/namespace';

import SearchIcon from '../icons/search';
import ReloadIcon from '../icons/reload';
import BackIcon from '../icons/back';

export default function () {
  let disabled = true;
  let listResources = [];
  let selectedResource;
  let search;
  let pageInit = false;
  let log = '';

  const oninit = async () => {
    await new Promise((resolve) => {
      NamespaceStream.map((ns) => {
        if (ns.length > 0) {
          resolve();
        }
      });
    });

    disabled = true;

    const data = await window.invoke(
      'k8s.getPods',
      ClusterStream().currentNamespace,
    );

    disabled = false;
    if (!data) {
      m.redraw();
      return;
    }

    listResources = data;
    m.redraw();
  };

  NamespaceStream.map((ns) => {
    disabled = true;
    listResources = [];
    selectedResource = null;
    search = null;
    log = '';

    m.redraw();

    if (pageInit && ns.length > 0) {
      oninit();
    }
  });

  let onCloseHooks = [];

  return {
    oninit: async () => {
      await oninit();
      pageInit = true;
    },

    onremove: async () => {
      if (selectedResource?.metadata?.name) {
        window.invoke(
          'k8s.stopPodLogs',
          `${ClusterStream().currentNamespace}:${
            selectedResource.metadata.name
          }`,
        );
      }

      disabled = true;
      listResources = [];
      selectedResource = null;
      search = null;
      pageInit = false;
      log = '';

      if (!onCloseHooks.length) return;
      for (let [channel, listener] of onCloseHooks) {
        window.api.off(channel, listener);
      }
      onCloseHooks = [];
    },

    view: () => [
      m(
        'div',
        {
          class: twMerge(
            'px-6 w-full flex-[0_0_auto] transition-all',
            ...(selectedResource ? ['-translate-x-full'] : ['translate-x-0']),
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
                          m(
                            'th',
                            { class: 'px-6 py-3', scope: 'col' },
                            'READY',
                          ),
                          m(
                            'th',
                            { class: 'px-6 py-3', scope: 'col' },
                            'STATUS',
                          ),
                          m(
                            'th',
                            { class: 'px-6 py-3', scope: 'col' },
                            'RESTARTS',
                          ),
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
                        ? listResources.filter((r) => r.name.includes(search))
                        : listResources
                      ).map((r) =>
                        m(
                          'tr',
                          {
                            class:
                              'bg-white border-b hover:bg-gray-50 cursor-pointer',
                            onclick: async () => {
                              if (disabled) return;
                              disabled = true;

                              const namespace =
                                ClusterStream().currentNamespace;
                              const data = await window.invoke(
                                'k8s.readPod',
                                r.name,
                                namespace,
                              );

                              if (!data) {
                                disabled = false;
                                m.redraw();
                                return;
                              }

                              selectedResource = data;

                              const watchPodLogsListener = (
                                _,
                                { channel, data },
                              ) => {
                                if (channel !== `${namespace}:${r.name}`)
                                  return;

                                log += window.utils.highlight(
                                  data,
                                  'accesslog',
                                );
                                m.redraw();
                              };
                              window.api.on(
                                'k8s.watchPodLogs',
                                watchPodLogsListener,
                              );

                              const logPingHandler = (_, channel) => {
                                if (channel !== `${namespace}:${r.name}`)
                                  return;
                                window.api.send('k8s.logPong', channel);
                              };
                              window.api.on('k8s.logPing', logPingHandler);

                              onCloseHooks.push(
                                ['k8s.watchPodLogs', watchPodLogsListener],
                                ['k8s.logPing', logPingHandler],
                              );

                              await window.invoke(
                                'k8s.watchPodLogs',
                                r.name,
                                namespace,
                              );

                              disabled = false;
                              m.redraw();
                            },
                          },
                          [
                            m(
                              'th',
                              {
                                class:
                                  'px-6 py-4 font-medium text-gray-900 whitespace-nowrap',
                                scope: 'row',
                              },
                              r.name,
                            ),
                            m(
                              'th',
                              {
                                class:
                                  'px-6 py-4 font-medium text-gray-900 whitespace-nowrap',
                                scope: 'row',
                              },
                              r.ready,
                            ),
                            m(
                              'th',
                              {
                                class:
                                  'px-6 py-4 font-medium text-gray-900 whitespace-nowrap',
                                scope: 'row',
                              },
                              r.status,
                            ),
                            m(
                              'th',
                              {
                                class:
                                  'px-6 py-4 font-medium text-gray-900 whitespace-nowrap',
                                scope: 'row',
                              },
                              r.restarts +
                                (r.terminaltedTimestamp
                                  ? ' (' +
                                    window.utils.forHumans(
                                      r.terminaltedTimestamp,
                                    ) +
                                    ' ago)'
                                  : ''),
                            ),
                            m(
                              'td',
                              {
                                class: 'px-6 py-4',
                                scope: 'row',
                                title: r.creationTimestamp,
                              },
                              window.utils.forHumans(r.creationTimestamp),
                            ),
                            m(
                              'td',
                              {
                                class: 'px-6 py-4',
                                scope: 'row',
                                title: r.lastUpdatedTimestamp,
                              },
                              window.utils.forHumans(r.lastUpdatedTimestamp),
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
            ...(selectedResource ? ['-translate-x-full'] : ['translate-x-0']),
          ),
        },
        [
          m(
            'div',
            {
              class: 'whitespace-pre leading-6 ml-6 relative mt-10',
            },

            selectedResource &&
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
                        if (selectedResource?.metadata?.name) {
                          window.invoke(
                            'k8s.stopPodLogs',
                            `${ClusterStream().currentNamespace}:${
                              selectedResource.metadata.name
                            }`,
                          );
                        }

                        selectedResource = null;
                        log = '';

                        if (!onCloseHooks.length) return;
                        for (let [channel, listener] of onCloseHooks) {
                          window.api.off(channel, listener);
                        }
                        onCloseHooks = [];
                      },
                    },
                    m(BackIcon),
                  ),

                  m(
                    'h1',
                    { class: 'ml-4' },
                    `Pod: ${selectedResource.metadata.name}`,
                  ),
                ],
              ),

            selectedResource &&
              m(
                'div',
                {
                  class: 'relative',
                },
                m(
                  'pre',
                  {
                    class:
                      'w-full text-left p-2 whitespace-pre-wrap break-all text-sm border border-gray-200 rounded-lg max-h-[80vh] overflow-auto',
                  },
                  m.trust(log),
                ),
              ),
          ),
        ],
      ),
    ],
  };
}
