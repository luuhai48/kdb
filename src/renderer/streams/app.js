import m from 'mithril';
import stream from 'mithril/stream';

const app = stream({
  version: 'unknown',
});

app.map(() => m.redraw());

export default app;
