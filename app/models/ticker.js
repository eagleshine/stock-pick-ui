import DS from 'ember-data';

export default DS.Model.extend({
  sector: DS.attr('string'),
  symbol: DS.attr('string'),
  name: DS.attr('string'),
  marketCap: DS.attr('string'),
  ipoYear: DS.attr('string'),
  industry: DS.attr('string'),
  link: DS.attr('string'),
  source: DS.attr('string')
});
