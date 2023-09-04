import m from 'mithril';
import stream from 'mithril/stream';

const modal = stream({
  modal: false,
});

modal.map(() => m.redraw());

export default modal;
