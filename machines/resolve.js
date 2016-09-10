module.exports = {


  friendlyName: 'Resolve URL',


  description: 'Build a sanitized, fully-qualified version of the provided URL.',


  extendedDescription:
  'Given a URL, this returns a fully-qualified URL with trailing slashes stripped off.  It also infers a protocol, if necessary.  '+
  'For example, if a valid protocol is provided (e.g. "https://") and the original URL contains no trailing slashes, the URL '+
  'returned will be identical to what was passed in.  If the provided URL begins with "//", it will be replaced with "http://".  '+
  'If the provided URL does not start with a usable protocol (e.g. "google.com"), then "http://" will be prepended.  If the URL '+
  'cannot be sanitized (e.g. if it is missing a hostname, or altogether malformed), then the `error` exit will be triggered.  '+
  'In other words, if `/foo/bar` is passed in as the URL (and assuming the optional base URL is not provided), then this machine '+
  'will fail.\n'+
  '\n'+
  '### Resolving relative to a base URL\n'+
  'Optionally, this machine _also_ allows a base URL (`baseUrl`) to be provided.  This allows a URL path (like `/foo/bar`) to be '+
  'provided as the primary URL, as long as a valid URL with a hostname is provided as the base URL.  To stick with our example from '+
  'above, if `/foo/bar` is passed in as the primary URL (`url`), and a valid base URL-- say, `api.example.com/pets` _is also provided_, '+
  'then, instead of failing, this machine will return `http://api.example.com/pets/foo/bar`.\n'+
  '\n'+
  '### URL encoding\n'+
  '> This also ensures that the provided URL strings do not contain invalid characters by escaping spaces as `%20`, etc.\n'+
  '> See [the Node.js docs](https://nodejs.org/api/url.html#url_escaped_characters) for reference.'+
  '',


  sync: true,


  sideEffects: 'cacheable',


  inputs: {

    url: {
      friendlyName: 'URL',
      description: 'The URL to resolve, with or without the protocol prefix (e.g. "http://").',
      extendedDescription: 'If a `baseUrl` is specified, then this URL should be specified as a URL path (e.g. "/foo").  Otherwise, this _must_ include the hostname (e.g. `api.example.com`).',
      example: 'www.example.com/search',
      required: true
    },

    baseUrl: {
      friendlyName: 'Base URL',
      description: 'Optional base URL to resolve against, with or without the protocol prefix (e.g. "http://").',
      extendedDescription: 'If specified, this _must_ include the hostname (e.g. `api.example.com`).  It may also include a path (e.g. `http://api.example.com/pets`).',
      example: 'api.example.com/pets'
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

    // Import the `url` module from Node core.
    var url = require('url');

    // Import the `path` module from Node core.
    var path = require('path');

    // Get a handle to this pack.
    var Urls = require('../');


    // Resolve either the `url` or the `baseUrl` (if one was provided.)
    //
    // > If a `baseUrl` WAS provided, once it is resolved (and valid),
    // > treat the primary `url` as a path, and resolve it relative to
    // > the base URL.
    var fullyQualifiedUrl = (function _resolveEitherUrlOrBaseUrl(opts){

      //  ╦╔═╗  ┌┐ ┌─┐┌─┐┌─┐  ┬ ┬┬─┐┬    ┬ ┬┌─┐┌─┐  ┌─┐┬─┐┌─┐┬  ┬┬┌┬┐┌─┐┌┬┐
      //  ║╠╣   ├┴┐├─┤└─┐├┤   │ │├┬┘│    │││├─┤└─┐  ├─┘├┬┘│ │└┐┌┘│ ││├┤  ││
      //  ╩╚    └─┘┴ ┴└─┘└─┘  └─┘┴└─┴─┘  └┴┘┴ ┴└─┘  ┴  ┴└─└─┘ └┘ ┴─┴┘└─┘─┴┘ooo
      if (inputs.baseUrl !== undefined) {
        var resolvedBaseUrl = opts.handleResolvingUrl(inputs.baseUrl);
        if (resolvedBaseUrl === '') {
          throw new Error('The provided base URL (`'+inputs.baseUrl+'`) was not a valid, fully-qualified URL.  Make sure it includes the hostname (e.g. "example.com").');
        }

        var baseUrlInfo = url.parse(inputs.baseUrl);
        if (baseUrlInfo.search) {
          throw new Error('The provided base URL (`'+inputs.baseUrl+'`) contains a query string (`'+baseUrlInfo.search+'`).  But if a base URL is provided, it should _never_ contain a query string.  That is only allowed in the primary URL (`url`).');
        }
        if (baseUrlInfo.hash) {
          throw new Error('The provided base URL (`'+inputs.baseUrl+'`) contains a hash/fragment (`'+baseUrlInfo.hash+'`).  But if a base URL is provided, it should _never_ contain a URL fragment.  That is only allowed in the primary URL (`url`).');
        }

        // Ensure protocol.
        if (!baseUrlInfo.protocol) {
          baseUrlInfo.protocol = 'http:';
          baseUrlInfo.slashes = true;
        }

        // Squish together any repeated adjacent slashes that appear in the path
        // (e.g. "http://foo///bar//z/////d.jpg" => "http://foo/bar/z/d.jpg")
        baseUrlInfo.pathname = baseUrlInfo.pathname.replace(/\/+/g, '/');

        // Trim trailing slashes in pathname.
        baseUrlInfo.pathname = baseUrlInfo.pathname.replace(/\/*$/, '');

        var coercedBaseUrl = url.format(baseUrlInfo);

        // --• If we're here, then we have a safe, fully-qualified version of the `baseUrl`.

        // Now we'll assume that the provided `url` is a valid URL path.
        // But verify that first, just to be safe.
        //
        // > Note that we're not particularly draconian here.  That's because we're using Node's built-in
        // > `url` module below, and it's pretty tolerant (it trims whitespace and adds leading slashes,
        // > URL encodes, etc.)  So our goal is just to catch some of the major stuff that would normally
        // > slip through the cracks and cause `url.resolve()` to fail silently in an unexpected way.
        if (inputs.url.match(/^(https?:\/\/|ftp:\/\/)/)) {
          throw new Error('The provided primary URL (`'+inputs.url+'`) has an unexpected format.  Because a base URL (`'+inputs.baseUrl+'`) was also specified, the primary URL should be provided as a URL path, like "/foo/bar".  It should not begin with a protocol like "http://".');
        }

        // Now resolve the `url` relative to the the `baseUrl` using Node's `url.resolve()`.
        // (This also escapes characters like spaces, etc.)
        //
        // > But before doing so, note that we remove any leading slashes
        // > (this is because `url.resolve()` acts like href resolution in the browser- and we don't want that.)
        var primaryUrlWithoutLeadingSlashes = inputs.url.replace(/^\/+/,'');
        var finalResolvedUrl = url.resolve(resolvedBaseUrl, primaryUrlWithoutLeadingSlashes);

        // Now, one last time, trim off any trailing slashes.
        finalResolvedUrl = finalResolvedUrl.replace(/\/*$/, '');

        // And that's it!
        return finalResolvedUrl;
      }// ‡
      //  ╔═╗╔╦╗╦ ╦╔═╗╦═╗╦ ╦╦╔═╗╔═╗
      //  ║ ║ ║ ╠═╣║╣ ╠╦╝║║║║╚═╗║╣
      //  ╚═╝ ╩ ╩ ╩╚═╝╩╚═╚╩╝╩╚═╝╚═╝ooo
      //  ┌─    ┌┐┌┌─┐  ┌┐ ┌─┐┌─┐┌─┐  ┬ ┬┬─┐┬    ┬ ┬┌─┐┌─┐  ┌─┐┬─┐┌─┐┬  ┬┬┌┬┐┌─┐┌┬┐    ─┐
      //  │───  ││││ │  ├┴┐├─┤└─┐├┤   │ │├┬┘│    │││├─┤└─┐  ├─┘├┬┘│ │└┐┌┘│ ││├┤  ││  ───│
      //  └─    ┘└┘└─┘  └─┘┴ ┴└─┘└─┘  └─┘┴└─┴─┘  └┴┘┴ ┴└─┘  ┴  ┴└─└─┘ └┘ ┴─┴┘└─┘─┴┘    ─┘
      else {
        var resolvedPrimaryUrl = opts.handleResolvingUrl(inputs.url);
        if (resolvedPrimaryUrl === '') {
          throw new Error('The provided URL (`'+inputs.url+'`) was not a valid, fully-qualified URL.  Make sure it includes the hostname (e.g. "example.com"), or leave this primary URL as a path like "/foo/bar" and include a base URL (e.g. "api.example.com/pets").');
        }

        // Now use Node's `url.resolve()` to escape characters.
        resolvedPrimaryUrl = url.resolve(resolvedPrimaryUrl, '');

        return resolvedPrimaryUrl;
      }

    })({

      /**
       * handleResolvingUrl()
       *
       * @param  {String} origUrl
       *
       * @returns {String}
       *         The fully-qualified version of the provided `origUrl`.
       *         (Or empty string, if it fails.)
       */
      handleResolvingUrl: function (origUrl){

        // Build our best attempt at a fully-qualified URL.
        var fullyQualifiedUrl = (function _ensureProtocol(){
          // If a protocol is already included in URL, leave it alone.
          if (origUrl.match(/^([a-z][a-z0-9]+:\/\/)/)) {
            return origUrl;
          }
          // If protocol is invalid, but sort of makes sense ("//"), change it to `http`.
          else if (origUrl.match(/^(\/\/)/)){
            return origUrl.replace(/^\/\//, 'http://');
          }
          // Otherwise default to "http://" and prefix the provided URL w/ that.
          else {
            return 'http://'+origUrl;
          }
        })();

        // Trim off any trailing slashes.
        fullyQualifiedUrl = fullyQualifiedUrl.replace(/\/*$/, '');

        // Squish together any repeated adjacent slashes that appear after the protocol
        // (e.g. "http://foo///bar//z/////d.jpg" => "http://foo/bar/z/d.jpg")
        var pieces = fullyQualifiedUrl.split(/^([a-z][a-z0-9]+:\/\/)/);
        console.log(fullyQualifiedUrl, pieces);
        if (pieces.length < 3) { throw new Error('Consistency violation: Internal error in mp-urls (should always be able to split fully qualified URL on its protocol!  But could not properly split: `'+fullyQualifiedUrl+'`)'); }
        var justTheProtocol = pieces[1];
        var everythingButProtocol = pieces.slice(2).join('');
        fullyQualifiedUrl = justTheProtocol + everythingButProtocol.replace(/\/+/g, '/');
        console.log('after:',fullyQualifiedUrl);

        // Now use Node's `url.resolve()` to escape characters like spaces.
        fullyQualifiedUrl = url.resolve(fullyQualifiedUrl, '');

        // Now check that what we ended up with is actually valid.
        if (!Urls.isUrl({string: fullyQualifiedUrl}).execSync()) {
          return '';
        }

        return fullyQualifiedUrl;
      }//</lamda definition :: handleResolvingUrl>
    });//</self-calling function>

    // --•
    // Now, if we made it here, return the fully-qualified URL through
    // the `success` exit.
    return exits.success(fullyQualifiedUrl);
  }


};
