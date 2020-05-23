// jshint node: true
// jshint esversion: 10 
'use strict';

// General
const {
  parallel,
  src,
  dest,
  series,
  watch,
  gulp
} = require('gulp'),
  rename = require("gulp-rename"),
  sourcemaps = require('gulp-sourcemaps'),
  minify = require('gulp-minify'),
  babel = require("gulp-babel"),
  concat = require('gulp-concat'),
  autoprefixer = require('gulp-autoprefixer'),
  sass = require("gulp-sass"),
  browserSync = require('browser-sync').create();
sass.compiler = require("node-sass");

const khp_gulp = {
  // Điều chỉnh, thêm bớt dữ liệu tại đây
  path: {
    sass: "./src/khplayer.scss",
    js: "./src/khplayer.js",
    dist: "./dist/"
  },
  name: {
    css: "khplayer.css",
    js: "khplayer.js",
  },
  // Phần dưới này tốt nhất mặc kệ
  export: {
    css: function () {
      return src(khp_gulp.path.sass)
        .pipe(rename(khp_gulp.name.css))
        .pipe(rename(function (path) {
          return {
            dirname: path.dirname + "/",
            basename: path.basename + ".min",
            extname: ".css",
          };
        }))
        .pipe(sourcemaps.init())
        .pipe(sass.sync({
          "outputStyle": "compressed",
        }).on('error', sass.logError))
        .pipe(autoprefixer({
          cascade: true
        }))
        .pipe(sourcemaps.write("./"))
        .pipe(dest(khp_gulp.path.dist))
        .pipe(browserSync.stream());
    },
    js: {
      standard: function () {
        return src(khp_gulp.path.js)
          .pipe(concat(khp_gulp.name.js))
          .pipe(sourcemaps.init())
          .pipe(minify({
            mangle: false,
            noSource: true,
            ext: {
              min: ".min.js"
            }
          }))
          .pipe(sourcemaps.write("./"))
          .pipe(dest(khp_gulp.path.dist))
          .pipe(browserSync.stream());

      },
      poly: {
        // full: function () {
        //     return src(khp_gulp.path.js)
        //         .pipe(concat(khp_gulp.name.js))
        //         .pipe(rename(function (path) {
        //             return {
        //                 dirname: path.dirname + "/",
        //                 basename: path.basename + ".polyfilled",
        //                 extname: ".js",
        //             };
        //         }))
        //         .pipe(sourcemaps.init())
        //         .pipe(babel({
        //             presets: ['@babel/env'],
        //             plugins: ['@babel/transform-runtime']
        //         }))
        //         .pipe(sourcemaps.write("./"))
        //         .pipe(dest(khp_gulp.path.dist));
        // },
        min: function () {
          return src(khp_gulp.path.js)
            .pipe(concat(khp_gulp.name.js))
            .pipe(minify({
              mangle: false,
              noSource: true,
              ext: {
                min: "polyfilled.min.js"
              }
            }))
            .pipe(sourcemaps.init())
            .pipe(babel({
              plugins: ['@babel/transform-runtime'],
              presets: ['@babel/env']
            }))
            .pipe(sourcemaps.write("./"))
            .pipe(dest(khp_gulp.path.dist));
        }
      }
    }
  },
  watch: function () {
    browserSync.init({
      server: {
        baseDir: "./"
      }
    });
    watch([khp_gulp.path.sass, khp_gulp.path.js, "./demo/index.html"], exports.build, function () {
      browserSync.reload();
    });
  },
};

const gen_gulp = {
  // Điều chỉnh, thêm bớt dữ liệu tại đây
  path: {
    html: "genScreen/src/content.html",
    sass: "genScreen/src/style.scss",
    js: "genScreen/src/script.js",
    dist: "genScreen/dist"
  },
  name: {
    html: "index.html",
    css: "vendor.min.css",
    js: "vendor.min.js"
  },
  // Phần dưới này tốt nhất mặc kệ
  exportJS: function () {
    let babel = require("gulp-babel"),
      minify = require('gulp-minify'),
      concat = require('gulp-concat');
    return src(gen_gulp.path.js)
      .pipe(babel({
        presets: ['@babel/env']
      }))
      .pipe(minify())
      // .pipe(concat(gen_gulp.name.js))
      .pipe(rename(gen_gulp.name.js))
      .pipe(dest(gen_gulp.path.dist));
  },
  exportCSS: function () {
    let autoprefixer = require('autoprefixer'),
      postcss = require('gulp-postcss'),
      sass = require("gulp-sass");
    sass.compiler = require("dart-sass");

    return src(gen_gulp.path.sass)
      .pipe(sass.sync({
        "outputStyle": "compressed",
      }).on('error', sass.logError))
      .pipe(postcss([autoprefixer()]))
      .pipe(rename(gen_gulp.name.css))
      .pipe(dest(gen_gulp.path.dist));
  },
  exportHTML: function () {
    let minifyHTML = require("gulp-htmlmin");
    return src(gen_gulp.path.html)
      .pipe(minifyHTML({
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: false,
        minifyCSS: true,
        minifyJS: true,
      }))
      .pipe(rename(gen_gulp.name.html))
      .pipe(dest("./"));
  },
  watch: function () {
    watch(gen_gulp.path.sass, gen_gulp.exportCSS);
    watch(gen_gulp.path.html, gen_gulp.exportHTML);
    watch(gen_gulp.path.js, gen_gulp.exportJS);
  },
};

exports.build = parallel(khp_gulp.export.css, khp_gulp.export.js.standard);
exports.watch = series(exports.build, khp_gulp.watch);
exports.genBuild = parallel(gen_gulp.exportCSS, gen_gulp.exportHTML, gen_gulp.exportJS);
exports.genWatch = series(exports.genBuild, gen_gulp.watch);
exports.default = parallel(exports.watch, exports.genWatch);