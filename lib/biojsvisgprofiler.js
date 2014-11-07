
// biojs-vis-gprofiler
// https://github.com/tambeta/biojs-vis-gprofiler
//
// Copyright (c) 2014 Tambet Arak
// Licensed under the BSD license.

/**
 * Construct a BioJSVisGProfiler object.
 *
 * @constructor
 * @param {Object} attrs - Pass properties to the constructor via this object.
 *
 * @property {string} container - Container wherein the cloud will be rendered,
 *  in selector format _required_
 * @property {int} width - Width of the rendered cloud, in pixels
 * _default_: 300
 * @property {int} height - Height of the rendered cloud, in pixels
 * _default_: 300
 * @property {int} maxN - Max number of strings to display
 * @property {int} maxTermLen - Max length of a term description, keep this at a
 *  reasonable value to ensure all terms are displayed. No effect in useTerms
 *  is false.
 * @property {boolean} useTerms - Display whole functional terms instead of
 *  single words
 * @property {sizerCb} sizer - Callback function for computing
 *  the point size of a string based on passed score of the string and a scaling
 *  value dependent on the cloud dimensions.
 *
 * @example
 * ```
 * var gp = require('biojs-vis-gprofiler');
 *
 * gp = new gp({
 *   container  : "#myContainer",
 *   width      : 600,
 *   height     : 600,
 * });
 *
 * gp.on("onrender", function() {
 *   console.log("caught render event");
 * });
 *
 * gp.render({
 *   query    : ["swi4", "swi6", "mbp1"],
 *   organism : "scerevisiae",
 * });
 * ```
 */

function BioJSVisGProfiler(attrs) {
  var swh = {};
  var $;

  // Load modules

  this.$ = $      = require('jquery-browserify');
  this._          = require('underscore');
  this.d3         = require('d3-browserify');
  this.cloud      = require('./d3.layout.cloud');
  this.stopwords  = require('stopwords').english;
  this.events     = require('backbone-events-standalone');
  this.gp         = require('./gprofiler');

  // Attributes

  var defaults = {
    container  : null,
    width      : 300,
    height     : 300,
    maxN       : 0,
    maxTermLen : 25,
    useTerms   : false,
    sizer      : null
  };

  attrs = $.extend({}, defaults, attrs);
  $.extend(this, attrs);

  this.container =
    $(this.container);
  if (this.container.length !== 1)
    throw new Error('the container parameter must specify a unique element');

  // Misc. setup

  if (!window.d3) // d3-cloud requires global d3
    window.d3 = this.d3;

  $.extend(this, this.events);

  $.each(this.stopwords, function(i, v) {
    swh[v] = 1; });
  this.stopwords = swh;
}

/**
 * Query g:Profiler and render a cloud.
 *
 * @function
 * @param {Object} attrs - Pass properties to the method via this object.
 *
 * @property {string} organism - The organism name in g:Profiler format,
 *  generally the first character of the genus + species in lowercase. E.g.
 *  "Mus musculus" -> "mmusculus".
 * @property {string|Array} query - a query symbol or a list thereof.
 *
 * @fires BioJSVisGProfiler#onrender
 */

BioJSVisGProfiler.prototype.render = function(attrs) {
  var $ = this.$;
  var gp = this.gp;
  var _this = this;
  var twords = [];

  // Word distillation

  var normalizeWord = function(w) {
    if (w !== w.toUpperCase()) {
      w = w.toLowerCase();
      w = w.replace(/[\,\.]+/g, '');
    }

    return w;
  };

  var fetchfnWord = function(i, r) {
    if (!r['term_id'].match(/^GO\:/))
      return true;

    r['term_name'].split(/\s+/).map(function(w) {
      if (!_this.stopwords[w])
        twords.push([normalizeWord(w), r]);
    });
  };

  // Whole term distillation

  var fetchfnWholeTerm = function(i, r) {
    var maxLen = _this.maxTermLen;
    var tstr;

    if (!r['term_id'].match(/^GO\:/))
      return true;

    tstr = r['term_name'];
    if (tstr.length > maxLen)
      tstr = tstr.substr(0, maxLen - 1) + '…';
    twords.push([tstr, r]);
  };

  attrs.cb = function(data) {
    var fetchfn = _this.useTerms ?
      fetchfnWholeTerm :
      fetchfnWord;

    $.each(data, fetchfn);
    _this._renderCloud(twords);
  };

  gp.query(attrs);
};

