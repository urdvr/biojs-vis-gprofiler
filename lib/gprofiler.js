
/**
 * Construct a GProfiler object.
 *
 * @constructor
 */

function GProfiler() {
  this.$ = require('jquery-browserify');

  var attrs = {
    API_ROOT_URL  : 'https://biit.cs.ut.ee/gprofiler/api/gost/profile/',
    GP_ROOT_URL   : 'https://biit.cs.ut.ee/gprofiler/gost/',
    MAX_URL_LEN   : 4096,
    activeQuery   : undefined
  };

  this.$.extend(this, attrs);
}

/**
 * Query g:Profiler.
 *
 * @function
 * @param {Object} attrs - g:Profiler query attributes. See
 *  [g:Profiler](http://biit.cs.ut.ee/gprofiler) for detailed documentation on
 *  these parameters.
 * @param {Function} cb - A callback function receiving the result object from
 *  a g:Profiler query.
 *
 * Fields of _attrs_:
 *
 * @property {Array} query - A list of query symbols. _required_
 * @property {String} organism -  The organism name in g:Profiler format,
 *  generally the first character of the genus + species in lowercase. E.g.
 *  "Mus musculus" -> "mmusculus". _default_: hsapiens
 * @property {boolean} significant - Only return statistically significant
 *  results. _default_: true
 * @property {boolean} orderedQuery - Ordered query. _default_: false.
 * @property {boolean} regionQuery - The query consists of chromosomal
 *  regions. _default_: false.*
 * @property {boolean} excludeIEA - Exclude electronic GO annotations.
 *  _default_: false.
 * @property {boolean} underrep - Measure underrepresentation. _default_: false.
 * @property {String} hierFiltering - Hierarchical filtering, one of "none",
 *  "moderate", "strong". _default_: none.
 * @property {float} maxPValue - Custom p-value threshold. _default_: 1.0.
 * @property {int} minSetSize - Minimum size of functional category.
 * @property {int} maxSetSize - Maximum size of functional category.
 * @property {String} correctionMethod - Algorithm used for determining the
 *  significance threshold, one of "gSCS", "fdr", "bonferroni". _default_:
 *  "gSCS".
 * @property {String} domainSize - Statistical domain size, one of "annotated",
 *  "known". _default_: annotated.
 * @property {String} numericNS - Namespace to use for fully numeric IDs.
 * @property {Array} customBG - Array of symbols to use as a statistical
 *  background.
 * @property {Array} srcFilter - Array of data sources to use. Currently these
 *  include GO (GO:BP, GO:MF, GO:CC to select a particular GO branch), KEGG,
 *  REAC, TF, MI, CORUM, HP. Please see the
 *  [g:GOSt web tool](http://biit.cs.ut.ee/gprofiler/) for the comprehensive
 *  list and details on incorporated data sources.
 */

GProfiler.prototype.query = function(attrs, cb) {
  var _this = this;
  var $ = _this.$;
  var url = _this.API_ROOT_URL;
  var postdata = {};

  if (!cb || !(cb instanceof Function))
    throw new Error('The cb parameter is required and must be a function');

  $.extend(postdata, _this.getQueryParams(attrs));

  $.ajax({
    url: url,
    data: JSON.stringify(postdata),
    contentType: 'application/json',
    dataType: 'json',
    type: 'POST',
    success: function(data) {
      var r = _this._parseResult(data);
      cb.apply(_this, [r]);
    }
  });
};

/**
 * Return the HTTP request parameters for a query.
 *
 * @function
 * @param {Object} queryAttrs - See the documentation for GProfiler.{@link
 * GProfiler#query}. If not specified, the active query (the last query
 * executed via GProfiler.{@link GProfiler#query}) is used. Otherwise, an
 * error is thrown.
 *
 * @returns {Object}
 */

GProfiler.prototype.getQueryParams = function(queryAttrs) {
  var _this = this;
  var $ = _this.$;
  var txSignificant;
  var defaults;
  var postdata;

  queryAttrs =
    queryAttrs || this.activeQuery;
  if ($.type(queryAttrs) !== 'object')
    throw new Error('No active query associated with GProfiler object');

  this._warnAboutDeprecation(queryAttrs);

  // Compile and check query attributes

  defaults = {
    query               : undefined,
    organism            : 'hsapiens',
    significant         : true,
    orderedQuery        : false,
    excludeIEA          : false,
    underrep            : false,
    userThreshold       : undefined,
    correctionMethod    : 'g_SCS',
    domainSize          : 'annotated',
    numericNS           : undefined,
    customBG            : undefined,
    srcFilter           : [],
  };

  if (queryAttrs.correctionMethod === 'gSCS')
    queryAttrs.correctionMethod = 'g_SCS';
  queryAttrs = $.extend({}, defaults, queryAttrs);

  if (!queryAttrs.query)
    throw new Error('The query parameter is required');
  if (queryAttrs.query instanceof Array)
    queryAttrs.query = queryAttrs.query.join(' ');
  this.activeQuery = queryAttrs;

  // Transform query attributes to g:Profiler API format

  txSignificant = function(significant) {
    return [['all_results', !significant]];
  };

  postdata = _this._transformAttrs(queryAttrs, defaults, {
    significant       : txSignificant,
    orderedQuery      : 'ordered',
    excludeIEA        : 'no_iea',
    underrep          : 'measure_underrepresentation',
    userThreshold     : 'user_threshold',
    correctionMethod  : 'significance_threshold_method',
    domainSize        : 'domain_scope',
    numericNS         : 'numeric_ns',
    customBG          : 'background',
    srcFilter         : 'sources'
  });

  return postdata;
};

