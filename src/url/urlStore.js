'use strict';

var urlModule = require('url');

var smpl = require('smpl');

var urlToPath = require('./urlToPath');
var urlType = require('./urlType');

var DEFAULT_FILTERS = ['domain', 'level'];
var STANDARD_FILTERS = {
	'domain': './filters/domain',
	'level': './filters/level'
};

var urlStore = {
	urlMap: {},
	urlPages: [],
	urlRessources: [],
	cbPages: [],
	cbRessources: [],
	ongoingCallbacks: []
};

urlStore.setFilters = function(filters) {
	filters = filters || DEFAULT_FILTERS;
	
	for (var i = 0; i < filters.length; i++) {
		var filter = filters[i];
		if (typeof filter === 'string') {
			filter = STANDARD_FILTERS[filter] || filter;
			filters[i] = require(filter);
		}
	}
	
	this.urlFilters = filters;
};

/**
 * Add an url to the list of URLs to crawl
 * 
 * @param url {Object} Url to add
 * @param url.url {String} Url to add
 * @param url.level {number}
 * @param [url.mime] {String} If mime type is known, it need to be set
 * @param force {boolean} Set it to true if ressubmiting an url that had the wrong type. `url.mime` is mandatory in that case
 */
urlStore.add = function(url, force) {
	this.normalise(url);
	if ((force || !this.urlMap[url.path]) && this.isValid(url)) {
		var type = urlType.isPage(url) ? 'Pages' : 'Ressources';
		this.urlMap[url.path] = type;
		
		var cb = this['cb' + type];
		if (cb.length) {
			this.call(cb.shift(), url, type);
		} else {
			var list = this['url' + type];
			list.push(url);
		}
		return true;
	}
	return false;
};

urlStore.isValid = function(url) {
	for (var i = 0; i < this.urlFilters.length; i++) {
		if (!this.urlFilters[i].filter(url)) return false;
	}
	return true;
};

urlStore.normalise = function(url) {
	url.url = urlModule.format(urlModule.parse(url.url));
	url.path = urlToPath.getPath(url.url);
	url.level = url.level || 0;
	url.primary = url.primary || false;
	url.mime = url.mime || undefined;
};

urlStore.getPage = function(cb) {
	this.get('Pages', cb);
};

urlStore.cancelGetPage = function(cb) {
	this.cancelGet('Pages', cb);
};

urlStore.getRessource = function(cb) {
	this.get('Ressources', cb);
};

/**
 * @private
 */
urlStore.get = function(type, cb) {
	var list = this['url' + type];
	if (list.length) {
		var url = list.splice(smpl.number.randomInt(0, list.length), 1)[0];
		this.call(cb, url, type);
	} else {
		var cbList = this['cb' + type];
		cbList.push(cb);
	}
};

/**
 * @private
 */
urlStore.cancelGet = function(type, callback) {
	var cbList = this['cb' + type];
	this['cb' + type] = this['cb' + type].filter(function(cb) {
		return cb !== callback;
	});
	this.ongoingCallbacks = this.ongoingCallbacks.filter(function(cb) {
		return cb[0] !== callback || cb[2] !== type;
	});
};

urlStore.isEmpty = function() {
	return this.urlRessources.length + this.urlPages.length + this.ongoingCallbacks.length === 0;
};

/**
 * @private
 */
urlStore.call = function(cb, url, type) {
	this.ongoingCallbacks.push([cb, url, type]);
	if (this.ongoingCallbacks.length === 1) {
		(global.setImmediate || process.nextTick)((function() { //setImmediate introduced in node 0.10
			var cb;
			while (cb = this.ongoingCallbacks.shift()) {
				cb[0](cb[1]);
			}
		}).bind(this));
	}
};

module.exports = urlStore;
