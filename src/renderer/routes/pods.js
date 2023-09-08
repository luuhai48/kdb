/// <reference path="../types.d.ts"/>
import m from 'mithril';

export default function () {
  return {
    view: () =>
      m(
        'div',
        m(
          'a',
          {
            href: '#!/',
            class: 'underline',
          },
          'Home',
        ),
      ),
  };
}
