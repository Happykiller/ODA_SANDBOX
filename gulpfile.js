var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
plugins.browserSync = require('browser-sync');

gulp.task('browser-sync', function() {
    plugins.browserSync.init({
        proxy: "localhost:80/chop/"
    });
    gulp.watch(["js/**/*","partials/**/*","i8n/**/*","css/**/*.css"], function(){
        plugins.browserSync.reload();
    });
});

gulp.task('scss', function () {
    gulp.src('css/**/*.scss')
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer({
            browsers: [
                "ie >= 9",
                "ie_mob >= 10",
                "ff >= 30",
                "chrome >= 34",
                "safari >= 7",
                "opera >= 23",
                "ios >= 7",
                "android >= 4.4",
                "bb >= 10"
            ]
        }))
        .pipe(gulp.dest('css/'));
});

gulp.task('watch',['scss'], function () {
    gulp.watch('css/**/*.scss' , ['scss']);
});