// jshint node: true
// jshint esversion: 10 
'use strict';

const {
  parallel,
  src,
  dest,
  series,
  watch,
} = require('gulp'),
  minify = require('gulp-minify'),
  replace = require('gulp-replace'),
  sourcemaps = require('gulp-sourcemaps');

var khplayerGulp = {
  export () {
    return src("src/khplayer.js")
      .pipe(sourcemaps.init())
      .pipe(minify({
        mangle: true,
        noSource: false,
        preserveComments: "some",
        ext: {
          min: ".min.js"
        }
      }))
      .pipe(replace(/ {2,}/g, ''))
      .pipe(sourcemaps.write("./"))
      .pipe(dest("dist"));
  },
};

exports.build = parallel(khplayerGulp.export);
exports.watch = series(exports.build, function () {
  watch("src/khplayer.js", khplayerGulp.export);
});