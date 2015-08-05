var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify'),
    gp_sourcemaps = require('gulp-sourcemaps');

var jsPath = __dirname + '/server/source/js/';

input  = {
    'javascript': [jsPath + 'map_marker.js',jsPath + 'navview.js', jsPath + 'main.js']
};

gulp.task('js-minall', function(){
    return gulp.src(input.javascript)
        .pipe(gp_sourcemaps.init())
        .pipe(gp_concat('concat.js'))
        .pipe(gulp.dest(__dirname + '/client/dist'))
        .pipe(gp_rename('all.min.js'))
        .pipe(gp_uglify())
        .pipe(gp_sourcemaps.write('./'))
        .pipe(gulp.dest(__dirname + '/client/dist'));
});

gulp.task('watch', function() {
    gulp.watch(input.javascript, ['js-minall']);
});

gulp.task('default', ['watch'], function(){});