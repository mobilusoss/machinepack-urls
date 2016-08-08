module.exports = {


  friendlyName: 'Resolve URL',


  description: 'Build a sanitized, fully-qualified version of the provided URL.',
  extendedDescription: 'Given a URL or URL segment, returns a fully-qualified URL with trailing slashes stripped off.  For example, if a valid protocol is provided (e.g. "https://") and the original URL contains no trailing slashes, the URL returned will be identical to what was passed in.  If the provided URL begins with "//", it will be replaced with "http://".  If the provided URL does not start with a usable protocol, "http://" will be prepended.  If the URL cannot be sanitized, the `invalid` exit will be triggered.',
  sync: true,
  sideEffects: 'cacheable',
  inputs: {
    url: {
      friendlyName: 'URL',
      example: 'www.example.com/search',
      description: 'The URL to sanitize, with or without the protocol prefix (e.g. "http://").',
      required: true
    }
  },
  exits: {
    success: {
      outputFriendlyName: 'Resolved URL',
      outputDescription: 'A sanitized, fully-qualified version of the input URL.',
      outputExample: 'http://www.example.com/search'
    },
    invalid: {
      description: 'The provided URL was not valid.'
    }
  },
  fn: function(inputs, exits) {

    // Get a handle to this pack.
    var Urls = require('../');

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
    if (!Urls.validate({string: fullyQualifiedUrl}).execSync()) {
      return exits.invalid();
    }

    // Return the fully-qualified URL through the `success` exit.
    return exits.success(fullyQualifiedUrl);
  },

};
