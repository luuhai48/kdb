import m from 'mithril';
import { twMerge } from 'tailwind-merge';

export default function () {
  return {
    /**
     * @param {import('mithril').Vnode} v
     */
    view: (v) =>
      m.trust(`<svg class="${twMerge(
        'w-4 h-4',
        v.attrs.class,
      )}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"></path>
      </svg>`),
  };
}
