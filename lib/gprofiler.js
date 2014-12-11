
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
 * Fields of `attrs`:
 *
 * @property {Array} query - A list of query symbols. _required_
 * @property {String} organism - The query organism. _default_: hsapiens
 * @property {boolean} significant - Only return statistically significant
 *  results. _default_: true
 * @property {boolean} ordered - Ordered query. _default_: false.
 * @property {boolean} exclude_iea - Exclude electronic GO annotations.
 *  _default_: false.
 * @property {boolean} region_query - The query consists of chromosomal
 *  regions. _default_: false.
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
    var $ = this.$;
    var r = [];
    var defaults = {
        query               : undefined,
        organism            : 'hsapiens',

        significant         : true,
        ordered             : false,
        exclude_iea         : false,
        region_query        : false,
        underrep            : false,
        hier_filtering      : "none",
        max_p_value         : 1.0,
        min_set_size        : 0,
        max_set_size        : 0,
        correction_method   : "gSCS",
        domain_size         : "annotated",
        numeric_ns          : undefined,
        custom_bg           : [],
        src_filter          : [],
    };

    attrs = $.extend({}, defaults, attrs);

    if (!attrs.query)
        throw new Error('The query parameter is required');
    if (!cb || !(cb instanceof Function))
        throw new Error('The cb parameter is required and must be a function');

    if (!(attrs.query instanceof Array))
        attrs.query = [attrs.query];

    var url = this.GP_ROOT_URL + '/index.cgi';
    var postdata = {
        organism            : attrs.organism,
        query               : attrs.query.join(' '),
        significant         : '1',
        output              : 'mini',
    };

    $.post(url, postdata, function(data) {
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

        cb.apply(this, [r]);
    });
};

if (module && typeof module === 'object' && module.exports)
    module.exports = new GProfiler();
