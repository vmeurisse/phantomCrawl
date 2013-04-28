'use strict';

var fs = require('fs');
var pathModule = require('path');

var nodeFs = require('node-fs');

var saveFile = function(path, content, encoding) {
	nodeFs.mkdir(pathModule.dirname(path), parseInt('0777', 8), true, function() {
		fs.writeFile(path, content, encoding, function(err){
            if (err) throw err;
        });
	});
};

module.exports = saveFile;
