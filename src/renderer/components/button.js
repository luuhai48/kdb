import m from 'mithril';
import { twMerge } from 'tailwind-merge';

const defaultClasses =
  'select-none text-white font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300';

const pillClasses = 'rounded-full';

const classes = {
  default: defaultClasses,
  success: twMerge(
    defaultClasses,
    'bg-green-700 hover:bg-green-800 focus:ring-green-300',
  ),
  error: twMerge(
    defaultClasses,
    'bg-red-700 hover:bg-red-800 focus:ring-red-300',
  ),
  warning: twMerge(
    defaultClasses,
    'bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300',
  ),
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
            ...(v.attrs.pill ? [pillClasses] : []),
          ),
          onclick: v.attrs.onclick ?? (() => {}),
        },
        v.attrs.text,
      ),
  };
}
