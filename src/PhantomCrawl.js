'use strict';

var fs = require('fs');


var CrawlerThread = require('./crawler/CrawlerThread');
var RessourceCrawler = require('./crawler/RessourceCrawler');
var urlStore = require('./url/urlStore');
var urlToPath = require('./url/urlToPath');

var PhantomCrawl = function(config) {
	urlToPath.setBase(config.base || 'extract');
	
	urlStore.setFilters(config.urlFilters);
	config.urls.forEach(function(url) {
		urlStore.add({
			url: url,
			primary: true,
			level: 0
		});
	});
	if (urlStore.isEmpty()) throw new Error('no urls to crawl');
	
	if (config.maxDepth) require('./url/filters/level').setMaxLevel(config.maxDepth);
		
	var userAgent = config.userAgent || 'Mozilla/5.0 (PhantomCrawl/' + require('../package.json').version + '; bot) AppleWebKit/534.34(KHTML, like Gecko) Chrome/13.0.764.0';
	this.threads = [];
	var nbThreads = config.nbThreads || 1;
	while (nbThreads--) {
		var thread = new CrawlerThread({
			nbCrawlers: config.crawlerPerThread,
			userAgent: userAgent
		});
		thread.on('idle', this.checkFinish.bind(this));
		this.threads.push(thread);
	}
	var rc = new RessourceCrawler({
		userAgent: userAgent
	});
	rc.on('idle', this.checkFinish.bind(this));
	this.threads.push(rc);
};


PhantomCrawl.prototype.checkFinish = function() {
	for (var i = 0; i < this.threads.length; i++) {
		if (!this.threads[i].isIdle()) return;
	}
	if (!urlStore.isEmpty()) return;
	
	for (i = 0; i < this.threads.length; i++) {
		this.threads[i].exit();
	}
};

module.exports = PhantomCrawl;
