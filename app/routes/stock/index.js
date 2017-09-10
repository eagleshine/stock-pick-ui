import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.get('store').findRecord('info', this.paramsFor('stock').stock_id);
  },

  setupController(controller, model) {
    let info = model.get('result')[0];
    const businessSummary = info.assetProfile.longBusinessSummary;
    delete info.assetProfile.longBusinessSummary;

    let result = JSON.stringify(info, null, 4);
    controller.set('result', result);
    controller.set('ticker', this.paramsFor('stock').stock_id);
    controller.set('businessSummary', businessSummary);
  },

  actions: {
    transitionToHistorical() {
      this.transitionTo('stock.historical');
    }
  }
});
