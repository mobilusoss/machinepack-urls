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

  fn: function (inputs, xits) {
    var result = inputs.urlTemplate.replace(/(\:[^\/\:\.]+)/g, function ($all, $1){
      var routeParamName = $1.replace(/^\:/, '');
      return inputs.routeParams[routeParamName];
    });
    return xits(null, result);
  }
};

