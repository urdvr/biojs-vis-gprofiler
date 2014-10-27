/*
 * biojs-vis-gprofiler
 * https://github.com/tambeta/biojs-vis-gprofiler
 *
 * Copyright (c) 2014 Tambet Arak
 * Licensed under the BSD license.
 */

var buildDir = "build";
var outputFile = "biojsvisgprofiler";

//
// Import modules
//

// gulp + utils

var gulp = require('gulp');
var util = require('gulp-util')

var source = require('vinyl-source-stream'); // node streams -> vinyl streams
var gzip = require('gulp-gzip');
var rename = require('gulp-rename');
var chmod = require('gulp-chmod');
var streamify = require('gulp-streamify'); // streams -> buffers (for old plugins)
var watch = require('gulp-watch');

var fs = require('fs');
var path = require('path');
var join = path.join;
var mkdirp = require('mkdirp');
var del = require('del');

var jshint = require('gulp-jshint'); 
var jsdoc = require('gulp-jsdoc-to-markdown');

// browser builds

var browserify = require('browserify');
var watchify = require('watchify')
var uglify = require('gulp-uglify');

// testing

var mocha = require('gulp-mocha');
var mochaPhantomJS = require('gulp-mocha-phantomjs'); 

// auto config

var outputFileMin = join(buildDir, outputFile + ".min.js");
var packageConfig = require('./package.json');

//
// Tasks
//

gulp.task('default', ['lint', 'test', 'build']);

// Build tasks

gulp.task('build', ['build-browser', 'build-browser-gzip', 'build-doc']);

gulp.task('build-browser',['init'], function() {
  
  // browserify debug
  
  var b = browserify({debug: true,hasExports: true});
  
  exposeBundles(b);
  return b.bundle()
    .pipe(source(outputFile + ".js"))
    .pipe(chmod(644))
    .pipe(gulp.dest(buildDir));
});

gulp.task('build-browser-min',['init'], function() {
  var b =
    browserify({hasExports: true, standalone: "biojs-vis-gprofiler"});
  exposeBundles(b);
  
  return b.bundle()
    .pipe(source(outputFile + ".min.js"))
    .pipe(chmod(644))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest(buildDir));
});
 
gulp.task('build-browser-gzip', ['build-browser-min'], function() {
  return gulp.src(outputFileMin)
    .pipe(gzip({append: false, gzipOptions: { level: 9 }}))
    .pipe(rename(outputFile + ".min.gz.js"))
    .pipe(gulp.dest(buildDir));
});

gulp.task('build-doc', ['init'], function() {
  
  // Automatically embed jsdocs into README.md
  
  var fi = require('gulp-file-include');
  var replace = require('gulp-replace');
  var print = require('gulp-print');
  
  gulp.src("lib/biojsvisgprofiler.js")
    .pipe(jsdoc())
    .on("error", function(err) {
      gutil.log(gutil.colors.red("jsdoc-to-markdown failed"), err.message)
    })
    .pipe(replace(/^#+/gm, function(x) { // tone down header sizes by 2
      var s = "######";
      return s.substr(0, x.length+2);
    }))
    .pipe(rename(function(path) {
      path.extname = ".md";
    }))
    .pipe(gulp.dest("build"))
    .on('end', function() {
      gulp.src("doc/README.md")
      .pipe(fi({basepath: "build"}))
      .pipe(gulp.dest("."));
    });
});

// Testing tasks

gulp.task('test', ['test-unit', 'test-dom']);

gulp.task('test-unit', function () {
  return gulp.src('./test/unit/**/*.js', {read: false})
    .pipe(mocha({reporter: 'spec',
      useColors: false}));
});

gulp.task('test-dom', ["build-test"], function () {
  return gulp
  .src('test/index.html')
  .pipe(mochaPhantomJS());
});

gulp.task('build-test',['init'], function() {
  
  // browserify debug
  
  var b = browserify({debug: true});  
  b.add('./test/dom/index');
  
  return b.bundle()
    .pipe(source("test.js"))
    .pipe(chmod(644))
    .pipe(gulp.dest(buildDir));
});

// Housekeeping tasks

gulp.task('clean', function(cb) {
  
  // will remove everything in build
  
  del([buildDir], cb);
});

gulp.task('init', ['clean'], function() {
  
  // just makes sure that the build dir exists
  
  mkdirp(buildDir, function (err) {
    if (err) console.error(err)
  });
});

// Miscellaneous tasks

gulp.task('lint', function() {
  return gulp.src('./lib/biojsvisgprofiler.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('watch', function() {
  
  // watch task for browserify 
  // watchify has an internal cache, subsequent builds are faster
  
  var b;
  var watcher;
  
  b = browserify({
    debug: true,
    hasExports: true,
    cache: {},
    packageCache: {} 
  });
  b.add('./index.js', {expose: packageConfig.name});

  function rebundle(ids){
    b.bundle()
    .on("error", function(error) {
      util.log(util.colors.red("Error: "), error);
    })
    .pipe(source(outputFile + ".js"))
    .pipe(chmod(644))
    .pipe(gulp.dest(buildDir));
  }

  watcher = watchify(b);
  watcher.on("update", rebundle)
   .on("log", function(message) {
      util.log("Refreshed:", message);
  });

  return rebundle();
});

gulp.task('test-watch', function() {
  gulp.watch(['./src/**/*.js','./lib/**/*.js', './test/**/*.js'], function() {
    gulp.run('test'); });
});

// Utility routines

function exposeBundles(b){

  // exposes the main package
  // + checks the config whether it should expose other packages  
  
  b.add('./index.js', {expose: packageConfig.name });
  
  if (packageConfig.sniper !== undefined && packageConfig.sniper.exposed !== undefined) {
    for (var i=0; i<packageConfig.sniper.exposed.length; i++) {
      b.require(packageConfig.sniper.exposed[i]);
    }
  }
}
