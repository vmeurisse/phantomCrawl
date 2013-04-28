'use strict';

var level = {};
level.maxLevel = 0;

level.setMaxLevel = function(maxLevel) {
	level.maxLevel = maxLevel;
};

level.filter = function(url) {
	return url.level <= level.maxLevel;
};

module.exports = level;