/**
 * Return g:Profiler URL encoding a query.
 *
 * @function
 * @param {Object} queryAttrs - See the documentation for GProfiler.{@link
 * GProfiler#query}. If not specified, the active query (the last query
 * executed via GProfiler.{@link GProfiler#query}) is used. Otherwise, an
 * error is thrown.
 *
 * @returns {String|null} If the resulting URL lengths exceeds the maximum
 *  allowed length, `null` is returned.
 */

GProfiler.prototype.getQueryURL = function(queryAttrs) {
  var _this = this;
  var $ = _this.$;
  var url =
    _this.getRootURL() + '?';
  var postdata =
    _this.getQueryParams(queryAttrs);

  $.each(postdata, function(k, v) {
    url += k + '=' + encodeURIComponent(v) + '&'; });
  if (url.length > _this.MAX_URL_LEN)
    return null;
  return url;
};

/**
 * Return g:Profiler root URL.
 *
 * @returns {String}
 */

GProfiler.prototype.getRootURL = function() {
  return this.GP_ROOT_URL;
};

GProfiler.prototype._warnAboutDeprecation = function(attrs) {
  var message =
    'Attribute %s is not supported since biojs-vis-gprofiler 0.6.0';
  var stdExplanation = 'Not used in g:Profiler 2';
  var regionExplanation =
    'Region symbols are detected automatically in g:Profiler 2';
  var maxPValExplanation =
    'Superseded by the `userThreshold` parameter';

  var deprecated = {
    sortByStructure     : stdExplanation,
    regionQuery         : regionExplanation,
    hierFiltering       : stdExplanation,
    maxPValue           : maxPValExplanation,
    minSetSize          : stdExplanation,
    maxSetSize          : stdExplanation
  };

  this.$.each(deprecated, function(attr, explanation) {
      if (typeof attrs[attr] === 'undefined') {
        return true;
      }
      else if (console && console.warn) {
        var attrMessage =
          message.replace('%s', attr) + ' (' + explanation + ')';
        console.warn(attrMessage);
      }
  });
};

GProfiler.prototype._transformAttrs = function(attrs, typehints, tforms) {

  // Transform an object of attributes into HTTP POST data for jQuery.post.
  //
  // - typehints - an object with keys corresponding to the attrs object. This
  //   is used for hints about the desired type of an attribute, currently only
  //   used for detecting boolean values. This may conveniently be the default
  //   values object.
  // - tforms - an object of keyed by incoming attribute name; if the value is
  //   a string, then the HTTP POST parameter is renamed to this string; if the
  //   value is a function, it is expected to return an array of name - value
  //   pairs.

  var _this = this;
  var $ = _this.$;
  var r = {};

  typehints = typehints || {};
  tforms = tforms || {};

  $.each(attrs, function(k, v) {
    var tx = tforms[k] || k;
    var name = tx;

    // Specific transforms

    if ($.type(tx) === 'function') {
      var txr = tx.apply(_this, [v]);

      $.each(txr, function(i, w) {
        r[w[0]] = w[1]; });
      return true;
    }

    // Automatic transforms for various types

    if ($.type(typehints[k]) === 'boolean') {
      r[name] = v ? true : false;
      return true;
    }
    else if ($.type(typehints[k]) === 'array' && $.type(v) === 'array') {
      if (v.length === 0)
        return true;
      r[name] = v;
    }
    else if ($.type(v) === 'undefined' || $.type(v) === 'null') {
      return true;
    }
    else if ($.type(v) === 'array') {
      r[name] = v.join(' ');
    }
    else {
      r[name] = v;
    }
  });

  return r;
};

GProfiler.prototype._parseResult = function(data) {
  var $ = this.$;
  var pick = require('lodash.pick');
  var mapKeys = require('lodash.mapkeys');

  var keys = [
    'significant', 'p_value', 'term_size', 'query_size',
    'intersection_size', 'precision', 'recall', 'native',
    'source', 'name', 'description'
  ];
  var keyMap = {
    'intersection_size': 'overlap_size',
    'native': 'term_id',
    'source': 'domain',
    'name': 'term_name'
  };
  var result = data.result;

  if (!(result instanceof Array)) {
    throw new Error(
      'Results array not present in the payload returned from server');
  }

  return result.map(function(row) {
    row = mapKeys(pick(row, keys), function(v, k) {
      return keyMap[k] || k;
    });

    // Attempt to maximize compatibility with v0.5.0 (working against the g:P
    // Legacy API)

    row.domain = row.domain.replace(/^GO\:/, '');
    row.subgraph = '1';
    row.depth = '1';
    row.intersection = [];

    return row;
  });
};

if (module && typeof module === 'object' && module.exports)
  module.exports = new GProfiler();
