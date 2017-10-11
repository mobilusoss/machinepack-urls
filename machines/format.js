module.exports = {

  friendlyName: 'Format URL',


  description: 'Build a URL from a template and a set of dynamic data.',


  extendedDescription: 'URL template is in the standard format used by Sails.js / Express / Backbone / Vue.js / etc.',


  sync: true,


  sideEffects: 'cacheable',


  inputs: {

    urlTemplate: {
      friendlyName: 'URL template',
      description: 'The URL template, consisting of zero or more colon-prefixed tokens (also known as "pattern variables", "route parameters", or "URL path parameters").',
      extendedDescription: 'This template can be a path like `/foo/bar`, or a canonical URL such as `https://example.com/foo/bar`.  But the provided URL template should never contain the querystring (`?foo=bar&baz`) or fragment (`#foo`) parts.',
      example: '/api/v1/user/:id/friends/:friendId',
      required: true
    },

    data: {
      description: 'A dictionary of key/value pairs to use as values for URL path parameters.',
      example: {},
      required: true
    }

  },


  exits: {
    success: {
      outputFriendlyName: 'Formatted URL',
      outputDescription: 'The result of applying data to a URL template.',
      outputExample: '/api/v1/user/7/friends/aba213-a83192bf-d139-e139e'
    }
  },

  fn: function (inputs, exits) {

    // Import `lodash`.
    var _ = require('@sailshq/lodash');

    // Use `replace` with a custom replacer function to substitute actual param values for tokens.
    var result = inputs.urlTemplate.replace(/(\:[^\/\:\.]+)/g, function ($all, $1){
      // Get the name of the param that this token represents.
      var routeParamName = $1.replace(/^\:/, '');
      // If we don't have a value for this param in the `data` input, replace it with an empty string.
      if (_.isUndefined(inputs.data[routeParamName]) || _.isNull(inputs.data[routeParamName])) {
        return '';
      }
      // Otherwise replace the token with the value for this param in the `data` input.
      return inputs.data[routeParamName];
    });

    // Return the result through the `success` exit.
    return exits.success(result);
  }
};

