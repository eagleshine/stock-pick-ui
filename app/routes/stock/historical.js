import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.get('store').findRecord('historical', this.paramsFor('stock').stock_id);
  },

  setupController(controller, model) {
    let historical = model.get('result')[0];
    //console.log(historical);
    let meta = historical.meta;
    let timestamp = historical.timestamp;
    let events = historical.events;
    let quote = historical.indicators.quote[0];

    let data = [];
    for (let i = 0; i < timestamp.length; i++) {
      data.push({
        date: new Date(timestamp[i]*1000).toLocaleDateString('en-GB', {
          day : 'numeric',
          month : 'short',
          year : '2-digit'
        }).split(' ').join('-'),
        open: +quote.open[i],
        high: +quote.high[i],
        low: +quote.low[i],
        close: +quote.close[i],
        volume: +quote.volume[i]
      });
    }

    const width = window.screen.availWidth * 0.79;

    controller.set('meta', meta);
    controller.set('events', events);
    controller.set('data', data);
    controller.set('width', width);
    controller.set('hist', JSON.stringify(historical, null, 4));

    console.log(data);
  },

  afterModel(model, transition) {
    const _this = this;
    transition.then(function() {
      model.currentUrl = _this.get('router.url');
    });
  },

  actions: {
    didTransition: function() {
      let navTitle = this.paramsFor('stock')
        .stock_id.toUpperCase();
      this.send('setNavTitle', navTitle);
    }
  }
});
