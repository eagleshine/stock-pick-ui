import Ember from 'ember';
import InfinityRoute from "ember-infinity/mixins/route";

export default Ember.Route.extend(InfinityRoute, {
  queryParams: {
    sector: {
      refreshModel: true
    }
  },

  // custom ember-infinity param
  perPageParam: 'size',
  pageParam: 'page',
  totalPagesParam: 'meta.total',

  model(params) {
    return this.infinityModel('ticker', {
      perPage: 25,
      startingPage: 1,
      sector: params.sector
    });
  },

  //infinityModelUpdated({ lastPageLoaded, totalPages, newObjects }) {
  //  Ember.Logger.info('updated with more items, total pages:' + totalPages);
  //},

  //infinityModelLoaded({ totalPages }) {
  //  Ember.Logger.info('no more items to load');
  //},

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
