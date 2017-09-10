import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    sector: {
      refreshModel: true
    }
  },
  model(params) {
    return this.get('store').query('ticker', params);
  },

  actions: {
    goToTicker(ticker) {
      this.transitionTo('stock', ticker.id);
    }
  }
});
