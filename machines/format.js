module.exports = {

  friendlyName: 'Format URL',


  description: 'Build a URL from a template string and a set of route parameters.',


  extendedDescription: 'Template is in the standard express/backbone format.',


  sync: true,


  sideEffects: 'cacheable',


  inputs: {
    urlTemplate: {
      friendlyName: 'URL template',
      description: 'The URL template, consisting of zero or more colon-prefixed tokens.',
      example: '/api/v1/user/:id/friends/:friendId',
      required: true
    },
    data: {
      description: 'An object of key/value pairs to use as url path parameter values.',
      example: {},
      required: true
    }
  },


  exits: {
    success: {
      outputFriendlyName: 'Formatted URL',
      outputDescription: 'The result of applying the given route parameters to the input template.',
      outputExample: '/api/v1/user/7/friends/aba213-a83192bf-d139-e139e'
    }
  },

  fn: function (inputs, exits) {
    var _ = require('lodash');

    var result = inputs.urlTemplate.replace(/(\:[^\/\:\.]+)/g, function ($all, $1){
      var routeParamName = $1.replace(/^\:/, '');
      if (_.isUndefined(inputs.data[routeParamName]) || _.isNull(inputs.data[routeParamName])) {
        return '';
      }
      return inputs.data[routeParamName];
    });
    return exits.success(result);
  }
};

