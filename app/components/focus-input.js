import Ember from 'ember';

export default Ember.TextField.extend({
  becomeFocused: Ember.on('didInsertElement', function() {
    this.$().focus();
  })
});
