'use strict';

var smpl = require('smpl');

var PAGE_EXT = smpl.data.index(['html', 'xhtml', 'htm', 'php', '']);
var PAGE_MIME = smpl.data.index(['text/html', 'application/xhtml+xml']);

var urlType = {};

/**
 * @param url {Object}
 * @param url.url {string} Url of the ressource. Used for extention detection if mime is not provided
 * @param [url.mime] {string} Mime type of the content if known. Used for accurate type detection
 * @return {boolean} `true` if the url is likely to point an html page
 */
urlType.isPage = function(url) {
	if (url.mime) return urlType.isPageMime(url.mime);
	return urlType.isPageUrl(url.url);
};

urlType.isPageMime = function(mime) {
	mime = mime && mime.split(';')[0];
	return mime in PAGE_MIME;
};

urlType.isPageExt = function(ext) {
	return ext in PAGE_EXT;
};

urlType.isPageUrl = function(url) {
	var path = require('url').parse(url).pathname;

	var slash = path.lastIndexOf('/');
	if (slash !== -1) path = path.slice(slash + 1);

	var semicolon = path.lastIndexOf(';');
	if (semicolon !== -1) path = path.slice(0, semicolon);

	var dot = path.lastIndexOf('.') + 1 || path.length;
	path = path.slice(dot);
	
	return urlType.isPageExt(path);
};

module.exports = urlType;
