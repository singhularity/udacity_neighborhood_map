var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify'),
    gp_sourcemaps = require('gulp-sourcemaps');
    gp_connect = require('gulp-connect');

input  = {
    'javascript': '/Users/ssingh/WebstormProjects/neighborhoodmap/server/source/js/*',
    'javascript_vendor': '/Users/ssingh/WebstormProjects/neighborhoodmap/server/source/js/vendor/*'
};

gulp.task('connect', function() {
    gp_connect.server({
        root: ['client/views', 'client/dist'],
        port: 4000,
        middleware: function() {
            return [];
        }
    });
});

gulp.task('js-minall', function(){
    return gulp.src(input.javascript)
        .pipe(gp_sourcemaps.init())
        .pipe(gp_concat('concat.js'))
        .pipe(gulp.dest('/Users/ssingh/WebstormProjects/neighborhoodmap/client/dist'))
        .pipe(gp_rename('all.js'))
        .pipe(gp_uglify())
        .pipe(gp_sourcemaps.write('./'))
        .pipe(gulp.dest('/Users/ssingh/WebstormProjects/neighborhoodmap/client/dist'));
});

gulp.task('js-minall-vendor', function(){
    return gulp.src(input.javascript_vendor)
        .pipe(gp_sourcemaps.init())
        .pipe(gp_concat('concat_vendor.js'))
        .pipe(gulp.dest('/Users/ssingh/WebstormProjects/neighborhoodmap/client/dist'))
        .pipe(gp_rename('vendorall.js'))
        .pipe(gp_uglify())
        .pipe(gp_sourcemaps.write('./'))
        .pipe(gulp.dest('/Users/ssingh/WebstormProjects/neighborhoodmap/client/dist'));
});

gulp.task('watch', function() {
    gulp.watch(input.javascript, ['js-minall']);
    gulp.watch(input.javascript_vendor, ['js-minall-vendor']);
});

gulp.task('default', ['watch'], function(){});