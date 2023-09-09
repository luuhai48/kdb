import m from 'mithril';
import { twMerge } from 'tailwind-merge';

const defaultClasses =
  'select-none text-white text-sm rounded-lg py-2 px-3 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 active:bg-blue-600';

const pillClasses = 'rounded-full';

const classes = {
  default: defaultClasses,
  success: twMerge(
    defaultClasses,
    'bg-green-700 hover:bg-green-800 focus:ring-green-300 active:bg-green-600',
  ),
  error: twMerge(
    defaultClasses,
    'bg-red-700 hover:bg-red-800 focus:ring-red-300 active:bg-red-600',
  ),
  warning: twMerge(
    defaultClasses,
    'bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300 active:bg-yello-600',
  ),
  copy: 'text-sm inline-flex items-center px-3 py-2 text-gray-600 hover:text-blue-700 border rounded-lg active:bg-gray-200',
  noBorder:
    'text-sm inline-flex p-2 text-gray-600 hover:text-blue-700 rounded-lg hover:bg-gray-100 active:bg-gray-200',
};

export default function () {
  return {
    /**
     * @param {import('mithril').Vnode} v
     */
    view: (v) =>
      m(
        'button',
        {
          class: twMerge(
            classes[v.attrs.type ?? 'default'],
            v.attrs.pill ? pillClasses : '',
            v.attrs.class || '',
          ),
          title: v.attrs.title,
          onclick: (e) => {
            if (v.attrs.onclick) {
              v.attrs.onclick(e);
            }

            if (v.attrs.type === 'copy') {
              e.target.innerHTML = e.target.innerHTML.replace(
                v.attrs.text,
                'Copied',
              );
              setTimeout(() => {
                e.target.innerHTML = e.target.innerHTML.replace(
                  'Copied',
                  v.attrs.text,
                );
              }, 3000);
            }
          },
        },
        v.attrs.type === 'copy'
          ? [
              m.trust(`<svg class="w-3.5 h-3.5 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                <path d="M5 9V4.13a2.96 2.96 0 0 0-1.293.749L.879 7.707A2.96 2.96 0 0 0 .13 9H5Zm11.066-9H9.829a2.98 2.98 0 0 0-2.122.879L7 1.584A.987.987 0 0 0 6.766 2h4.3A3.972 3.972 0 0 1 15 6v10h1.066A1.97 1.97 0 0 0 18 14V2a1.97 1.97 0 0 0-1.934-2Z"></path>
                <path d="M11.066 4H7v5a2 2 0 0 1-2 2H0v7a1.969 1.969 0 0 0 1.933 2h9.133A1.97 1.97 0 0 0 13 18V6a1.97 1.97 0 0 0-1.934-2Z"></path>
              </svg>`),
              v.attrs.text,
            ]
          : v.attrs.text,
        v.children,
      ),
  };
}
