const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const runSequence = require('run-sequence');

const $ = gulpLoadPlugins();

const reload = browserSync.reload;


gulp.task('styles', () => {
  return gulp.src('app/src/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['last 2 versions'], cascade: false}))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp.src('app/src/js/**/*.js')
    .pipe($.plumber())
    .pipe($.babel())
    .pipe(gulp.dest('.tmp/js'))
    .pipe(reload({stream: true}));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', () => {
  runSequence(['clean'], ['styles', 'scripts'], () => {
    browserSync.init({
      notify: false,
      port: 8080,
      server: {
        baseDir: ['.tmp', 'app']
      }
    });

    gulp.watch([
      'app/*.html',
      'app/images/**/*'
    ]).on('change', reload);

    gulp.watch('app/src/styles/**/*.scss', ['styles']);
    gulp.watch('app/src/js/**/*.js', ['scripts']);
  });
});

gulp.task('serve:dist', ['default'], () => {
  browserSync.init({
    notify: false,
    port: 8080,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('minify-css', () => {
  return gulp.src('styles/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('html', ['styles', 'scripts'], () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if(/\.js$/, $.uglify({compress: {drop_console: true}})))
    .pipe($.if(/\.js$/, $.concat('all.js')))
    .pipe($.if(/\.css$/, $.cleanCSS({compatibility: 'ie8'})))
    .pipe($.if(/\.html$/, $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: {compress: {drop_console: true}},
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['html', 'images'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});
