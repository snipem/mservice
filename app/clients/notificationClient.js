/**
 * M!service
 * Copyright(c) 2014-2017 Christopher Reitz.
 * MIT Licensed
 */
'use strict';

module.exports = function(log, httpClient, cache, scrapers) {
    return function(res, boardId, messageId, fn) {
        var url = httpClient.baseUrl + '?mode=messagenotification&brdid=' + boardId + '&msgid=' + messageId;
        var options = {
            uri: url,
            jar: res.jar
        };
        httpClient.get(res, options, function (html) {
            var error = null;
            if (scrapers.title(html) === httpClient.errors.maniacBoardTitles.error) {
                error = 'unknown';
                var maniacErrorMessage = scrapers.errorMessage(html);
                if (httpClient.errors.maniacMessages[maniacErrorMessage] !== undefined) {
                    error = httpClient.errors.maniacMessages[maniacErrorMessage];
                }
            }

            fn(null, error);
        });
    };
};
