import m from 'mithril';
import { twMerge } from 'tailwind-merge';

export default () => ({
  /**
   * @param {import('mithril').Vnode} v
   */
  view: (v) =>
    m(
      'select',
      {
        class: twMerge(
          'cursor-pointer bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5',
          v.attrs.class || '',
        ),
      },

      m(
        'option',
        { selected: true, disabled: true },
        v.attrs.placeholder ?? ' -- Select value -- ',
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
});
