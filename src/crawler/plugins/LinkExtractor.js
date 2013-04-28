'use strict';

var urlStore = require('../../url/urlStore');

var getUrls = function() {
	'use strict';
	
	var links = Array.prototype.slice.call(document.getElementsByTagName('a'));
	var urls = [];
	for (var i = 0; i < links.length; i++) {
		var link = links[i];
		var href = link.getAttribute('href');
		if (href && href !== '#') {
			urls.push(link.href);
		}
	}
	
	return urls;
};

var LinkExtractor = function(crawler) {
	this.crawler = crawler;
	crawler.exec(getUrls, this.onUrls.bind(this));
};

LinkExtractor.prototype.onUrls = function(urls) {
	for (var i = 0; i < urls.length; i++) {
		var url = {
			url: urls[i],
			level: this.crawler.config.url.level + 1
		};
		urlStore.add(url);
	}
};

module.exports = LinkExtractor;
