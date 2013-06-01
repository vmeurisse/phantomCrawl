'use strict';

/**
 * Clean the page from any JS that could interfere with the resulting snapshot.
 * Keeping the JS could have all sort of unexpected behaviour when reopening the page
 *
 * @module cleanJs
 */
module.exports = function() {
	var nodeList = document.querySelectorAll('*');
	var nodes = Array.prototype.slice.call(nodeList);
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		if (node.nodeName === 'SCRIPT') {
			node.parentNode.removeChild(node);
			continue;
		}
		var attributes = Array.prototype.slice.call(node.attributes);
		for (var j = 0; j < attributes.length; j++) {
			var attribute = attributes[j];
			var name = attribute.name;
			if (name.slice(0, 2) === 'on') {
				node.removeAttribute(name);
			} else if ((name === 'href' || name === 'src') && attribute.value.slice(0, 11) === 'javascript:') {
				node.removeAttribute(name);
			}
		}
	}
};
