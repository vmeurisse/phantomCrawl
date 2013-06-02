'use strict';

var fs = require('fs');


var CrawlerThread = require('./crawler/CrawlerThread');
var RessourceCrawler = require('./crawler/RessourceCrawler');
var urlStore = require('./url/urlStore');
var urlToPath = require('./url/urlToPath');

/**
 * @class PhantomCrawl
 * @constructor
 *
 * @param config {Object}
 * @param config.urls {Array.string} Urls to crawl
 * @param [config.base='extract'] {string} path of the folder to store extracts
 * @param [config.urlFilters] {Array}
 * @param [config.maxDepth=0] {integer}
 * @param [config.useragent] {string}
 * @param [config.nbThreads=1] {integer}
 * @param [config.crawlerPerThread=1] {integer}
 * @param [config.pageTransform] {Array}
 * @param [config.plugins] {Array}
 * @param [config.phantomPath] {String} Path of the phantom executable. Default is to use the bundled phantomjs.
 */
var PhantomCrawl = function(config) {
	this.config = config;
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
		
	config.userAgent = config.userAgent || 'Mozilla/5.0 (PhantomCrawl/' + require('../package.json').version + '; bot) AppleWebKit/534.34(KHTML, like Gecko) Chrome/13.0.764.0';
	this.threads = [];
	var nbThreads = config.nbThreads || 1;
	while (nbThreads--) {
		this.startThread();
	}
	var rc = new RessourceCrawler({
		userAgent: config.userAgent
	});
	rc.on('idle', this.checkFinish.bind(this));
	this.threads.push(rc);
};

PhantomCrawl.prototype.startThread = function(crashRecover) {
	var thread = new CrawlerThread({
		crashRecover: crashRecover,
		nbCrawlers: crashRecover ? 1 : this.config.crawlerPerThread,
		userAgent: this.config.userAgent,
		pageTransform: this.config.pageTransform,
		plugins: this.config.plugins,
		phantomPath: this.config.phantomPath
	});
	thread.on('idle', this.checkFinish.bind(this));
	thread.on('crash', this.threadCrash.bind(this, thread));
	this.threads.push(thread);
	
};

PhantomCrawl.prototype.threadCrash = function(thread) {
	this.threads = this.threads.filter(function(t) {
		return t !== thread;
	});
	this.startThread(thread.crashRecover);
	if (!this.hasCrashRecoverThread) {
		this.hasCrashRecoverThread = true;
		this.startThread(true);
	}
};

PhantomCrawl.prototype.checkFinish = function() {
	for (var i = 0; i < this.threads.length; i++) {
		if (!this.threads[i].isIdle()) return;
	}
	if (!urlStore.isEmpty()) return;
	
	console.log('Crawl done. Exiting');
	for (i = 0; i < this.threads.length; i++) {
		this.threads[i].exit();
	}
};

module.exports = PhantomCrawl;
