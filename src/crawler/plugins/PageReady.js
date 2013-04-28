'use strict';

var PageReady = function(crawler) {
	this.crawler = crawler;
	
	this.nbRequests = 0;
	
	crawler.on('resourceRequested', this.onResourceRequested.bind(this));
	crawler.on('resourceReceived', this.onResourceReceived.bind(this));
	
	crawler.on('pageReady', this.stop.bind(this));
	crawler.on('close', this.stop.bind(this));
	
	this.hardTimeout = setTimeout(this.onTimeout.bind(this, true), 60000);
	this.pendingRequest = {};
};

PageReady.prototype.tick = function() {
	if (this.ticker !== undefined) clearTimeout(this.ticker);
	this.ticker = setTimeout(this.onTimeout.bind(this), 5000);
};

PageReady.prototype.onTimeout = function(hard) {
	this.ticker = null;
	if (this.status === 'loaded') return;
	if (hard === true || this.nbRequests === 0) {
		if (this.nbRequests !== 0) console.warn('[' + this.crawler.id + '] Hard timeout on ' + this.crawler.config.url.url, this.nbRequests, this.pendingRequest);
		this.stop();
		
		this.status = 'loaded';
		this.crawler.pageReady();
	}
};

PageReady.prototype.onResourceRequested = function (request) {
	this.pendingRequest[request.id] = request;
	this.nbRequests++;
	this.tick();
};

PageReady.prototype.onResourceReceived = function (response) {
	if(response.stage !== 'end') return;
	if (this.pendingRequest[response.id]) {
		delete this.pendingRequest[response.id];
		this.nbRequests--;
		this.tick();
	} else {
		console.log(response);
	}
};

PageReady.prototype.stop = function() {
	clearTimeout(this.ticker);
	clearTimeout(this.hardTimeout);
};

module.exports = PageReady;
