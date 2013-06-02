'use strict';

module.exports = function () {
	var charset = document.characterSet;
	var oldmeta = document.querySelectorAll('meta[http-equiv="Content-Type"], meta[charset]');
	Array.prototype.slice.call(oldmeta).forEach(function(meta) {
		meta.parentNode.removeChild(meta);
	});
	var meta = document.createElement('meta');
	meta.setAttribute('charset', charset);
	document.head.insertBefore(meta, document.head.firstElementChild);
};
