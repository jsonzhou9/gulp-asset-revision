var gutil = require('gulp-util'),
    PluginError = gutil.PluginError,
    assign = require('lodash.assign'),
    through2 = require('through2'),
    path = require('path');

var PluginName = 'gulp-asset-revision';

function getManifestData(manifest){
    var manifestData = require(manifest);
    if(manifestData){
        return manifestData;
    }else{
        return null;
    }
}

/**
 * Escape character：- [ ] { } ( ) * + ? . ^ $ | / \
 * Add \
 * "{}" => "\{\}"
 * */
function escPathPattern(pattern) {
    return pattern.replace(/[\-\[\]\{\}\(\)\*\+\?\.\^\$\|\/\\]/g, "\\$&");
}

function closeDirBySep(dirname) {
    return dirname + (!dirname || new RegExp( escPathPattern('/') + '$' ).test(dirname) ? '' : '/');
}

/**
 * Main function
 * */
function revision(options){
    options = assign({}, {
        pathSuffix: '-[0-9a-f]{8,10}'
    }, options);

    if(!options.manifest){
        return through2.obj(function(file,encoding,done){
            done(new PluginError(PluginName, 'options mast set manifest'),file);
        });
    }else if(!options.manifest.endsWith('.json')){
        return through2.obj(function(file,encoding,done){
            done(new PluginError(PluginName, 'manifest must be JSON file'),file);
        });
    }

    var manifest = getManifestData(path.join(process.cwd(),options.manifest));

    return through2.obj(function(file, encoding, done) {
        if (file.isDirectory() || file.isNull() || !manifest) {
            done(null, file);
            return;
        }

        var changes = [];

        for (var originalPath in manifest) {
            var patterns = [escPathPattern(originalPath)];
            var hashPath = manifest[originalPath];
            if(options.hasSuffix){
                patterns.push( escPathPattern( (path.dirname(originalPath) === '.' ? '' : closeDirBySep(path.dirname(originalPath)) ) + path.basename(originalPath, path.extname(originalPath)) )
                    + options.pathSuffix
                    + escPathPattern( path.extname(originalPath) )
                );
            }

            patterns.forEach(function(pattern){
                changes.push({
                    regexp: new RegExp( '([\/\\\\\'"\(])' + pattern+'([^\'^\"^\)]*)([\'\"\)])', 'g' ),
                    replacement: '$1' + hashPath + '$3'
                });
            });
        }

        var src = file.contents.toString('utf8');
        changes.forEach(function (changeItem) {
            src = src.replace(changeItem.regexp, changeItem.replacement);
        });

        file.contents = new Buffer(src);
        done(null,file);
    });
}

module.exports = revision;