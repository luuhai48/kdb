import m from 'mithril';

import Select from '../components/select';
import ClustersStream from '../streams/cluster';
import NamespaceStream from '../streams/namespace';

export default function () {
  return {
    view: () =>
      m('div', { class: 'max-w-screen-xl mx-auto p-4' }, [
        m(Select, {
          options: ClustersStream().contexts,
          selected: ClustersStream().currentContext,
          placeholder: 'Select cluster',
        }),

        m('div', {
          class: 'w-5 inline-block',
        }),

        NamespaceStream().length &&
          m(Select, {
            options: NamespaceStream(),
            selected: ClustersStream().currentNamespace || 'default',
            placeholder: 'Select namespace',
          }),
      ]),
  };
}
