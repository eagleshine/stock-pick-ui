import DS from 'ember-data';

export default DS.Model.extend({
  result: DS.attr('json'),
  error: DS.attr('json')
});
