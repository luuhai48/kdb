import m from 'mithril';
import stream from 'mithril/stream';

/** @type {stream<string[]>} */
const namespaces = stream([]);

namespaces.map(() => m.redraw());

export default namespaces;
