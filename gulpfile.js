// jshint node: true
// jshint esversion: 10 
'use strict';

const {
  parallel,
  src,
  dest,
  series,
  watch,
  // gulp
} = require('gulp'),
  rename = require("gulp-rename"),
  sourcemaps = require('gulp-sourcemaps'),
  minify = require('gulp-minify'),
  concat = require('gulp-concat'),
  minifyHTML = require("gulp-htmlmin");

var khplayerGulp = {
  path: {
    js: "src/khplayer.js"
  },
  export: {
    js() {
      return src(khplayerGulp.path.js)
        .pipe(rename("khplayer.js"))
        .pipe(sourcemaps.init())
        .pipe(minify({
          mangle: false,
          noSource: true,
          ext: {
            min: ".min.js"
          }
        }))
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
    // css() {
    //   return src(genScreenGulp.path.sass)
    //     .pipe(rename(genScreenGulp.name.css))
    //     .pipe(rename(function (path) {
    //       return {
    //         dirname: path.dirname + "/",
    //         basename: path.basename + ".min",
    //         extname: ".css",
    //       };
    //     }))
    //     .pipe(sourcemaps.init())
    //     .pipe(minify({
    //       mangle: false,
    //       noSource: true,
    //       ext: {
    //         min: ".min.css"
    //       }
    //     }))
    //     .pipe(sass.sync({
    //       "outputStyle": "compressed",
    //     }).on('error', sass.logError))
    //     .pipe(autoprefixer({
    //       cascade: true
    //     }))
    //     .pipe(sourcemaps.write("./"))
    //     .pipe(dest(genScreenGulp.path.dist))
    //     .pipe(browserSync.stream());
    // },
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
  watch([genScreenGulp.path.js, genScreenGulp.path.html, khplayerGulp.path.js, "others/demo/index.html"], {}, exports.build);
});