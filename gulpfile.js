'use strict';

var gulp        = require('gulp');
var inject      = require('gulp-inject');
var useref      = require('gulp-useref');
var gulpIf      = require('gulp-if');
var uglify      = require('gulp-uglify');
var gutil       = require('gulp-util');
var cssnano     = require('gulp-cssnano');
var jshint      = require('gulp-jshint');
var jscs        = require('gulp-jscs');
var del         = require('del');
var watch       = require('gulp-watch');
var connect     = require('gulp-connect');
var runSequence = require('run-sequence');

// Search for js and css files created for injection in index.html
gulp.task('inject', function () {
  return gulp.src('index.html', {cwd: './app'})
    .pipe(inject(
      gulp.src('**/*.js', {cwd: './app', read: false}), {
        relative: true
      }))
    .pipe(inject(
      gulp.src('**/*.css', {cwd: './app', read: false}), {
        relative: true
      }))
    .pipe(gulp.dest('./app'));
});

// Compress into a single file the ones in between of blocks "build:xx" in index.html
gulp.task('compress', ['inject'], function () {
  return gulp.src('index.html', {cwd: './app'})
    .pipe(useref())
    .pipe(gulpIf('**/*.js', uglify({
      mangle: true
    }).on('error', gutil.log)))
    .pipe(gulpIf('**/*.css', cssnano()))
    .pipe(gulp.dest('./dist'));
});

// Copies the assets into the dist folder
gulp.task('copy:assets', function () {
  return gulp.src('assets*/**', {cwd: './app'})
    .pipe(gulp.dest('./dist'));
});

// Looks for code correctness errors in JS and prints them
gulp.task('jshint', function() {
  return gulp.src('**/*.js', {cwd: './app'})
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

// Looks for code style errors in JS and prints them
gulp.task('jscs', function () {
  return gulp.src('**/*.js', {cwd: './app'})
    .pipe(jscs())
    .pipe(jscs.reporter())
    .pipe(jscs.reporter('fail'));
});

// Cleans the dist folder
gulp.task('clean:dist', function () {
  return del('dist/**/*');
});

// Watch changes on application files
gulp.task('watch', function() {
  gulp.watch('**/*.css', {cwd: './app'}, ['inject']);
  gulp.watch('**/*.js', {cwd: './app'}, ['jshint', 'jscs', 'inject']);
  watch('**/*.html', {cwd: './app'})
    .pipe(connect.reload());
});

// Starts a development web server
gulp.task('server', function () {
  connect.server({
    root: './app',
    hostname: '0.0.0.0',
    port: 8080,
    livereload: true
  });
});

// Starts a server using the production build
gulp.task('server-dist', ['build'], function () {
  connect.server({
    root: './dist',
    hostname: '0.0.0.0',
    port: 8080
  });
});

// Production build
gulp.task('build', function (done) {
  runSequence('jshint', 'jscs', 'clean:dist', 'compress', 'copy:assets', done);
});

gulp.task('default', ['server', 'watch']);
