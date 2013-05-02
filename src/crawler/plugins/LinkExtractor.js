'use strict';

var path = require('path');

var urlStore = require('../../url/urlStore');
var urlToPath = require('../../url/urlToPath');

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

var replaceUrls = function() {
	'use strict';
	
	var urlMap = 'URL_MAP';
	
	var links = Array.prototype.slice.call(document.getElementsByTagName('a'));
	var urls = [];
	for (var i = 0; i < links.length; i++) {
		var link = links[i];
		var href = link.getAttribute('href');
		if (href && href !== '#') {
			var newValue = urlMap[href];
			if (newValue) {
				link.setAttribute('href', newValue);
			}
		}
	}
};

var LinkExtractor = function(crawler) {
	this.crawler = crawler;
	this.pagePath = path.dirname(crawler.config.url.path);
	
	this.urlMap = {};
	
	crawler.exec(getUrls, this.onUrls.bind(this), 1);
};

LinkExtractor.prototype.onUrls = function(urls) {
	for (var i = 0; i < urls.length; i++) {
		var url = {
			url: urls[i],
			level: this.crawler.config.url.level + 1
		};
		if (urlStore.isValid(url)) {
			this.addUrlMap(url.url);
			urlStore.add(url);
		}
	}
	
	var fn = replaceUrls.toString().replace("'URL_MAP'", JSON.stringify(this.urlMap));
	this.crawler.exec(fn, null, 5);
};

LinkExtractor.prototype.addUrlMap = function(url) {
	this.urlMap[url] = path.relative(this.pagePath, urlToPath.getPath(url));
};

module.exports = LinkExtractor;
