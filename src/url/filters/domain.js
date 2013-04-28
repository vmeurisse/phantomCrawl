'use strict';

var urlModule = require('url');

var domain = {};
domain.primaryDomains = {};

domain.addPrimary = function(url) {
	url = urlModule.parse(url.url);
	domain.primaryDomains[url.hostname] = true;
};

domain.filter = function(url) {
	if (url.primary) {
		domain.addPrimary(url);
		delete url.primary;
	}
	url = urlModule.parse(url.url);
	return url.hostname in domain.primaryDomains;
};

module.exports = domain;
