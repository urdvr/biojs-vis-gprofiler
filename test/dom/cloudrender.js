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

// Test suite

describe('biojs-vis-gprofiler module', function(){
  this.timeout(30000);

  var renderopts = {
    organism : 'scerevisiae',
    query : 'swi4 swi6 mbp1 mcm1 fkh1 fkh2 ndd1 swi5 ace2'
  };

  it('should render words', function(done){
    var gp = new biojsvisgprofiler({
      container : '#mocha'
    });

    gp.on('onrender', function() {
      var n_text_els = get_n_text_elems();
      assert.ok(n_text_els >= 5, 'At least 5 text elements rendered')
      done();
    });

    gp.render(renderopts);
  });

  it('should render whole terms', function(done){
    var gp = new biojsvisgprofiler({
      container : '#mocha',
      useTerms  : true
    });

    gp.on('onrender', function() {
      var n_text_els = get_n_text_elems();
      assert.ok(n_text_els >= 5, 'At least 5 text elements rendered')
      done();
    });

    gp.render(renderopts);
  });
});

// Auxiliary functions

var get_n_text_elems = function() {
  return document.querySelectorAll('svg text').length;
}
