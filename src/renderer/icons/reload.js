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
      )}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 1v5h-5M2 19v-5h5m10-4a8 8 0 0 1-14.947 3.97M1 10a8 8 0 0 1 14.947-3.97"/>
      </svg>`),
  };
}
