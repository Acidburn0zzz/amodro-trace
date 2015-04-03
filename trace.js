'use strict';
var Prom = require('./lib/prom'),
    loader = require('./lib/loader/loader');

/**
 * Returns the set of nested dependencies for a given module ID in the options.
 * @param  {Object} options the set of options for trace. Possible options:
 * - id: the module ID to trace.
 * @param  {Object} loaderConfig the requirejs loader config to use for tracing
 * and finding modules.
 * @return {Object} The trace result.
 */
module.exports = function trace(options, loaderConfig) {
  return new Prom(function(resolve, reject) {
    // Validate the options.
    if (!options.id) {
      reject(new Error('options must include "id" ' +
                       'to know what module ID to trace'));
      return;
    }

    var loaderResult = loader.create(),
        instance = loaderResult.instance;

    if (loaderConfig) {
      loader.getContext(loaderResult.id).configure(loaderConfig);
    }

    function onOk() {
      // Pull out the list of IDs for this layer as the return value.
      var context = loader.getContext(loaderResult.id);
      loader.discard(loaderResult.id);

      resolve(context._layer.buildFilePaths);
    }

    // Inform requirejs that we want this function executed when done.
    onOk.__requireJsBuild = true;

    instance([options.id], onOk, function(err) {
      reject(err);
    });
  });
};
