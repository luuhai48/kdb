import m from 'mithril';
import stream from 'mithril/stream';

const modal = stream(false);

modal.map(() => m.redraw());

export default modal;
