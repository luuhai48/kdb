import m from 'mithril';
import { twMerge } from 'tailwind-merge';

export default () => ({
  /**
   * @param {import('mithril').Vnode} v
   */
  view: (v) =>
    m(
      'fieldset',
      { class: 'inline-block border border-gray-200 rounded-lg' },

      v.attrs.label && m('legend', { class: 'text-sm ml-3' }, v.attrs.label),

      m(
        'select',
        {
          class: twMerge(
            'cursor-pointer bg-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500',
            v.attrs.class || '',
          ),
          id: v.attrs.id,
          ...(v.attrs.onchange && {
            onchange: v.attrs.onchange,
          }),
        },

        v.attrs.placeholder &&
          m(
            'option',
            { selected: true, disabled: true },
            ` -- ${v.attrs.placeholder || 'Select value'} -- `,
          ),

        ...(v.attrs.options || []).map((option) =>
          m(
            'option',
            {
              value: option,
              ...(v.attrs.selected === option && { selected: true }),
            },
            option,
          ),
        ),
      ),
    ),
});
