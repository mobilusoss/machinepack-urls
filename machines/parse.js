module.exports = {


  friendlyName: 'Parse URL',


  description: 'Parse metadata from a URL.',


  sync: true,


  sideEffects: 'cacheable',


  inputs: {

    url: {
      description: 'The URL to parse.',
      example: 'http://www.example.com/search',
      required: true
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'Parsed URL',
      outputDescription: 'Information obtained by parsing the input URL.',
      outputExample: {
        protocol: 'redis:',
        auth: '',
        port: 80,
        hostname: 'google.com',
        hash: '',
        search: '',
        path: '/',
      }
    }

  },


  fn: function(inputs, exits) {

    // Import `url`.
    var Url = require('url');

    // Use the `parse` function of the `url` package to get information about the given URL.
    var parsedUrl = Url.parse(inputs.url);

    // Attempt to infer port if it doesn't exist.
    if (!parsedUrl.port) {
      if (parsedUrl.protocol === 'https:') {
        parsedUrl.port = 443;
      }
      else {
        parsedUrl.port = 80;
      }
    }

    // Return the parsed URL info through the `success` exit.
    return exits.success(parsedUrl);
  },

};
