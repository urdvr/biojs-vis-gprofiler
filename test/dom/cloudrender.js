/*
 * biojs-vis-gprofiler
 * https://github.com/tambeta/biojs-vis-gprofiler
 *
 * Copyright (c) 2014 Tambet Arak
 * Licensed under the BSD license.
 */

var chai = require('chai');
var biojsvisgprofiler = require('../../lib/biojsvisgprofiler');
var assert = chai.assert;

describe('biojs-vis-gprofiler module', function(){
  it('should render word cloud', function(done){
    this.timeout(30000);

    var opts = { container : '#mocha' };
    var gp = new biojsvisgprofiler(opts);

    gp.on('onrender', function() {
      var n_text_els =
        document.querySelectorAll('svg text').length;
      assert.ok(n_text_els >= 5, 'At least 5 text elements rendered')
      done();
    });

    gp.render({
      organism : 'scerevisiae',
      query : 'swi4 swi6 mbp1 mcm1 fkh1 fkh2 ndd1 swi5 ace2'
    });
  });
});
