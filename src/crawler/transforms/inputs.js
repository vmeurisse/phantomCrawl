'use strict';

module.exports = function() {
	var nodeList = document.querySelectorAll('input, textarea');
	var nodes = Array.prototype.slice.call(nodeList);
	for (var i = 0; i < nodes.length; i++) {
		var input = nodes[i];
		input.setAttribute('value', input.value);
	}
	
	nodeList = document.querySelectorAll('select');
	nodes = Array.prototype.slice.call(nodeList);
	for (i = 0; i < nodes.length; i++) {
		var select = nodes[i];
		for (var j = 0; j < select.options.length; j++) {
			var option = select.options[j];
			if (option.selected) option.setAttribute('selected', 'selected');
			else option.removeAttribute('selected');
		}
		
	}
};
