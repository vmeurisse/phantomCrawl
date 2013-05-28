'use strict';

var http = require('http');
var https = require('https');
var urlModule = require('url');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var smpl = require('smpl');

var saveFile = require('./utils/saveFile');
var urlStore = require('../url/urlStore');
var urlType = require('../url/urlType');

var CrawlerThread = function(config) {
	this.config = config;
	this.requestUrl();
};
util.inherits(CrawlerThread, EventEmitter);

CrawlerThread.prototype.requestUrl = function() {
	if (!this.urlRequestRunning) {
		urlStore.getRessource(this.startCrawling.bind(this));
		this.urlRequestRunning = true;
	}
};

CrawlerThread.prototype.startCrawling = function(url) {
	this.urlRequestRunning = false;
	
	this.crawling = true;
	
	var id = smpl.utils.uniq();
	
	console.log('[' + id + '] crawling ressource ' + url.url);
	
	var req = urlModule.parse(url.url);
	req.headers = {
		'User-Agent': this.config.userAgent
	};
	
	var get = (url.url.slice(0, 5) === 'https') ? https.get : http.get;
	get(req, this.crawlDone.bind(this, id, url)).on('error', this.crawlDone.bind(this, id, 'error'));
};

CrawlerThread.prototype.crawlDone = function(id, url, res) {
	this.crawling = false;
	
	if (url === 'error') {
		console.log('[' + id + '] done (error ' + res.message + ')');
	} else if (res.statusCode >= 200 && res.statusCode < 300) {
		var mime = res.headers['content-type'];
		if (mime && urlType.isPageMime(mime)) {
			console.log('[' + id + '] done (bad type ' + mime + ')');
			url.mime = mime;
			urlStore.add(url, true);
		} else {
			console.log('[' + id + '] receiving ressource');
			res.setEncoding('binary');
			
			var data = '';
			res.on('data', function (chunk) {
				data += chunk;
			});
			res.on('end', function () {
				console.log('[' + id + '] done');
				saveFile(url.path, data, 'binary');
			});
		}
		
	} else if (res.statusCode >= 300 && res.statusCode < 400) {
		console.log('[' + id + '] done (redirect to ' + res.headers.location + ')');
		urlStore.add({
			url: res.headers.location,
			level: url.level
		});
	} else {
		console.log('[' + id + '] done (error ' + res.statusCode + ')');
	}
	
	this.emit('idle');
	this.requestUrl();
};

CrawlerThread.prototype.isIdle = function() {
	return (!this.crawling);
};

CrawlerThread.prototype.exit = function() {
};

module.exports = CrawlerThread;
