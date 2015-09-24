import gulp from 'gulp'
import gulpPlumberNotifier from 'gulp-plumber-notifier'
import gulpBabel from 'gulp-babel'

gulp.task('dev', devTask)
gulp.task('babel', babelTask)

function devTask() {
  gulp.watch('./src/**/*.js', ['babel'])
}

function babelTask() {
  return gulp.src('./src/**/*.js')
  .pipe(gulpPlumberNotifier())
  .pipe(gulpBabel({
    modules: 'umd',
    optional: ['runtime'],
  }))
  .pipe(gulp.dest('./dist'))
}
