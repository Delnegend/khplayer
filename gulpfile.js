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
  rename = require("gulp-rename"),
  sourcemaps = require('gulp-sourcemaps'),
  minify = require('gulp-minify'),
  // concat = require('gulp-concat'),
  minifyHTML = require("gulp-htmlmin"),
  replace = require('gulp-replace');

var khplayerGulp = {
  path: {
    js: "src/khplayer.js"
  },
  export: {
    js() {
      return src(khplayerGulp.path.js)
        // .pipe(rename(khplayerGulp.path.js))
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
    }
  },
};

var genScreenGulp = {
  path: {
    html: "others/genScreen/src/content.html",
    js: "others/genScreen/src/script.js",
    dist: "others/genScreen/dist"
  },
  name: {
    html: "index.html",
    js: "vendor.js"
  },
  export: {
    js() {
      return src(genScreenGulp.path.js)
        .pipe(rename(genScreenGulp.name.js))
        .pipe(sourcemaps.init())
        .pipe(minify({
          mangle: false,
          noSource: true,
          ext: {
            min: ".min.js"
          }
        }))
        .pipe(sourcemaps.write("./"))
        .pipe(dest(genScreenGulp.path.dist));
    },
    html() {
      return src(genScreenGulp.path.html)
        .pipe(minifyHTML({
          collapseWhitespace: true,
          removeComments: true,
          removeEmptyAttributes: false,
          minifyCSS: true,
          minifyJS: true,
        }))
        .pipe(rename(genScreenGulp.name.html))
        .pipe(dest("others/genScreen/"));
    },
  },
};

exports.build = parallel(khplayerGulp.export.js, genScreenGulp.export.js, genScreenGulp.export.html);
exports.watch = series(exports.build, function () {
  watch(genScreenGulp.path.js, genScreenGulp.export.js);
  watch(genScreenGulp.path.html, genScreenGulp.export.html);
  watch(khplayerGulp.path.js, khplayerGulp.export.js);
});