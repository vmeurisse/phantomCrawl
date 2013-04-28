'use strict';

module.exports = function() {
	for (var i = 0; i < document.styleSheets.length; i++) {
		var styleSheet = document.styleSheets[i];
		if (styleSheet.cssRules && !styleSheet.href) {
			var cssText = '';
			var rules = styleSheet.cssRules;
			for (var j = 0; j < rules.length; j++) {
				var rule = rules[j];
				if (rule.type !== 1) cssText += rule.cssText;
				else {
					try {
						if (document.querySelector(rule.selectorText)) {
							cssText += rule.cssText;
						}
					} catch(e) {
						// some rules ("::-moz-focus-inner") make document.querySelector throw
						// I'm not sure why they are returned by styleSheet.cssRules. Might need more investigation
					}
				}
			}
			var node = styleSheet.ownerNode;
			if (!cssText) node.innerHTML = '';
			else if (cssText.length < node.innerHTML.length) node.innerHTML = cssText;
		}
	}
};
