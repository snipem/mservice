/**
 * mService
 * net service for mClient, iPad client for famous man!ac forum
 * 
 * Copyright (c) 2012 Christopher Reitz
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in 
 * the Software without restriction, including without limitation the rights to 
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do 
 * so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all 
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
 * SOFTWARE.
 */

// libraries
var $ = require('cheerio');
var sys = require('sys');
var http = require('http');

/**
 * gets man!ac ressorce with given action
 */
var get = function(action, url) {
	http.get(url, function(response) {
		//console.log(response);
		var html = [];

		response.on('data', function (chunk) {
			html.push(chunk);
			//console.log("" + chunk);
		});

		// when respond ends execute action 
		response.on('end', function () {
			action(html.join());
		});
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
	});  	

};

var cleanManiacStuff = function(text) {
	return text.replace(/[\t\r\n]/g, '').replace(/^\s+|\s+$/g, '');
};


/**
 * boards action, fetches man!ac board list
 */
var boards = function (html) {
	var boardList = [];

	$(html).find('div table tr.bg2 td#norm:nth-child(2) a').each(function () {
		var $a = $(this);
		var href = $a.attr('href');
		var hrefSearch = '?mode=board&brdid=';
		if (href.indexOf(hrefSearch) != -1) {
			var board = {};			
			board.id = href.substring(href.indexOf(hrefSearch) + hrefSearch.length);
			board.text = $a.html();

			boardList.push(board);			
		}
	});

	console.log(boardList);
};

/**
 * threads action, fetches a man!ac thread list
 */
var threads = function (html) {
	var threadList = [];
	var threads = $(html).find('body p').html().split('<br/>');

	for(var i in threads) {
		// Ignore empty lines TODO
		if (threads[i].length < 500)  {
			continue;
		}

		var $thread = $(threads[i]);
		var $threadData = $thread.text().split("\n\r")

		// threads id
		var id = '';
		var url = $($thread.find('a').get(1)).attr('href');
		if (url !== undefined) {
		  	id = url.substring(41)
		}
		
		// threads subject
		var subject = cleanManiacStuff($threadData[0]);
		subject = subject.substring(0, subject.length - 2);
		
		// threads subject
		var author = '';
		if ($threadData[1] !== undefined) {
			author = cleanManiacStuff($threadData[1]);
		}
		
		// threads date
		var date = ''; 
		
		// threads answer count 
		var answerCount = ''; 

		// threads date of last answer
		var answerDate  = '';
		if ($threadData[2] !== undefined) {
			date        = cleanManiacStuff($threadData[2]).substring(3, 17);
			answerCount = cleanManiacStuff($threadData[2]).substring(30, 35).replace(/\D/g, '');
			answerDate  = cleanManiacStuff($threadData[2]).substring(42, 60);
		}

		// adding thread to list
		threadList.push({
			id: id,
			author: author,
			subject: subject,
			date: date,
			answerCount: answerCount,
			answerDate: answerDate
		});
	}

	console.log(threadList);
};

var boardsUrl  = 'http://maniac-forum.de/forum/pxmboard.php';
var threadsUrl = 'http://maniac-forum.de/forum/pxmboard.php?mode=threadlist&brdid=6'; // &sort=last&x=13&y=3

get(threads, threadsUrl);
//get(boards, boardsUrl);