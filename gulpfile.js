const gulp = require('gulp');
const concat = require('gulp-concat'); // 合并文件
const rename = require('gulp-rename'); // 重命名
const uglify = require('gulp-uglify'); // 压缩js
const gutil = require('gulp-util');
const less = require('gulp-less'); // less转换为css
const cssClean = require('gulp-clean-css'); // 压缩css
const htmlMin = require('gulp-htmlmin'); // 压缩HTML
const watch = require("gulp-watch"); // 监测文件
const livereload = require('gulp-livereload'); // 半自动热更新
const connect = require('gulp-connect'); // 创建本地服务
const open = require('open'); // 自动打开浏览器
const postcss = require('gulp-postcss'); 
const autoprefixer = require('autoprefixer'); // 自动添加浏览器前缀
const babel = require('gulp-babel'); // es6兼容处理
const imagemin = require('gulp-imagemin'); // 压缩图片

gulp.task('js', () => {
	return gulp.src('src/js/*.js')
		.pipe(babel({ presets: ['es2015'] }))
		.pipe(concat('build.js'))  // 合并文件
		.pipe(gulp.dest('dist/js/')) // 输出
		.pipe(uglify())  // 压缩文件
		.on('error', function(err) {
			gutil.log(gutil.colors.red('[Error]'), err.toString());
		})
		.pipe(rename({ suffix: '.min' })) // 重命名
		.pipe(gulp.dest('dist/js/'))
		.pipe(livereload()) // 实时刷新
		.pipe(connect.reload())
});

gulp.task('less', () => {
	return gulp.src('src/less/*.less')
	.pipe(less())
	.pipe(gulp.dest('src/css/'))
	.pipe(livereload())
	.pipe(connect.reload())
})

gulp.task('css', gulp.series('less', () => {
	const plugins = [
		autoprefixer({ overrideBrowserslist: ['last 3 version', '> 5%', 'ie 8'] })
	]
	return gulp.src('src/css/*.css')
	.pipe(concat('build.css'))
	.pipe(rename({suffix: '.min'}))
	.pipe(cssClean({ compatibility: 'ie8' }))
	.pipe(postcss(plugins))
	.pipe(gulp.dest('dist/css/'))
	.pipe(livereload())
	.pipe(connect.reload())
}))

gulp.task('html', () => {
	return gulp.src('index.html')
	.pipe(htmlMin({ collapseWhitespace: true }))
	.pipe(gulp.dest('dist/'))
	.pipe(livereload())
	.pipe(connect.reload())
})

gulp.task('imageMin', () => {
	return gulp.src('src/image/*')
	.pipe(imagemin())
	.pipe(gulp.dest('dist/image/'))
})

gulp.task('default', gulp.series('html', 'js', 'css', 'less', done => done()));

// 半自动监听
gulp.task('watch', gulp.series('default', () => {
	// 开始监听
	livereload.listen();
	// 监听文件
	watch(['src/js/*.js'], gulp.parallel('js', () => {}));
	watch(['src/css/*.css', 'src/less/*.less'], gulp.parallel('css', () => {}));
}))

// 全自动监听
gulp.task('server', gulp.series('default', () => {
	connect.server({
		root: 'dist/',
		livereload: true,
		port: 3000
	})
	// 监听文件
	watch(['src/js/*.js'], gulp.series('js', () => {}));
	watch(['src/css/*.css', 'src/less/*.less'], gulp.series('css', () => {}));
	open('http://localhost:3000/');
}))