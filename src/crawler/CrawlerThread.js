'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var smpl = require('smpl');

var Crawler = require('./Crawler');
var urlStore = require('../url/urlStore');

var CrawlerThread = function(config) {
	this.id = smpl.utils.uniq();
	
	console.log('[' + this.id + '] Starting CrawlerThread');
	this.nbCrawlers = 0;
	this.maxCrawlers = config.nbCrawlers || 1;
	this.userAgent = config.userAgent;
	
	require('node-phantom').create(this.phantomStarted.bind(this), {phantomPath:require('phantomjs').path});
};
util.inherits(CrawlerThread, EventEmitter);

CrawlerThread.prototype.phantomStarted = function(err, phantom) {
	if (err) throw err;
	
	this.phantom = phantom;
	if (this.doExit) {
		this.exit();
	} else {
		this.requestUrl();
	}
};

CrawlerThread.prototype.requestUrl = function() {
	if (!this.urlRequestRunning) {
		urlStore.getPage(this.startCrawling.bind(this));
		this.urlRequestRunning = true;
	}
};

CrawlerThread.prototype.startCrawling = function(url) {
	this.urlRequestRunning = false;
	
	this.nbCrawlers++;
	var crawler = new Crawler(this.phantom, {
		url: url,
		onComplete: this.crawlDone.bind(this),
		userAgent: this.userAgent,
		parentId: this.id
	});
	if (this.nbCrawlers < this.maxCrawlers) {
		this.requestUrl();
	}
};

CrawlerThread.prototype.crawlDone = function() {
	this.nbCrawlers--;
	if (this.nbCrawlers === 0) this.emit('idle');
	this.requestUrl();
};

CrawlerThread.prototype.isIdle = function() {
	return (this.nbCrawlers === 0);
};

CrawlerThread.prototype.exit = function() {
	console.log('[' + this.id + '] Exiting CrawlerThread');
	if (!this.phantom) {
		// We might exit before phantom had time to start (eg. crawling only one image)
		this.doExit = true;
	} else {
		this.phantom.exit();
	}
};

module.exports = CrawlerThread;
