import m from 'mithril';
import stream from 'mithril/stream';

const clusters = stream({
  /** @type {string[]} */
  contexts: [],
  currentContext: '',
});

clusters.map(() => m.redraw());

export default clusters;
