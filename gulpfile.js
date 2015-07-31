var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify'),
    gp_sourcemaps = require('gulp-sourcemaps');

input  = {
    'javascript': '/Users/ssingh/WebstormProjects/neighborhoodmap/server/source/js/*'
};


gulp.task('js-minall', function(){
    return gulp.src(input.javascript)
        .pipe(gp_sourcemaps.init())
        .pipe(gp_concat('concat.js'))
        .pipe(gulp.dest('/Users/ssingh/WebstormProjects/neighborhoodmap/client/dist'))
        .pipe(gp_rename('all.min.js'))
        .pipe(gp_uglify())
        .pipe(gp_sourcemaps.write('./'))
        .pipe(gulp.dest('/Users/ssingh/WebstormProjects/neighborhoodmap/client/dist'));
});


gulp.task('watch', function() {
    gulp.watch(input.javascript, ['js-minall']);
});

gulp.task('default', ['watch'], function(){});