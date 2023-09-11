import m from 'mithril';
import stream from 'mithril/stream';

const modal = stream(false);

modal.map((v) => {
  if (v) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }
  m.redraw();
});

export default modal;
