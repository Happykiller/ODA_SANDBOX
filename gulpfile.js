/* jshint node:true */

'use strict';

var gulp = require('gulp');
var bower = require('gulp-bower');
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var launch = require('gulp-open');
var plumber = require('gulp-plumber');

var opt = {
  port: 3000,
  livereload: 31357
};

var paths = {
    scripts : [
        'src/API/js/Oda.js',
        'src/js/OdaApp.js',
        'src/API/partials/**/*.js',
        'src/partials/**/*.js'
    ],
    sources : [
        'src/API/css/**/*',
        'src/API/i8n/**/*',
        'src/API/img/**/*',
        'src/API/partials/**/*',
        'src/API/js/**/*',
        'src/API/tests/**/*',
        'src/API/*',
        'src/js/**/*',
        'src/css/**/*',
        'src/i8n/**/*',
        'src/img/**/*',
        'src/partials/**/*',
        'src/js/**/*',
        'src/test/**/*',
        'src/*'
    ]
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
    bower({ directory: 'libs', cwd: './src/API' }).pipe(bower({ directory: 'libs', cwd: './src' }));
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
gulp.task('server', function() {
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

gulp.task('dev', ['bower', 'watch', 'server', 'open']);
