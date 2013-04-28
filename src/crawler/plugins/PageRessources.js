'use strict';

var path = require('path');

var urlStore = require('../../url/urlStore');
var urlToPath = require('../../url/urlToPath');

var contentFunction = function () {
	'use strict';
	
	var nodeList = document.querySelectorAll('*');
	var nodes = Array.prototype.slice.call(nodeList);
	
	var urlMap = 'URL_MAP';
	
	var handleStyle = function(style) {
		return style.replace(/url\((['"]?)(.*?)\1\)/g, function(a, quote, url) {
			quote = quote || '"';
			url = urlMap[url] || url;
			return 'url(' + quote + url + quote + ')';
		});
	};
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		var attributes = Array.prototype.slice.call(node.attributes);
		for (var j = 0; j < attributes.length; j++) {
			var attribute = attributes[j];
			var name = attribute.name;
			var value = attribute.value;
			if (name === 'href' || name === 'src') {
				if (value === '#' || value === '') continue;
				var newValue = urlMap[value];
				if (newValue) {
					node.setAttribute(name, newValue);
				}
			}
			if (name === 'style') {
				node.setAttribute(name, handleStyle(value));
			}
		}
		if (node.nodeName === 'STYLE') {
			node.innerHTML = handleStyle(node.innerHTML);
		}
	}
};

var PageRessources = function(crawler) {
	this.crawler = crawler;
	this.pagePath = path.dirname(this.crawler.config.url.path);
	
	this.urlMap = {};

	crawler.on('resourceReceived', this.onResourceReceived.bind(this));
	crawler.on('pageReady', this.onPageReady.bind(this));
};

PageRessources.prototype.onResourceReceived = function (response) {
	if(response.stage !== 'end') return;
	if (!response.redirectURL) {
		var url = {
			url: response.url,
			mime: response.contentType,
			level: this.crawler.config.url.level
		};
		if (urlStore.isValid(url)) {
			this.addUrlMap(response.url);
			urlStore.add(url);
		}
	}
};

PageRessources.prototype.addUrlMap = function(url) {
	this.urlMap[url] = path.relative(this.pagePath, urlToPath.getPath(url));
};

PageRessources.prototype.onPageReady = function(url) {
	var fn = contentFunction.toString().replace("'URL_MAP'", JSON.stringify(this.urlMap));
	this.crawler.exec(fn);
};

module.exports = PageRessources;
