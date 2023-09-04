import m from 'mithril';

import Select from '../components/select';
import ClustersStream from '../streams/cluster';

export default function () {
  return {
    view: () =>
      m('div', { class: 'max-w-screen-xl mx-auto p-4' }, [
        m(Select, {
          options: ClustersStream().contexts,
          selected: ClustersStream().currentContext,
          placeholder: ' -- Select cluster -- ',
        }),
      ]),
  };
}