BioJSVisGProfiler.prototype._renderCloud = function(clels) {

  // Render the cloud. The argument is an array of cloud
  // elements (a string and the term structure from
  // g:Profiler). The cloud is visually scaled
  // proportionally to desired dimensions.

  var $ = this.$;
  var _ = this._;
  var _this = this;
  var cloud = this.cloud;
  var fill = this.d3.scale.category20();
  var draw;
  var sizer;

  var container = this.container;
  var w = this.width;
  var h = this.height;
  var scaling = (w + h) / 2 / 600;
  var clelScores = {};
  var totalScore = 0.0;

  // Calculate scores for each clel, summing
  // abslogs of p-values

  $.each(clels, function(i, cel) {
    var str = cel[0];
    var t = cel[1];
    var score = Math.abs(_this._logBase(10, t['p_value']));

    if (!clelScores[str])
      clelScores[str] = 0;
    clelScores[str] += score;
  });

  // Sort clels by p-value, leave max_n elements

  clels.sort(function(a, b) {
    return clelScores[a[0]] < clelScores[b[0]]; });
  clels = _.uniq(clels, false, function(x) {
    return x[0]; });
  if (this.maxN)
    clels = clels.slice(0, this.maxN);

  // Scale scores; total == 1

  $.each(clels, function(i, v) {
    totalScore += clelScores[v[0]]; });
  $.each(clelScores, function(i, v) {
    clelScores[i] = clelScores[i] / totalScore; });

  // The rendering function for d3-cloud

  draw = function(words) {
    _this.d3.select(container.get(0))
      .append('svg')
        .attr('width', w)
        .attr('height', h)
      .append('g')
        .attr(
          'transform', 'translate(' + parseInt(w/2) + ',' +
          parseInt(h/2) + ')'
        )
      .selectAll('text')
      .data(words).enter().append('text')
        .style('font-size', function(d) { return d.size + 'px'; })
        .style('font-family', 'Impact')
        .style('fill', function(d, i) { return fill(i); })
        .attr('text-anchor', 'middle')
        .attr('transform', function(d) {
          var s =
            'translate(' + [d.x, d.y] + ')' +
            'rotate(' + d.rotate + ')';
          return s;
        })
        .text(function(d) { return d.text; });

    _this.trigger('onrender');
  };

  // Init cloud

  sizer = this.sizer || function(score, scaling) {
    return _this._logBase(2, score * 600 + 1) * 12 * scaling;
  };

  cloud().size([w, h])
    .words($.map(clels, function(v, i) {
      var str = v[0];
      var score = clelScores[str];
      var s = sizer(score, scaling);
      var minS = 12;
      var maxS = 72 * scaling;

      return {
        text: str,
        size: s < minS ?
          minS :
          s > maxS ? maxS : s
      };
    }))
    .padding(scaling * 3)
    .rotate(0)
    .font('Impact')
    .fontSize(function(d) { return d.size; })
    .on('end', draw)
    .start();
};

BioJSVisGProfiler.prototype._logBase = function(b, x) {
  return Math.log(x) / Math.log(b);
};

module.exports = BioJSVisGProfiler;

/**
 * @callback sizerCb
 * @param {int} score - A score for the string (sum of all scores == 1)
 * @param {int} scaling - A constant scaling value proportional to the size of
 *  the rendering area
 */

/**
 * Fired when cloud rendering has completed.
 *
 * @event BioJSVisGProfiler#onrender
 */
