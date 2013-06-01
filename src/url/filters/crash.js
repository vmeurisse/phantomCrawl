'use strict';

var crash = {};

crash.filter = function(url) {
	return url.crashed <= 1;
};

module.exports = crash;
