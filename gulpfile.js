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
  minifyHTML = require("gulp-htmlmin"),
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
    css() {
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
      standard() {
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
    }
  },
  watch() {
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

var genGulp = {
  // Điều chỉnh, thêm bớt dữ liệu tại đây
  path: {
    html: "genScreen/src/content.html",
    sass: "genScreen/src/style.scss",
    js: "genScreen/src/script.js",
    dist: "genScreen/dist"
  },
  name: {
    html: "index.html",
    css: "vendor.css",
    js: "vendor.js"
  },
  // Phần dưới này tốt nhất mặc kệ
  export: {
    js() {
      return src(genGulp.path.js)
        .pipe(concat(genGulp.name.js))
        .pipe(sourcemaps.init())
        .pipe(minify({
          mangle: false,
          noSource: true,
          ext: {
            min: ".min.js"
          }
        }))
        .pipe(sourcemaps.write("./"))
        .pipe(dest(genGulp.path.dist))
        .pipe(browserSync.stream());
    },
    css() {
      return src(genGulp.path.sass)
        .pipe(rename(genGulp.name.css))
        .pipe(rename(function (path) {
          return {
            dirname: path.dirname + "/",
            basename: path.basename + ".min",
            extname: ".css",
          };
        }))
        .pipe(sourcemaps.init())
        .pipe(minify({
          mangle: false,
          noSource: true,
          ext: {
            min: ".min.css"
          }
        }))
        .pipe(sass.sync({
          "outputStyle": "compressed",
        }).on('error', sass.logError))
        .pipe(autoprefixer({
          cascade: true
        }))
        .pipe(sourcemaps.write("./"))
        .pipe(dest(genGulp.path.dist))
        .pipe(browserSync.stream());
    },
    html() {
      return src(genGulp.path.html)
        .pipe(minifyHTML({
          collapseWhitespace: true,
          removeComments: true,
          removeEmptyAttributes: false,
          minifyCSS: true,
          minifyJS: true,
        }))
        .pipe(rename(genGulp.name.html))
        .pipe(dest("./"));
    },
  },
};

exports.build = parallel(khp_gulp.export.css, khp_gulp.export.js.standard, genGulp.export.css, genGulp.export.html, genGulp.export.js);
exports.watch = series(exports.build, function () {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
  watch([genGulp.path.sass, genGulp.path.js, genGulp.path.html, khp_gulp.path.sass, khp_gulp.path.js, "./demo/index.html"], exports.build, () => {
    browserSync.reload();
  });
});