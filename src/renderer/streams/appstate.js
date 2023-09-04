import m from 'mithril';
import stream from 'mithril/stream';

const appstate = stream({
  modal: false,
});

appstate.map(() => m.redraw());

export default appstate;
