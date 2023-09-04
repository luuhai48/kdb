import m from 'mithril';

import Modal from './modal';
import AppState from './appstate';

export default function () {
  return {
    /**
     * @param {import('mithril').Vnode} v
     */
    view: (v) =>
      m('main', { class: 'p-4' }, [
        m('h1', { class: 'text-2xl font-bold my-2' }, 'KDB'),
        m('hr'),
        m('section', v.children),

        AppState().modal && m(Modal),
      ]),
  };
}
