'use strict';

module.exports = function () {
	var nodeList = document.querySelectorAll('canvas');
	var nodes = Array.prototype.slice.call(nodeList);
	for (var i = 0; i < nodes.length; i++) {
		var canvas = nodes[i];
		canvas.style.backgroundImage = 'url("' + canvas.toDataURL('image/png') + '")';
	}
};
