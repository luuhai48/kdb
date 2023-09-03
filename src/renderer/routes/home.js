import m from 'mithril';

const Home = {
  view: function () {
    return m('main', [m('h1', { class: 'title' }, 'KDB')]);
  },
};

export default Home;
