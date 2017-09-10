import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  namespace: 'api/v1/chart',
  pathForType: function(modelName) {
    return modelName;
  }
});
