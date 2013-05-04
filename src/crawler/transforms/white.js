'use strict';

module.exports = function() {
	var walk = function(element) {
		var style = getComputedStyle(element);
		var pre = style && (style['white-space'] === 'pre');
		var children = element.childNodes;
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.nodeType === 3) { //text
				var txt = child.nodeValue;
				if (!pre && txt) {
					var trimed = txt.trim();
					if (!trimed.length) {
						child.nodeValue = txt.charAt(0);
					} else {
						if (/\s/.test(txt.charAt(0))) trimed = txt.charAt(0) + trimed;
						var last = txt.length - 1;
						if (/\s/.test(txt.charAt(last))) trimed = trimed + txt.charAt(last);
						child.nodeValue = trimed;
					}
				}
			} else if (child.nodeType !== 8) { // Comment
				walk(child);
			}
		}
	};
	walk(document.documentElement);
};
