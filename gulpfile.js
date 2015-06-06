/* jshint node:true */

'use strict';

var gulp = require('gulp');
var watch = require('gulp-watch');
var connect = require('gulp-connect');
var launch = require('gulp-open');
var bower = require('gulp-bower');
var plumber = require('gulp-plumber');
var jshint = require('gulp-jshint');

var opt = {
  port: 3000,
  livereload: 31357
};

var paths = {
    scripts : [
        'src/API/Oda.js',
        'src/OdaApp.js',
        'src/API/partial/**/*',
        'src/partial/**/*'
    ],
    sources : [
        'src/API/css/**/*',
        'src/API/i8n/**/*',
        'src/API/img/**/*',
        'src/API/partial/**/*',
        'src/API/*',
        'src/css/**/*',
        'src/i8n/**/*',
        'src/img/**/*',
        'src/partial/**/*',
        'src/*'
    ],
    destLib : 'src/API/libs/'
};

/**
 * JsHint
 * Validate js script
 */
gulp.task('jshint', function() {
  return gulp.src(paths.scripts)
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

/**
 * bower task
 * Fetch bower dependencies
 */
gulp.task('bower', function() {
  return bower()
    .pipe(plumber())
    .pipe(gulp.dest(paths.destLib));
});

/**
 * Watch task
 * Launch a server with livereload
 */
gulp.task('watch', ['jshint'], function() {
    gulp
        .watch(paths.sources)
        .on('change', function() {
            gulp.src('').pipe(connect.reload());
        })
    ;

    gulp.watch(paths.scripts, ['jshint']);
});

/**
 * Server task
 */
gulp.task('server', ['bower'], function() {
  return connect.server({
    root: ['src', '.'],
    port: opt.port,
    livereload: true
  });
});

/**
 * Open task
 * Launch default browser on local server url
 */
gulp.task('open', function() {
  return gulp.src('src/index.html')
    .pipe(launch('', {
      url: 'http://localhost:'+opt.port+'/index.html'
    }));
});

gulp.task('dev', ['server', 'watch', 'open']);
