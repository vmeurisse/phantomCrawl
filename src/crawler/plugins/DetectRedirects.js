'use strict';

var smpl = require('smpl');

var urlStore = require('../../url/urlStore');
var urlType = require('../../url/urlType');

var DetectRedirects = function(crawler) {
	this.crawler = crawler;
	
	crawler.once('resourceRequested', (function(request) {
		this.initialResourceId = request.id;
	}).bind(this));
	this.onResourceReceived = this.onResourceReceived.bind(this);
	crawler.on('resourceReceived', this.onResourceReceived);
};

DetectRedirects.prototype.onResourceReceived = function (response) {
	if(response.stage !== 'end') return;
	
	if (response.id === this.initialResourceId) {
		this.crawler.removeListener('resourceReceived', this.onResourceReceived);
		
		if (response.redirectURL) {
			var url = smpl.object.update({}, this.crawler.config.url);
			url.url = response.redirectURL;
			urlStore.add(url);
			this.crawler.close('Redirect to ' + response.redirectURL);
		}
	}
};

module.exports = DetectRedirects;
