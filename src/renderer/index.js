import m from 'mithril';

import Home from './routes/home';

m.route(document.body, '/', {
  '/': Home,
});

// =============================================================================

window.api.on('err', (_, err) => {
  console.error(err);
});
