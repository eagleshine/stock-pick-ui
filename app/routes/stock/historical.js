import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.get('store').findRecord('historical', this.paramsFor('stock').stock_id);
  },

  setupController(controller, model) {
    let historical = model.get('result');
    console.log(historical);

    controller.set('historical', historical);
    controller.set('hist', JSON.stringify(historical, null, 4));
  }
});
