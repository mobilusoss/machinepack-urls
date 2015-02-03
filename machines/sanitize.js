module.exports = {
  friendlyName: 'Resolve URL',
  description: 'Build a fully-qualified version of the provided URL (i.e. with "http://")',
  extendedDescription: 'Given a URL or URL segment, returns the fully-qualified version including the protocol (e.g. "http://").  This is sort of like path.resolve() from Node core, but for URLs instead of filesystem paths.',
  inputs: {
    url: {
      friendlyName: 'URL',
      example: 'http://www.example.com',
      description: 'The URL to resolve',
      required: true
    }
  },
  defaultExit: 'success',
  exits: {
    error: {
      description: 'Unexpected error occurred.'
    },
    success: {
      description: 'URL resolved successfully.',
      example: 'http://somedomain.com/search'
    },
    invalid: {
      description: 'The provided URL is not valid.'
    }
  },
  fn: function(inputs, exits) {

    // If a protocol is already included in URL, leave it alone
    if (inputs.url.match(/^(http:\/\/|https:\/\/)/)) {
      return exits.success(inputs.url);
    }
    // If protocol is invalid, but sort of makes sense ("//"), change it to `http`
    else if (inputs.url.match(/^(\/\/)/)){
      return exits.success('http:'+inputs.url);
    }
    // Otherwise default to "http://" and prefix the provided URL w/ that
    else {
      return exits.success('http://'+inputs.url);
    }
  },

};
