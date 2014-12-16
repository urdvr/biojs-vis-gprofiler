
/**
 * Construct a GProfiler object.
 *
 * @constructor
 */

function GProfiler() {
  this.$ = require('jquery-browserify');

  var attrs = {
    GP_ROOT_URL   : 'http://biit.cs.ut.ee/gprofiler/',
    MAX_URL_LEN   : 4096,
    active_query  : undefined
  }

  $.extend(this, attrs);
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
 * @property {boolean} ordered_query - Ordered query. _default_: false.
 * @property {boolean} region_query - The query consists of chromosomal
 *  regions. _default_: false.*
 * @property {boolean} exclude_iea - Exclude electronic GO annotations.
 *  _default_: false.
 * @property {boolean} underrep - Measure underrepresentation. _default_: false.
 * @property {String} hier_filtering - Hierarchical filtering, one of "none",
 *  "moderate", "strong". _default_: none.
 * @property {float} max_p_value - Custom p-value threshold. _default_: 1.0.
 * @property {int} min_set_size - Minimum size of functional category.
 * @property {int} max_set_size - Maximum size of functional category.
 * @property {String} correction_method - Algorithm used for determining the
 *  significance threshold, one of "gSCS", "fdr", "bonferroni". _default_:
 *  "gSCS".
 * @property {String} domain_size - Statistical domain size, one of "annotated",
 *  "known". _default_: annotated.
 * @property {String} numeric_ns - Namespace to use for fully numeric IDs.
 * @property {Array} custom_bg - Array of symbols to use as a statistical
 *  background.
 * @property {Array} src_filter - Array of data sources to use. Currently these
 *  include GO (GO:BP, GO:MF, GO:CC to select a particular GO branch), KEGG,
 *  REAC, TF, MI, CORUM, HP. Please see the
 *  [g:GOSt web tool](http://biit.cs.ut.ee/gprofiler/) for the comprehensive
 *  list and details on incorporated data sources.
 */

GProfiler.prototype.query = function(attrs, cb) {
  var _this = this;
  var $ = _this.$;
  var url = _this.getRootURL();
  var postdata = {};

  if (!cb || !(cb instanceof Function))
    throw new Error('The cb parameter is required and must be a function');

  $.extend(
    postdata, {output : 'mini'},
    _this.getQueryParams(attrs)
  );

  $.post(url, postdata, function(data) {
    var r = _this._parseResult(data);
    cb.apply(_this, [r]);
  });
};

/**
 * Return the HTTP request parameters for a query.
 *
 * @function
 * @param {Object} query_attrs - See the documentation for [GProfiler#query]. If
 *  not specified, the active query (the last query executed via
 *  [GProfiler#query]) is used. Otherwise, an error is thrown.
 *
 * @returns {Object}
 */

GProfiler.prototype.getQueryParams = function(query_attrs) {
  var _this = this;
  var $ = _this.$;
  var tx_src_filter;
  var tx_hierfiltering;
  var defaults;

  query_attrs =
    query_attrs || this.active_query;
  if ($.type(query_attrs) !== 'object')
    throw new Error('No active query associated with GProfiler object');

  // Compile and check query attributes

  defaults = {
    query               : undefined,
    organism            : 'hsapiens',
    significant         : true,
    sort_by_structure   : true,
    ordered_query       : false,
    region_query        : false,
    exclude_iea         : false,
    underrep            : false,
    hier_filtering      : 'none',
    max_p_value         : 1.0,
    min_set_size        : 0,
    max_set_size        : 0,
    correction_method   : 'analytical',
    domain_size         : 'annotated',
    numeric_ns          : undefined,
    custom_bg           : [],
    src_filter          : [],
  };

  if (query_attrs.correction_method === 'gSCS')
    query_attrs.correction_method = 'analytical';
  query_attrs = $.extend({}, defaults, query_attrs);

  if (!query_attrs.query)
    throw new Error('The query parameter is required');
  if (!(query_attrs.query instanceof Array))
    query_attrs.query = [query_attrs.query];
  this.active_query = query_attrs;

  // Transform query attributes to g:Profiler API format

  tx_src_filter = function(srcs) {
    var r = [];
    $.each(srcs, function(i, v) {
      r.push(["sf_" + v, "1"]); });
    return r;
  }

  tx_hierfiltering = function(hf) {
    var r = ['hierfiltering'];

    if (hf === 'moderate')
      r.push('compact_rgroups');
    else if (hf === 'strong')
      r.push('compact_ccomp');
    else
      r.push('none');
    return [r];
  }

  postdata = _this._transformAttrs(query_attrs, defaults, {
    exclude_iea       : 'no_iea',
    region_query      : 'as_ranges',
    hier_filtering    : tx_hierfiltering,
    max_p_value       : 'user_thr',
    correction_method : 'threshold_algo',
    domain_size       : 'domain_size_type',
    numeric_ns        : 'prefix',
    custom_bg         : 'custbg',
    src_filter        : tx_src_filter
  });

  return postdata;
}

/**
 * Return g:Profiler URL encoding a query.
 *
 * @function
 * @param {Object} query_attrs - See the documentation for [GProfiler#query]. If
 *  not specified, the active query (the last query executed via
 *  [GProfiler#query]) is used. Otherwise, an error is thrown.
 *
 * @returns {String|null} If the resulting URL lengths exceeds the maximum
 *  allowed length, `null` is returned.
 */

GProfiler.prototype.getQueryURL = function(query_attrs) {
  var _this = this;
  var $ = _this.$;
  var url =
    _this.getRootURL() + "?";
  var postdata =
    _this.getQueryParams(query_attrs);

  $.each(postdata, function(k, v) {
    url += k + '=' + encodeURIComponent(v) + '&'; });
  if (url.length > _this.MAX_URL_LEN)
    return null;
  return url;
}

/**
 * Return g:Profiler root URL.
 *
 * @returns {String}
 */

GProfiler.prototype.getRootURL = function() {
  return this.GP_ROOT_URL;
}

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
        r[w[0]] = String(w[1]); });
      return true;
    }

    // Automatic transforms for various types

    if ($.type(typehints[k]) === 'boolean') {
      r[name] = v ? "1" : "0";
      return true;
    }

    if ($.type(v) === 'array') {
      if (v.length === 0)
        return true;
      r[name] = v.join(" ");
    }
    else if ($.type(v) === 'undefined' || $.type(v) === 'null') {
      return true;
    }
    else {
      r[name] = String(v);
    }
  });

  return r;
}

GProfiler.prototype._parseResult = function(data) {
  var $ = this.$;
  var r = [];
  var rows = data.split('\n');

  $.each(rows, function(i, row) {
    var term;
    var desc;
    var ro = {};

    if (row.match(/\s*^#/) || row.length < 14)
      return true;
    row = row.split(/\t/);

    ro['significant']    = row[1] ? true : false;
    ro['p_value']        = parseFloat(row[2]);
    ro['term_size']      = parseInt(row[3]);
    ro['query_size']     = parseInt(row[4]);
    ro['overlap_size']   = parseInt(row[5]);
    ro['precision']      = parseFloat(row[6]);
    ro['recall']         = parseFloat(row[7]);
    ro['term_id']        = row[8];
    ro['domain']         = row[9];
    ro['subgraph']       = row[10];
    ro['term_name']      = row[11];
    ro['depth']          = row[12];
    ro['intersection']   = row[13] ? row[13].split(',') : [];

    r.push(ro);
  });

  return r;
}

if (module && typeof module === 'object' && module.exports)
  module.exports = new GProfiler();
