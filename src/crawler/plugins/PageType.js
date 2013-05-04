'use strict';

var urlStore = require('../../url/urlStore');
var urlType = require('../../url/urlType');

var PageType = function(crawler) {
	this.crawler = crawler;
	
	crawler.once('resourceRequested', (function(request) {
		this.initialResourceId = request.id;
	}).bind(this));
	this.onResourceReceived = this.onResourceReceived.bind(this);
	crawler.on('resourceReceived', this.onResourceReceived);
};

PageType.prototype.onResourceReceived = function (response) {
	if(response.stage !== 'end') return;
	
	if (response.id === this.initialResourceId) {
		this.crawler.removeListener('resourceReceived', this.onResourceReceived);
		if (response.contentType && !urlType.isPageMime(response.contentType)) {
			var url = this.crawler.config.url;
			url.mime = response.contentType;
			urlStore.add(url, true);
			this.crawler.close('Invalide mime ' + response.contentType);
		}
	}
};

module.exports = PageType;
