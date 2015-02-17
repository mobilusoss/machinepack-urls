module.exports = {


  friendlyName: 'Parse URL',


  description: 'Parse metadata from a URL.',


  sync: true,


  cacheable: true,


  extendedDescription: '',


  inputs: {

    url: {
      description: 'The URL to parse',
      example: 'http://www.example.com/search',
      required: true
    }

  },


  defaultExit: 'success',


  exits: {

    error: {
      description: 'Unexpected error occurred.'
    },

    invalid: {
      description: 'URL could not be parsed'
    },

    success: {
      description: 'Done.',
      example: {
        protocol: 'http:',
        slashes: true,
        auth: '',
        host: 'google.com',
        port: 80,
        hostname: 'google.com',
        hash: '',
        search: '',
        query: {},
        pathname: '/',
        path: '/',
        href: 'http://google.com/'
      }
    }

  },


  fn: function(inputs, exits) {

    var Url = require('url');
    var sanitizeUrl = require('machine').build(require('./sanitize'));

    var sanitizedUrl;
    try {
      sanitizedUrl = sanitizeUrl({url: inputs.url}).execSync();
    }
    catch (e) {
      if (e.exit === 'invalid') return exits.invalid();
      return exits.error(e);
    }

    var parsedUrl = Url.parse(sanitizedUrl);
    if (!parsedUrl.port) {
      if (sanitizedUrl.match(/https/)) {
        parsedUrl.port = 443;
      }
      else {
        parsedUrl.port = 80;
      }
    }

    return exits.success(parsedUrl);
  },

};
