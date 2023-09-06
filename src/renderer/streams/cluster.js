import m from 'mithril';
import stream from 'mithril/stream';

const clusters = stream({
  /** @type {string[]} */
  contexts: [],
  currentContext: '',
  currentNamespace: 'default',
});

clusters.map(() => m.redraw());

export default clusters;
