import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    search(searchTerm) {
      this.set('showSearch', false);
      this.get('onSearch')(searchTerm);
    }
  }
});
