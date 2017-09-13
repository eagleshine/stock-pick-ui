import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('stock-plot-all', 'Integration | Component | stock plot all', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{stock-plot-all}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#stock-plot-all}}
      template block text
    {{/stock-plot-all}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
