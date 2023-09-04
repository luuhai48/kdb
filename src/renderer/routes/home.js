import m from 'mithril';

export default function (contexts) {
  return m({
    view: function () {
      return m('div', { class: 'max-w-screen-xl mx-auto p-4' }, [
        m(
          'select',
          {
            class:
              'cursor-pointer bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
          },

          m('option', { selected: true, disabled: true }, 'Choose cluster'),
          ...(contexts || []).map((option) =>
            m(
              'option',
              {
                value: option.value,
                ...(option.selected && { selected: true }),
              },
              option.value,
            ),
          ),
        ),
      ]);
    },
  });
}
