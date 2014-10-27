
function GProfiler() {
    this.$ = require('jquery-browserify');
    this.GP_ROOT_URL = 'http://biit.cs.ut.ee/gprofiler/';
}

GProfiler.prototype.query = function(attrs) {
    var $ = this.$;
    var r = [];
    var defaults = {
        query       : undefined,
        organism    : 'hsapiens',
        cb          : undefined
    };
    
    attrs = $.extend({}, defaults, attrs);
    
    if (!attrs.query)
        throw new Error('The query parameter is required');
    if (!attrs.cb || !(attrs.cb instanceof Function))
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
        
        attrs.cb.apply(this, [r]);    
    });
};

if (module && typeof module === 'object' && module.exports)
    module.exports = new GProfiler();
