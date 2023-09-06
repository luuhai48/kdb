import m from 'mithril';
import stream from 'mithril/stream';

const loading = stream(false);

loading.map(() => m.redraw());

export default loading;
