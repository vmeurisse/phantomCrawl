/* globals task: false, fail: false, complete: false */ // Globals exposed by jake
'use strict';

var smplBuild = require('smpl-build-test');

var callback = function(err) {
	if (err) fail(err);
	else complete();
};

task('doc', [], {async: true}, function() {
	smplBuild.document({
		paths: [__dirname + '/src'],
		outdir: __dirname + '/docs',
		basePath: __dirname,
		project: {
			dir: __dirname
		}
	}, callback);
});