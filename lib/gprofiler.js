
/**
 * Construct a GProfiler object.
 *
 * @constructor
 */

function GProfiler() {
  this.$ = require('jquery-browserify');
  this.GP_ROOT_URL = 'http://biit.cs.ut.ee/gprofiler/';
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
  var url = _this.GP_ROOT_URL + '/index.cgi';
  var postdata;

  var defaults = {
    query               : undefined,
    organism            : 'hsapiens',
    significant         : true,
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

  if (attrs.correction_method === 'gSCS')
    attrs.correction_method = 'analytical';
  attrs = $.extend({}, defaults, attrs);

  if (!attrs.query)
    throw new Error('The query parameter is required');
  if (!cb || !(cb instanceof Function))
    throw new Error('The cb parameter is required and must be a function');
  if (!(attrs.query instanceof Array))
    attrs.query = [attrs.query];

  postdata = _this._transformAttrs(attrs, defaults, {
    exclude_iea       : 'no_iea',
    region_query      : 'as_ranges',
    hier_filtering    : 'hierfiltering',
    max_p_value       : 'user_thr',
    correction_method : 'threshold_algo',
    domain_size       : 'domain_size_type',
    numeric_ns        : 'prefix',
    custom_bg         : 'custbg'
  });

  $.extend(postdata, {
    output            : 'mini',
    sort_by_structure : '1'
  });

  $.post(url, postdata, function(data) {
    var r = _this._parseResult(data);
    cb.apply(_this, [r]);
  });
};

GProfiler.prototype._transformAttrs = function(attrs, typehints, nametforms) {

  // Transform an object of attributes into HTTP POST data for jQuery.post.
  //
  // - typehints - an object with keys corresponding to the attrs object. This
  //   is used for hints about the desired type of an attribute, currently only
  //   used for detecting boolean values. This may conveniently be the default
  //   values object.
  // - nametforms - an object of name transformation pairs.

  var r = {};
  var $ = this.$;

  typehints = typehints || {};
  nametforms = nametforms || {};

  $.each(attrs, function(k, v) {
    var name = nametforms[k] || k;

    // Type hints

    if ($.type(typehints[k]) === 'boolean') {
      r[name] = v ? "1" : "0";
      return true;
    }

    // Transforms for various types

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
