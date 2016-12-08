Revises the version of the resource referenced in the html.

- Works with: [gulp-hash-list](https://github.com/zzyss86/gulp-hash-list)
- Author: JsonZhou
- Author Blog: [http://www.2fz1.com/](http://www.2fz1.com/)

## Install

	npm install --save-dev gulp-asset-revision
	
## Usage

	var gulp = require('gulp');
	var hash = require('gulp-hash-list');
	var revision = require('gulp-asset-revision');
	
	gulp.task('hash', function() {
	    return gulp.src(['./src/**/*.js','./src/**/*.css'])
	        .pipe(hash({
	            "template": "{name}{ext}?hash={hash}"
	        }))
	        .pipe(gulp.dest('./dist'))
	        .pipe(hash.manifest('assets.json'))
	        .pipe(gulp.dest('./manifest'));
	});
	
	gulp.task('revision', ['hash'], function() {
	    return gulp.src(['./manifest/assets.json','./pages/*.html'])
	        .pipe(revision({
	            hasSuffix: false,
	            manifest: './manifest/assets.json'
	        }))
	        .pipe(gulp.dest('./pages/'));
	});
	
## API

### revision(options)

|option|default|description|
|---|---|---|
|manifest||**Required**, asset manifest file path|
|hasSuffix|false|If true,path matching will add `pathSuffix` |
|pathSuffix|-[0-9a-f]{8,10}|Support regular|

## hasSuffix和pathSuffix的说明

当路径不是`{name}{ext}?param=value`形式时，`gulp-asset-revision`在扫描文件引用地址时，无法正确匹配地址，比如：`{name}-{hash}{ext}`



