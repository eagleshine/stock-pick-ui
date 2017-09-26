import Ember from 'ember';
//import RSVP from 'rsvp';

export default Ember.Route.extend({
  model() {
    return this.get('store').findAll('sector');
  },
  actions: {
    setNavTitle(title) {
      this.controllerFor(this.routeName).set('navTitle', title);
    },

    search(searchTerm) {
      this.transitionTo('stocks.index', { queryParams: { sector: null, q: searchTerm }});
    },

    toggleSideNav() {
      this.controllerFor(this.routeName).toggleProperty('showSideNav');
    }
  },

  afterModel() {
    this.transitionTo('stocks');
  }
});
