'use strict';

var PhantomCrawl = require('./PhantomCrawl');


var urls = [];

urls.push('http://www.bing.com');
var ptc = new PhantomCrawl({
	urls: urls,
	nbThreads: 4,
	crawlerPerThread: 4,
	maxDepth: 1
});

