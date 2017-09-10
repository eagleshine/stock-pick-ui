import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('stocks');
  this.route('stock', {path: 'stocks/:stock_id'}, function() {
    this.route('historical');
  });
});

export default Router;
