import m from 'mithril';

const Home = {
  view: function () {
    return m('main', [
      m('h1', { class: 'title text-center text-2xl font-bold' }, 'KDB'),
    ]);
  },
};

export default Home;
