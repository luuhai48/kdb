import m from 'mithril';
import { twMerge } from 'tailwind-merge';

export default () => ({
  /**
   * @param {import('mithril').Vnode} v
   */
  view: (v) =>
    m(
      'div',
      { class: 'relative mt-7 inline-block' },
      m(
        'select',
        {
          class: twMerge(
            'cursor-pointer bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5',
            v.attrs.class || '',
          ),
          id: v.attrs.id,
          ...(v.attrs.onchange && {
            onchange: v.attrs.onchange,
          }),
        },

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

      m(
        'label',
        {
          class: 'absolute -top-7 left-1',
        },
        v.attrs.placeholder ?? 'Select value',
      ),
    ),
});
