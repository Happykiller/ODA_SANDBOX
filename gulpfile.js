/* jshint node:true */

'use strict';

var gulp = require('gulp');
var connect = require('gulp-connect');
var launch = require('gulp-open');
var bower = require('gulp-bower');
var plumber = require('gulp-plumber');
var jshint = require('gulp-jshint');

var opt = {
  port: 3000,
  livereload: 31357
};

/**
 * JsHint
 * Validate js script
 */
gulp.task('jshint', function() {
  return gulp.src('client/**/*.js')
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
    .pipe(gulp.dest('bower_components'));
});

/**
 * Watch task
 * Launch a server with livereload
 */
gulp.task('watch', ['jshint'], function() {

  gulp
    .watch(['client/**/*.*'])
    .on('change', function() {
      gulp.src('').pipe(connect.reload());
    });

  gulp.watch(['client/**/*.js'], ['jshint']);

  gulp
    .watch(['client/index.html','client/OdaApp.js'])
    .on('change', function() {
      gulp.src('').pipe(connect.reload());
    });
});

/**
 * Server task
 */
gulp.task('server', ['bower'], function() {
  return connect.server({
    root: ['client', '.'],
    port: opt.port,
    livereload: true
  });
});

/**
 * Open task
 * Launch default browser on local server url
 */
gulp.task('open', function() {
  return gulp.src('client/index.html')
    .pipe(launch('', {
      url: 'http://localhost:'+opt.port+'/index.html'
    }));
});

gulp.task('dev', ['server', 'watch', 'open']);
