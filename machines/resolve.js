module.exports = {


  friendlyName: 'Resolve URL',


  description: 'Build a sanitized, fully-qualified version of the provided URL.',


  extendedDescription: 'Given a URL, returns a fully-qualified URL with trailing slashes stripped off.  For example, if a valid protocol is provided (e.g. "https://") and the original URL contains no trailing slashes, the URL returned will be identical to what was passed in.  If the provided URL begins with "//", it will be replaced with "http://".  If the provided URL does not start with a usable protocol, "http://" will be prepended.  If the URL cannot be sanitized, the `error` exit will be triggered.',


  sync: true,


  sideEffects: 'cacheable',


  inputs: {

    url: {
      friendlyName: 'URL',
      description: 'The URL to resolve, with or without the protocol prefix (e.g. "http://").',
      extendedDescription: 'If a `baseUrl` is specified, then this URL should be specified as a URL path (e.g. "/foo").',
      example: 'www.example.com/search',
      required: true
    },

    baseUrl: {
      friendlyName: 'Base URL',
      description: 'Optional base URL to resolve against, with or without the protocol prefix (e.g. "http://").',
      extendedDescription: 'If specified, this _must_ include the hostname (e.g. `api.example.com`).  It may also include a path (e.g. `http://api.example.com/pets`).',
      example: 'https://api.example.com/pets'
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'Resolved URL',
      outputDescription: 'A sanitized, fully-qualified URL.',
      outputExample: 'http://www.example.com/search'
    }

  },


  fn: function(inputs, exits) {

    // Get a handle to this pack.
    var Urls = require('../');


    //  ╦╔═╗  ┌┐ ┌─┐┌─┐┌─┐  ┬ ┬┬─┐┬    ┬ ┬┌─┐┌─┐  ┌─┐┬─┐┌─┐┬  ┬┬┌┬┐┌─┐┌┬┐
    //  ║╠╣   ├┴┐├─┤└─┐├┤   │ │├┬┘│    │││├─┤└─┐  ├─┘├┬┘│ │└┐┌┘│ ││├┤  ││
    //  ╩╚    └─┘┴ ┴└─┘└─┘  └─┘┴└─┴─┘  └┴┘┴ ┴└─┘  ┴  ┴└─└─┘ └┘ ┴─┴┘└─┘─┴┘ooo
    if (inputs.baseUrl !== undefined) {
      // TODO
      throw new Error('TODO');
    }


    // --•
    //  ╔═╗╔╦╗╦ ╦╔═╗╦═╗╦ ╦╦╔═╗╔═╗
    //  ║ ║ ║ ╠═╣║╣ ╠╦╝║║║║╚═╗║╣
    //  ╚═╝ ╩ ╩ ╩╚═╝╩╚═╚╩╝╩╚═╝╚═╝ooo
    //  ┌─    ┌┐┌┌─┐  ┌┐ ┌─┐┌─┐┌─┐  ┬ ┬┬─┐┬    ┬ ┬┌─┐┌─┐  ┌─┐┬─┐┌─┐┬  ┬┬┌┬┐┌─┐┌┬┐    ─┐
    //  │───  ││││ │  ├┴┐├─┤└─┐├┤   │ │├┬┘│    │││├─┤└─┐  ├─┘├┬┘│ │└┐┌┘│ ││├┤  ││  ───│
    //  └─    ┘└┘└─┘  └─┘┴ ┴└─┘└─┘  └─┘┴└─┴─┘  └┴┘┴ ┴└─┘  ┴  ┴└─└─┘ └┘ ┴─┴┘└─┘─┴┘    ─┘
    // Otherwise, no `baseUrl` was provided.

    // Build our best attempt at a fully-qualified URL.
    var fullyQualifiedUrl = (function (){
      // If a protocol is already included in URL, leave it alone.
      if (inputs.url.match(/^(https?:\/\/|ftp:\/\/)/)) {
        return inputs.url;
      }
      // If protocol is invalid, but sort of makes sense ("//"), change it to `http`.
      else if (inputs.url.match(/^(\/\/)/)){
        return inputs.url.replace(/^\/\//, 'http://');
      }
      // Otherwise default to "http://" and prefix the provided URL w/ that.
      else {
        return 'http://'+inputs.url;
      }
    })();

    // Trim off any trailing slashes.
    fullyQualifiedUrl = fullyQualifiedUrl.replace(/\/*$/, '');

    // Now check that what we ended up with is actually valid.
    if (!Urls.isUrl({string: fullyQualifiedUrl}).execSync()) {
      return exits.error(new Error('The provided URL (`'+inputs.url+'`) was not a valid, fully-qualified URL.  Make sure it includes the hostname (e.g. "example.com").'));
    }

    // Return the fully-qualified URL through the `success` exit.
    return exits.success(fullyQualifiedUrl);
  }

};
