import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  namespace: 'api/v1/ticker',
  pathForType: function(modelName) {
    return modelName;
  }
});
