import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    sector: {
      refreshModel: true
    }, 
    start: {
      refreshModel: true
    },
    size: {
      refreshModel: true
    }
  },
  model(params) {
    return this.get('store').query('ticker', params);
  },

  actions: {
    didTransition: function() {
      let sector = this.controllerFor(this.routeName).get('sector');
      let navTitle = sector || 'All';
      this.send('setNavTitle', navTitle);
    },
    goToTicker(ticker) {
      this.transitionTo('stock', ticker.id);
    }
  }
});
