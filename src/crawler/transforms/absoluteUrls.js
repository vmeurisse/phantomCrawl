'use strict';

module.exports = function () {
	var nodeList = document.querySelectorAll('*');
	var nodes = Array.prototype.slice.call(nodeList);
	
	var handleStyle = function(style) {
		return style.replace(/url\((['"]?)(.*?)\1\)/g, function(a, quote, url) {
			quote = quote || '"';
			a = document.createElement('a');
			a.href = url;
			url = a.href;
			return 'url(' + quote + url + quote + ')';
		});
	};
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		var attributes = Array.prototype.slice.call(node.attributes);
		for (var j = 0; j < attributes.length; j++) {
			var attribute = attributes[j];
			var name = attribute.name;
			var value = attribute.value;
			if (name === 'href' || name === 'src') {
				if (!value || value === '#') continue;
				node.setAttribute(name, node[name]);
			}
			if (name === 'style') {
				node.setAttribute(name, handleStyle(value));
			}
		}
		if (node.nodeName === 'STYLE') {
			node.innerHTML = handleStyle(node.innerHTML);
		}
	}
};
