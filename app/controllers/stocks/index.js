import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['sector', 'start', 'size'],
  sector: null,
  start: null,
  size: null,
});
