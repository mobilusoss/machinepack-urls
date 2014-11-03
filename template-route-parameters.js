

/**
 * resolveDestinationUrl()
 *
 * @required {String} urlTemplate
 *                     e.g. '/api/v1/machines/:id/inputs/:key'
 *
 * @required {Object} routeParams
 *                     e.g. {id: 3, key: 'foo'}
 * @return {String}
 */
module.exports = {

  inputs: {
    urlTemplate: {
      example: '/api/v1/user/:id/friends/:friendId'
    },
    routeParams: {
      example: {}
    }
  },
  exits: {
    success: {
      example: '/api/v1/user/7/friends/aba213-a83192bf-d139-e139e'
    }
  },

  fn: function resolveDestinationUrl (inputs, xits) {
    var result = inputs.urlTemplate.match(/\:[^\/\:\.]+/g, function (x){
      console.log('HI',x);
    });
    return xits(null, result);
  }
};

// Usage:
// resolveDestinationUrl({urlTemplate: '/api/v1/machines/:id/inputs/:key', routeParams: {id:3, key: 'foo'}});

