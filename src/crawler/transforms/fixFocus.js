'use strict';

module.exports = function() {
	var nodeList = document.querySelectorAll('[autofocus]');
	var nodes = Array.prototype.slice.call(nodeList);
	nodes.forEach(function(node) {
		node.removeAttribute('autofocus');
	});
	document.activeElement.setAttribute('autofocus', 'autofocus');
};
