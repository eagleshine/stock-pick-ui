import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  attrs: {
    sector: 'Sector',    
    symbol: 'Symbol',
	name: 'Name',
	marketCap: 'MarketCap',
	ipoYear: 'IPOyear',
	industry: 'Industry',
	link: 'Summary Quote',
	source: 'source',
  }
});
